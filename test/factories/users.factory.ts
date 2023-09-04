import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export class UsersFactory {
  private email: string;
  private password: string;

  constructor(private readonly prisma: PrismaService) {}

  withEmail(email: string) {
    this.email = email;
    return this;
  }
  withPassword(password: string) {
    this.password = password;
    return this;
  }

  build() {
    return {
      email: this.email,
      password: this.password,
    };
  }

  async persist() {
    const user = this.build();
    const userDb = await this.prisma.user.create({
      data: { ...user, password: bcrypt.hashSync(user.password, 10) },
    });
    return { user, userDb };
  }
}
