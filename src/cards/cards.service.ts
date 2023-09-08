import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { CardsRepository } from './cards.repository';
import { Card } from '@prisma/client';
import { CryptrService } from '../crypto/cryptr.service';

@Injectable()
export class CardsService {
  constructor(
    private readonly cardsRepository: CardsRepository,
    private readonly CryptrService: CryptrService,
  ) {}

  async create(createCardDto: CreateCardDto, userId: number) {
    const card = await this.findOneByTitle(createCardDto.title, userId);
    if (card)
      throw new ConflictException('Card with this title already exists!');

    return this.cardsRepository.create(
      {
        ...createCardDto,
        cvv: this.CryptrService.encrypt(createCardDto.cvv),
        password: this.CryptrService.encrypt(createCardDto.password),
      },
      userId,
    );
  }

  decryptCards(cards: Card[]) {
    const cardsFormated = cards.map((card) => {
      return {
        ...card,
        password: this.CryptrService.decrypt(card.password),
        cvv: this.CryptrService.decrypt(card.cvv),
      };
    });
    return cardsFormated;
  }

  async findAll(userId: number) {
    const cards = await this.cardsRepository.findAll(userId);
    return this.decryptCards(cards);
  }

  async findOne(id: number, userId: number) {
    const card = await this.cardsRepository.findOne(id);
    if (!card) throw new NotFoundException();
    if (card.userId !== userId) throw new ForbiddenException();
    return this.decryptCards([card])[0];
  }

  findOneByTitle(title: string, userId: number) {
    return this.cardsRepository.findOneByTitle(title, userId);
  }

  async update(id: number, updateCardDto: CreateCardDto, userId: number) {
    await this.findOne(id, userId);
    return this.cardsRepository.update(id, updateCardDto);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    await this.cardsRepository.remove(id);
  }
}
