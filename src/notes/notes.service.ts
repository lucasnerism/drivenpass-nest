import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { NotesRepository } from './notes.repository';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  async create(createNoteDto: CreateNoteDto, userId: number) {
    const note = await this.findOneByTitle(createNoteDto.title, userId);
    if (note)
      throw new ConflictException('Note with this title already exists!');
    return this.notesRepository.create(createNoteDto, userId);
  }

  findAll(userId: number) {
    return this.notesRepository.findAll(userId);
  }

  async findOne(id: number, userId: number) {
    const note = await this.notesRepository.findOne(id);
    if (!note) throw new NotFoundException();
    if (note.userId !== userId) throw new ForbiddenException();
    return note;
  }

  findOneByTitle(title: string, userId: number) {
    return this.notesRepository.findOneByTitle(title, userId);
  }

  async update(id: number, updateNoteDto: CreateNoteDto, userId: number) {
    await this.findOne(id, userId);
    return this.notesRepository.update(id, updateNoteDto);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    await this.notesRepository.remove(id);
  }
}
