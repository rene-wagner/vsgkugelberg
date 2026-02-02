import { MembershipFeeContent as PrismaMembershipFeeContent } from '@/lib/prisma.lib';

export interface UpdateMembershipFeeDto {
  content: string;
}

export type MembershipFeeContent = PrismaMembershipFeeContent;
