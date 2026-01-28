export interface HomepageStat {
  label: string;
  value: string;
  sort?: number;
}

export interface HomepageContent {
  id: number;
  heroHeadline: string;
  heroDescription: string;
  heroTag: string;
  stats: HomepageStat[];
  departmentsHeadline: string;
  departmentsDescription: string;
  departmentsSubtitle: string;
  postsHeadline: string;
  postsDescription: string;
  postsSubtitle: string;
  postsCount: number;
  ctaHeadline: string;
  ctaDescription: string;
  updatedAt: Date;
}

export type UpdateHomepageContentDto = Partial<Omit<HomepageContent, 'id' | 'updatedAt' | 'stats'>> & {
  stats?: HomepageStat[];
};
