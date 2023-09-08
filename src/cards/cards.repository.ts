import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
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

  update(id: number, updateCardDto: CreateCardDto) {
    return this.prisma.card.update({
      data: updateCardDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.card.delete({
      where: { id },
    });
  }
}
