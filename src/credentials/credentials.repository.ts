import { Injectable } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CredentialsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(createCredentialDto: CreateCredentialDto, userId: number) {
    return this.prisma.credential.create({
      data: { ...createCredentialDto, userId },
    });
  }

  findAll(userId: number) {
    return this.prisma.credential.findMany({
      where: { userId },
    });
  }

  findOne(id: number) {
    return this.prisma.credential.findUnique({
      where: { id },
    });
  }

  findOneByTitle(title: string, userId: number) {
    return this.prisma.credential.findFirst({
      where: { title, userId },
    });
  }

  update(id: number, updateCredentialDto: CreateCredentialDto) {
    return this.prisma.credential.update({
      data: updateCredentialDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.credential.delete({
      where: { id },
    });
  }
}
