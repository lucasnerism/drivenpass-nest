import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(createCardDto: CreateCardDto, userId: number) {
    return this.prisma.card.create({
      data: { ...createCardDto, userId },
    });
  }

  findAll(userId: number) {
    return this.prisma.card.findMany({
      where: { userId },
    });
  }

  findOne(id: number) {
    return this.prisma.card.findUnique({
      where: { id },
    });
  }

  findOneByTitle(title: string, userId: number) {
    return this.prisma.card.findFirst({
      where: { title, userId },
    });
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} credential`;
  }

  remove(id: number) {
    return this.prisma.card.delete({
      where: { id },
    });
  }
}
