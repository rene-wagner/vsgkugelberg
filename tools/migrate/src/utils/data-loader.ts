import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { SeedUser, CompleteDepartmentData, SeedHistory, SeedContactPerson, SeedHomepage, SeedBoardContent, SeedStatutes, SeedMembershipFee, SeedSportInsurance, SeedMembership } from '../types';
import type { JoomlaCategory, JoomlaPost } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

export async function loadUserSeedData(): Promise<SeedUser[]> {
  const data = await fs.readFile(path.join(DATA_DIR, 'users.json'), 'utf-8');
  return JSON.parse(data);
}

export async function loadDepartmentSeedData(): Promise<CompleteDepartmentData[]> {
  const data = await fs.readFile(path.join(DATA_DIR, 'departments.json'), 'utf-8');
  return JSON.parse(data);
}

export async function loadHistorySeedData(): Promise<SeedHistory> {
  const data = await fs.readFile(path.join(DATA_DIR, 'history.json'), 'utf-8');
  return JSON.parse(data);
}

export async function loadContactPersonSeedData(): Promise<SeedContactPerson[]> {
  const data = await fs.readFile(path.join(DATA_DIR, 'contact-persons.json'), 'utf-8');
  return JSON.parse(data);
}

export async function loadHomepageSeedData(): Promise<SeedHomepage> {
  const data = await fs.readFile(path.join(DATA_DIR, 'homepage.json'), 'utf-8');
  return JSON.parse(data);
}

export async function loadBoardContentSeedData(): Promise<SeedBoardContent> {
  const data = await fs.readFile(path.join(DATA_DIR, 'board-content.json'), 'utf-8');
  return JSON.parse(data);
}

export async function loadStatutesSeedData(): Promise<SeedStatutes> {
  const content = await fs.readFile(path.join(DATA_DIR, 'statutes.md'), 'utf-8');
  return { content };
}

export async function loadMembershipFeeSeedData(): Promise<SeedMembershipFee> {
  const content = await fs.readFile(path.join(DATA_DIR, 'membership-fee.md'), 'utf-8');
  return { content };
}

export async function loadSportInsuranceSeedData(): Promise<SeedSportInsurance> {
  const content = await fs.readFile(path.join(DATA_DIR, 'sport-insurance.md'), 'utf-8');
  return { content };
}

export async function loadMembershipSeedData(): Promise<SeedMembership> {
  const data = await fs.readFile(path.join(DATA_DIR, 'membership.json'), 'utf-8');
  return JSON.parse(data);
}

export async function loadCategoriesData(): Promise<JoomlaCategory[]> {
  const data = await fs.readFile(path.join(DATA_DIR, 'categories.json'), 'utf-8');
  const raw: Array<Record<string, unknown>> = JSON.parse(data);
  return raw
    .map((row) => ({
      id: Number(row.id),
      name: row.name as string,
      slug: row.slug as string,
      description: (row.description as string | null) ?? null,
      parentId: row.parentId != null ? Number(row.parentId) : null,
      createdAt: new Date(row.createdAt as string),
      updatedAt: new Date(row.updatedAt as string),
    }))
    .sort((a, b) => a.id - b.id);
}

export async function loadPostsData(): Promise<JoomlaPost[]> {
  const data = await fs.readFile(path.join(DATA_DIR, 'posts.json'), 'utf-8');
  const raw: Array<Record<string, unknown>> = JSON.parse(data);
  return raw
    .map((row) => ({
      id: Number(row.id),
      title: row.title as string,
      content: (row.content as string | null) ?? null,
      catid: row.catid != null && row.catid !== '' ? Number(row.catid) : null,
      hits: Number(row.hits),
      created: new Date(row.created as string),
      modified: new Date(row.modified as string),
      oldPost: Number(row.old_post ?? row.oldPost ?? 0),
      authorId: Number(row.author_id ?? row.authorId ?? 0),
      published: Number(row.published),
    }))
    .sort((a, b) => a.id - b.id);
}

