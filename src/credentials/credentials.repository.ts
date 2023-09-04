import { Injectable } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
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

  update(id: number, updateCredentialDto: UpdateCredentialDto) {
    return `This action updates a #${id} credential`;
  }

  remove(id: number) {
    return this.prisma.credential.delete({
      where: { id },
    });
  }
}
