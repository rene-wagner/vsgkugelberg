import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { SeedUser, CompleteDepartmentData, SeedHistory, SeedContactPerson, SeedHomepage, SeedBoardContent, SeedStatutes, SeedMembershipFee, SeedSportInsurance } from '../types';

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
