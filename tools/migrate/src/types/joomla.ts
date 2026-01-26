export interface JoomlaCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JoomlaPost {
  id: number;
  title: string;
  content: string | null;
  catid: number;
  hits: number;
  created: Date;
  modified: Date;
  oldPost: number;
  authorId: number;
  published: number;
}

export type CategoryMap = Map<number, number>;
