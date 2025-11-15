import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  longDescription: string;
}
