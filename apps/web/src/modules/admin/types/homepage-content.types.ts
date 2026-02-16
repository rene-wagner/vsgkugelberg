export interface HomepageStat {
  label: string;
  value: string;
  sort?: number;
}

export interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomepageContent {
  id: number;
  heroHeadline: string;
  heroDescription: string;
  heroTag: string;
  heroLogoId?: number | null;
  heroLogo?: MediaItem | null;
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
  updatedAt: string;
}

export type UpdateHomepageContentDto = Partial<Omit<HomepageContent, 'id' | 'updatedAt' | 'stats' | 'heroLogo'>> & {
  stats?: HomepageStat[];
};
