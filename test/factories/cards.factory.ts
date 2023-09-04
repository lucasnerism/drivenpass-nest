import { CardTypes } from '@prisma/client';
import { PrismaService } from '../../src/prisma/prisma.service';
import { faker } from '@faker-js/faker';

export class CardsFactory {
  private userId: number;
  private title: string;
  private name: string = faker.person.fullName();
  private number: string = faker.finance.creditCardNumber();
  private expirationDate: string = '11-25';
  private cvv: string = faker.finance.creditCardCVV();
  private password: string = faker.finance.pin();
  private isVirtual: boolean;
  private type: CardTypes;
  private Cryptr = require('cryptr');
  private cryptr: any;

  constructor(private readonly prisma: PrismaService) {
    this.cryptr = new this.Cryptr(process.env.CRYPTR_SECRET);
  }

  withUserId(userId: number) {
    this.userId = userId;
    return this;
  }

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withIsVirtual(isVirtual: boolean) {
    this.isVirtual = isVirtual;
    return this;
  }

  withType(type: CardTypes) {
    this.type = type;
    return this;
  }

  build() {
    return {
      title: this.title,
      name: this.name,
      number: this.number,
      expirationDate: this.expirationDate,
      cvv: this.cvv,
      password: this.password,
      isVirtual: this.isVirtual,
      type: this.type,
    };
  }

  async persist() {
    const card = this.build();
    const cardDb = await this.prisma.card.create({
      data: {
        ...card,
        userId: this.userId,
        cvv: this.cryptr.encrypt(this.cvv),
        password: this.cryptr.encrypt(this.password),
      },
    });
    return { card, cardDb };
  }
}
