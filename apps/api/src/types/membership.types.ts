export interface MembershipDepartmentStat {
  departmentName: string;
  totalCount: number;
  maleCount: number;
  femaleCount: number;
  sort?: number;
}

export interface MembershipProcessStep {
  title: string;
  description: string;
  sort?: number;
}

export interface MembershipDocument {
  title: string;
  url: string;
  sort?: number;
}

export interface MembershipContent {
  id: number;
  heroHeadline: string;
  heroSubHeadline: string;
  introText: string;
  trialPeriodHeadline: string;
  trialPeriodText: string;
  processHeadline: string;
  processText: string;
  documentsHeadline: string;
  ctaHeadline: string;
  ctaDescription: string;
  departmentStats: MembershipDepartmentStat[];
  processSteps: MembershipProcessStep[];
  documents: MembershipDocument[];
  updatedAt: string;
}

export type UpdateMembershipDto = Partial<Omit<MembershipContent, 'id' | 'updatedAt'>>;
