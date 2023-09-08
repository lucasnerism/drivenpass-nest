import { CryptrService } from '../../src/crypto/cryptr.service';
import { PrismaService } from '../../src/prisma/prisma.service';

export class CredentialsFactory {
  private userId: number;
  private title: string;
  private url: string;
  private username: string;
  private password: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly CryptrService: CryptrService,
  ) {}

  withUserId(userId: number) {
    this.userId = userId;
    return this;
  }

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withUrl(url: string) {
    this.url = url;
    return this;
  }

  withUsername(username: string) {
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
      password: this.password,
      url: this.url,
    };
  }

  async persist() {
    const credential = this.build();
    const credentialDb = await this.prisma.credential.create({
      data: {
        ...credential,
        userId: this.userId,
        password: this.CryptrService.encrypt(credential.password),
      },
    });
    return { credential, credentialDb };
  }
}
