import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/signInDto';
import { SignUpDto } from './dto/signUpDto';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private EXPIRATION_TIME = '7 days';
  private ISSUER = 'lucasnerism';
  private AUDIENCE = 'users';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const user = await this.usersService.findOneByEmail(signUpDto.email);
    if (user) throw new ConflictException();

    return this.usersService.create(signUpDto);
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findOneByEmail(signInDto.email);
    if (!user) throw new UnauthorizedException('Email or password invalid');

    const valid = await bcrypt.compare(signInDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Email or password invalid');

    return this.createToken(user);
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
    const data = this.jwtService.verify(token);

    return data;
  }
}
