import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(createUser: Omit<User, 'id'>): Promise<Omit<User, 'password'>> {
    return this.prisma.user.create({
      data: createUser,
      select: { id: true, email: true },
    });
  }

  findOne(id: number): Promise<User> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async deleteUserData(userId: number) {
    this.prisma.$transaction([
      this.prisma.note.deleteMany({ where: { userId } }),
      this.prisma.card.deleteMany({ where: { userId } }),
      this.prisma.credential.deleteMany({ where: { userId } }),
      this.prisma.user.deleteMany({ where: { id: userId } }),
    ]);
  }
}
