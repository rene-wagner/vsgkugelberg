import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string; // Can be username or email

  @IsString()
  @IsNotEmpty()
  password: string;
}
