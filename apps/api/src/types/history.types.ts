export interface FactItem {
  label: string;
  value: string;
}

export interface MilestoneItem {
  year: string;
  title: string;
  description: string;
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
  text: string;
}

export interface ChronicleGroup {
  id: number;
  title: string;
  content: ChronicleEntry[];
}

export interface FestivalItem {
  title: string;
  subtitle: string;
  text: string;
  icon: string;
}

export interface AchievementItem {
  year: string;
  title: string;
  description: string;
  category: string;
}

export interface HistoryContent {
  id: number;
  heroHeadline: string;
  heroSubHeadline: string;
  foundingHeadline: string;
  foundingNarrative: string[];
  foundingFactCardHeadline: string;
  foundingFacts: FactItem[];
  foundingMilestonesHeadline: string;
  foundingMilestones: MilestoneItem[];
  developmentHeadline: string;
  developmentNarrative: string[];
  developmentChartData: ChartData;
  developmentChronicleGroups: ChronicleGroup[];
  festivalsHeadline: string;
  festivalsDescription: string;
  festivalsItems: FestivalItem[];
  achievementsHeadline: string;
  achievementsItems: AchievementItem[];
  ctaHeadline: string;
  ctaDescription: string;
  updatedAt: Date;
}

export type UpdateHistoryDto = Partial<
  Omit<HistoryContent, 'id' | 'updatedAt'>
>;
