import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as csv from 'fast-csv';
import type { JoomlaCategory, JoomlaPost } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');

export async function loadCategoriesFromCSV(): Promise<JoomlaCategory[]> {
  return new Promise((resolve, reject) => {
    const categories: JoomlaCategory[] = [];
    const filePath = path.join(DATA_DIR, 'categories.csv');

    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on('error', (error) => reject(error))
      .on('data', (row: Record<string, string>) => {
        categories.push({
          id: parseInt(row.id, 10),
          name: row.name,
          slug: row.slug,
          description: row.description || null,
          parentId: row.parentId ? parseInt(row.parentId, 10) : null,
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(row.updatedAt),
        });
      })
      .on('end', () => {
        // Sort by id to ensure consistent ordering
        categories.sort((a, b) => a.id - b.id);
        resolve(categories);
      });
  });
}

export async function loadPostsFromCSV(): Promise<JoomlaPost[]> {
  return new Promise((resolve, reject) => {
    const posts: JoomlaPost[] = [];
    const filePath = path.join(DATA_DIR, 'posts.csv');

    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on('error', (error) => reject(error))
      .on('data', (row: Record<string, string>) => {
        posts.push({
          id: parseInt(row.id, 10),
          title: row.title,
          content: row.content || null,
          catid: parseInt(row.catid, 10),
          hits: parseInt(row.hits, 10),
          created: new Date(row.created),
          modified: new Date(row.modified),
          oldPost: parseInt(row.oldPost, 10),
          authorId: parseInt(row.authorId, 10),
          published: parseInt(row.published, 10),
        });
      })
      .on('end', () => {
        // Sort by id to ensure consistent ordering
        posts.sort((a, b) => a.id - b.id);
        resolve(posts);
      });
  });
}
