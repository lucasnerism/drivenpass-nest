import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/signInDto';
import { SignUpDto } from './dto/signUpDto';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private EXPIRATION_TIME = '7 days';
  private ISSUER = 'Driven';
  private AUDIENCE = 'users';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    throw new Error('Method not implemented.');
  }
  async signUp(signUpDto: SignUpDto) {
    throw new Error('Method not implemented.');
  }

  createToken(user: User) {
    const { id } = user;
    const token = this.jwtService.sign(
      { id },
      {
        expiresIn: this.EXPIRATION_TIME,
        subject: String(id),
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      },
    );
    return { token };
  }

  checkToken(token: string) {
    const data = this.jwtService.verify(token, {
      audience: this.AUDIENCE,
      issuer: this.ISSUER,
    });

    return data;
  }
}
