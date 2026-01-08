export interface HistoryFact {
  year: string;
  headline: string;
  description: string;
  sort?: number;
}

export interface HistoryMilestone {
  year: string;
  headline: string;
  description: string;
  sort?: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChronicleEntry {
  year: string;
  description: string;
  sort?: number;
}

export interface ChronicleGroup {
  id?: number;
  headline: string;
  content: ChronicleEntry[];
  sort?: number;
}

export interface FestivalItem {
  headline: string;
  text: string;
  sort?: number;
}

export interface AchievementItem {
  year: string;
  headline: string;
  description: string;
  category: string;
  sort?: number;
}

export interface HistoryContent {
  id: number;
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
  developmentChartData: ChartData;
  developmentChronicleGroups: ChronicleGroup[];
  festivalsHeadline: string;
  festivalsDescription: string;
  festivalsItems: FestivalItem[];
  achievementsHeadline: string;
  achievementsItems: AchievementItem[];
  ctaHeadline: string;
  ctaDescription: string;
  updatedAt: string;
}

export type UpdateHistoryDto = Partial<
  Omit<HistoryContent, 'id' | 'updatedAt'>
>;
