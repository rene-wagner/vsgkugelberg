import fs from 'fs/promises';
import path from 'path';

/**
 * Normalize a name for filename matching
 * Removes spaces, hyphens, and special characters but preserves case
 * Example: "Hans-Werner Rust" → "HansWernerRust"
 */
export function normalizeNameForMatch(name: string): string {
  return name.replace(/[\s\-]/g, '');
}

/**
 * Get MIME type from file extension
 */
export function getFileMimetype(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Get file size in bytes
 */
export async function getFileStats(filePath: string): Promise<{ size: number }> {
  const stats = await fs.stat(filePath);
  return { size: stats.size };
}

/**
 * Copy a file from source to target, creating target directory if needed
 */
export async function copyMediaFile(sourcePath: string, targetPath: string): Promise<void> {
  const targetDir = path.dirname(targetPath);
  
  // Create target directory if it doesn't exist
  await fs.mkdir(targetDir, { recursive: true });
  
  // Copy the file
  await fs.copyFile(sourcePath, targetPath);
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
