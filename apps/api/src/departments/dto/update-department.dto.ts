import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  shortDescription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  longDescription?: string;
}
