import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import {
  copyMediaFile,
  getFileMimetype,
  getFileStats,
  fileExists,
  logger,
} from '../utils';
import type { MediaFolderMap, MediaFileMap } from '../types';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const MEDIA_SOURCE_DIR = path.join(__dirname, '../../data/media');
const UPLOAD_TARGET_DIR = path.join(__dirname, '../../../../apps/api/uploads');

// Media folders to create
const MEDIA_FOLDERS = ['Kontakte', 'Abteilungen', 'Standorte', 'Logos'];

// Source directory to folder mapping
const SOURCE_DIR_TO_FOLDER: Record<string, string> = {
  'contact-persons': 'Kontakte',
  'department-icons': 'Abteilungen',
  'locations': 'Standorte',
  'logos': 'Logos',
};

/**
 * Seed media folders with idempotency
 */
export async function seedMediaFolders(pgClient: Client): Promise<MediaFolderMap> {
  const spinner = ora('Seeding media folders...').start();

  try {
    const folderMap: MediaFolderMap = new Map();

    for (const folderName of MEDIA_FOLDERS) {
      // Check if folder exists
      const existingFolder = await pgClient.query(
        `SELECT id FROM "MediaFolder" WHERE "name" = $1 AND "parentId" IS NULL`,
        [folderName],
      );

      let folderId: number;
      if (existingFolder.rows.length > 0) {
        // Use existing folder
        folderId = existingFolder.rows[0].id;
      } else {
        // Create new folder
        const result = await pgClient.query(
          `INSERT INTO "MediaFolder" ("name", "createdAt", "updatedAt")
           VALUES ($1, NOW(), NOW())
           RETURNING id`,
          [folderName],
        );
        folderId = result.rows[0].id;
      }

      folderMap.set(folderName, folderId);
    }

    spinner.succeed(`Seeded ${folderMap.size} media folders`);
    return folderMap;
  } catch (error) {
    spinner.fail('Failed to seed media folders');
    throw error;
  }
}

/**
 * Seed media files from source directories
 */
export async function seedMediaFiles(
  pgClient: Client,
  folderMap: MediaFolderMap,
): Promise<MediaFileMap> {
  const spinner = ora('Seeding media files...').start();

  try {
    const mediaMap: MediaFileMap = new Map();
    let copiedCount = 0;
    let skippedCount = 0;

    // Process each source directory
    for (const [sourceDir, folderName] of Object.entries(SOURCE_DIR_TO_FOLDER)) {
      const folderId = folderMap.get(folderName);
      if (!folderId) {
        logger.warning(`Folder not found: ${folderName}`);
        continue;
      }

      const sourcePath = path.join(MEDIA_SOURCE_DIR, sourceDir);

      // Check if source directory exists
      if (!(await fileExists(sourcePath))) {
        logger.warning(`Source directory not found: ${sourcePath}`);
        continue;
      }

      // Read all files in source directory
      const files = await fs.readdir(sourcePath);

      for (const originalFilename of files) {
        const sourceFilePath = path.join(sourcePath, originalFilename);

        // Skip if not a file
        const stats = await fs.stat(sourceFilePath);
        if (!stats.isFile()) {
          continue;
        }

        try {
          // Generate UUID-based filename (preserve extension)
          const ext = path.extname(originalFilename).toLowerCase();
          const uniqueFilename = `${uuidv4()}${ext}`;
          const targetFilePath = path.join(UPLOAD_TARGET_DIR, uniqueFilename);

          // Get file metadata
          const mimetype = getFileMimetype(originalFilename);
          const fileStats = await getFileStats(sourceFilePath);
          const relativePath = `/uploads/${uniqueFilename}`;

          // Check if media already exists in database by originalName (for idempotency)
          const existingMedia = await pgClient.query(
            `SELECT id FROM "Media" WHERE "originalName" = $1 AND "folderId" = $2`,
            [originalFilename, folderId],
          );

          if (existingMedia.rows.length > 0) {
            // Already exists, use existing ID
            const mediaId = existingMedia.rows[0].id;
            mediaMap.set(originalFilename, mediaId);
            skippedCount++;
            continue;
          }

          // Copy file to uploads directory
          await copyMediaFile(sourceFilePath, targetFilePath);

          // Insert into Media table
          const result = await pgClient.query(
            `INSERT INTO "Media" ("filename", "originalName", "path", "mimetype", "size", "type", "folderId", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
             RETURNING id`,
            [uniqueFilename, originalFilename, relativePath, mimetype, fileStats.size, 'IMAGE', folderId],
          );

          const mediaId = result.rows[0].id;
          mediaMap.set(originalFilename, mediaId);
          copiedCount++;
        } catch (error) {
          logger.warning(`Failed to process file ${originalFilename}: ${error}`);
          continue;
        }
      }
    }

    spinner.succeed(
      `Seeded ${mediaMap.size} media files (${copiedCount} copied, ${skippedCount} skipped)`,
    );
    return mediaMap;
  } catch (error) {
    spinner.fail('Failed to seed media files');
    throw error;
  }
}
