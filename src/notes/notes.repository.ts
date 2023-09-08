import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(createNoteDto: CreateNoteDto, userId: number) {
    return this.prisma.note.create({
      data: { ...createNoteDto, userId },
    });
  }

  findAll(userId: number) {
    return this.prisma.note.findMany({
      where: { userId },
    });
  }

  findOne(id: number) {
    return this.prisma.note.findUnique({
      where: { id },
    });
  }

  findOneByTitle(title: string, userId: number) {
    return this.prisma.note.findFirst({
      where: { title, userId },
    });
  }

  update(id: number, updateNoteDto: CreateNoteDto) {
    return this.prisma.note.update({
      data: updateNoteDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.note.delete({
      where: { id },
    });
  }
}
