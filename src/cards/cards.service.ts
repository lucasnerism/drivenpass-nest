import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardsRepository } from './cards.repository';
import Cryptr from 'cryptr';
import { Card } from '@prisma/client';

@Injectable()
export class CardsService {
  private Cryptr = require('cryptr');
  private cryptr: Cryptr;

  constructor(private readonly cardsRepository: CardsRepository) {
    this.cryptr = new this.Cryptr(process.env.CRYPTR_SECRET);
  }

  async create(createCardDto: CreateCardDto, userId: number) {
    const card = await this.findOneByTitle(createCardDto.title, userId);
    if (card)
      throw new ConflictException('Card with this title already exists!');

    return this.cardsRepository.create(
      {
        ...createCardDto,
        cvv: this.cryptr.encrypt(createCardDto.cvv),
        password: this.cryptr.encrypt(createCardDto.password),
      },
      userId,
    );
  }

  formatCards(cards: Card[]) {
    const cardsFormated = cards.map((card) => {
      return {
        ...card,
        password: this.cryptr.decrypt(card.password),
        cvv: this.cryptr.decrypt(card.cvv),
      };
    });
    return cardsFormated;
  }

  async findAll(userId: number) {
    const cards = await this.cardsRepository.findAll(userId);
    return this.formatCards(cards);
  }

  async findOne(id: number, userId: number) {
    const card = await this.cardsRepository.findOne(id);
    if (!card) throw new NotFoundException();
    if (card.userId !== userId) throw new ForbiddenException();
    return this.formatCards([card])[0];
  }

  findOneByTitle(title: string, userId: number) {
    return this.cardsRepository.findOneByTitle(title, userId);
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    await this.cardsRepository.remove(id);
  }
}
