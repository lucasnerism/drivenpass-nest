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

  constructor(private readonly prisma: PrismaService) {}

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
      userId: this.userId,
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
    return await this.prisma.card.create({
      data: card,
    });
  }
}
