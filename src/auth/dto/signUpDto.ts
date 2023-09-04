import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsStrongPassword } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @ApiProperty({ example: 'email@email.com', description: 'email for user' })
  email: string;
  @IsStrongPassword({
    minLength: 10,
  })
  @ApiProperty({ example: '1234567aB!', description: 'password for user' })
  password: string;
}
