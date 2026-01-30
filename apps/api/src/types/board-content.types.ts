export interface BoardMemberInfo {
  id: number;
  contactPersonId: number;
  firstName: string;
  lastName: string;
  type: string;
  email: string;
  phone: string;
  profileImage?: {
    id: number;
    filename: string;
    path: string;
    thumbnails: any;
  } | null;
  sort: number;
}

export interface BoardContent {
  id: number;
  headline: string;
  description: string;
  sectionHeadline: string;
  sectionDescription: string;
  note: string;
  boardMembers: BoardMemberInfo[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardMemberDto {
  contactPersonId: number;
  sort?: number;
}

export type UpdateBoardContentDto = Partial<
  Omit<BoardContent, 'id' | 'createdAt' | 'updatedAt' | 'boardMembers'>
> & {
  boardMembers?: BoardMemberDto[];
};
