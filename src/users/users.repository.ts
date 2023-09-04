import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  private SALT: number = 10;

  constructor(private readonly prisma: PrismaService) {}

  create(createUser: Omit<User, 'id'>): Promise<Omit<User, 'password'>> {
    return this.prisma.user.create({
      data: {
        ...createUser,
        password: bcrypt.hashSync(createUser.password, this.SALT),
      },
      select: { id: true, email: true },
    });
  }

  findOne(id: number): Promise<Omit<User, 'password'>> {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
