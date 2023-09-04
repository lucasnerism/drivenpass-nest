import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'email@email.com', description: "User's email" })
  email: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1234567aB!', description: "User's password" })
  password: string;
}
