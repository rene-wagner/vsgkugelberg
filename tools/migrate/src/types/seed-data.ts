export interface SeedUser {
  username: string;
  email: string;
  password: string;
}

export interface SeedDepartment {
  name: string;
  slug: string;
  shortDescription: string;
}

export interface SeedDepartmentStat {
  label: string;
  value: string;
  sort: number;
}

export interface SeedDepartmentLocation {
  name: string;
  badge: string;
  badgeVariant: 'primary' | 'secondary';
  street: string;
  city: string;
  mapsUrl: string;
  amenities: { text: string }[];
  sort: number;
}

export interface SeedTrainingSession {
  day: string;
  time: string;
  locationName: string;
  sort: number;
}

export interface SeedTrainingGroup {
  name: string;
  ageRange: string | null;
  icon: 'youth' | 'adults';
  variant: 'primary' | 'secondary';
  sort: number;
  sessions: SeedTrainingSession[];
}

export interface CompleteDepartmentData {
  name: string;
  slug: string;
  shortDescription: string;
  stats: SeedDepartmentStat[];
  locations: SeedDepartmentLocation[];
  trainingGroups: SeedTrainingGroup[];
}

export type DepartmentMap = Map<string, number>;
export type LocationMap = Map<string, Map<string, number>>;
export type TrainingGroupMap = Map<string, Map<string, number>>;

export interface HistoryFact {
  year: string;
  headline: string;
  description: string;
}

export interface HistoryMilestone {
  year: string;
  headline: string;
  description: string;
}

export interface HistoryChartDataset {
  label: string;
  data: number[];
}

export interface HistoryChartData {
  labels: string[];
  datasets: HistoryChartDataset[];
}

export interface HistoryChronicleEntry {
  year: string;
  description: string;
}

export interface HistoryChronicleGroup {
  headline: string;
  content: HistoryChronicleEntry[];
}

export interface HistoryFestivalItem {
  headline: string;
  text: string;
}

export interface HistoryAchievement {
  year: string;
  headline: string;
  description: string;
  category: string;
}

export interface SeedHistory {
  heroHeadline: string;
  heroSubHeadline: string;
  foundingHeadline: string;
  foundingDescription: string;
  foundingFactCardHeadline: string;
  foundingFacts: HistoryFact[];
  foundingMilestonesHeadline: string;
  foundingMilestones: HistoryMilestone[];
  developmentHeadline: string;
  developmentDescription: string;
  developmentChartData: HistoryChartData;
  developmentChronicleGroups: HistoryChronicleGroup[];
  festivalsHeadline: string;
  festivalsDescription: string;
  festivalsItems: HistoryFestivalItem[];
  achievementsHeadline: string;
  achievementsItems: HistoryAchievement[];
  ctaHeadline: string;
  ctaDescription: string;
}

export interface SeedContactPerson {
  firstName: string;
  lastName: string;
  type: string;
  email: string;
  address: string | null;
  phone: string;
}

// Media migration types
export type MediaFolderMap = Map<string, number>; // folderName → folderId
export type MediaFileMap = Map<string, number>;   // originalFilename → mediaId
