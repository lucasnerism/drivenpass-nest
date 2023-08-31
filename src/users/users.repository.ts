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

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
