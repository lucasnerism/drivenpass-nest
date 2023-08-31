import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: String;
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 10,
  })
  password: String;
}
