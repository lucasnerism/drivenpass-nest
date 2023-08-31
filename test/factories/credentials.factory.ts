import { PrismaService } from '../../src/prisma/prisma.service';

export class CredentialsFactory {
  private userId: number;
  private title: string;
  private username: string;
  private password: string;

  constructor(private readonly prisma: PrismaService) {}

  withUserId(userId: number) {
    this.userId = userId;
    return this;
  }

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withContent(username: string) {
    this.username = username;
    return this;
  }

  withPassword(password: string) {
    this.password = password;
    return this;
  }

  build() {
    return {
      title: this.title,
      username: this.username,
      userId: this.userId,
      password: this.password,
    };
  }

  async persist() {
    const note = this.build();
    return await this.prisma.credential.create({
      data: note,
    });
  }
}
