export interface StatutesContent {
  id: number;
  content: string;
  updatedAt: string;
}

export interface UpdateStatutesDto {
  content: string;
}
