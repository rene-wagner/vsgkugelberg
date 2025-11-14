import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  Min,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsInt()
  authorId: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  categoryIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];
}
