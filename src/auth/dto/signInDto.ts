import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: String;
  @IsString()
  @IsNotEmpty()
  password: String;
}
