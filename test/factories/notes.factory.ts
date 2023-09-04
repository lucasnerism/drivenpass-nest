import { PrismaService } from '../../src/prisma/prisma.service';

export class NotesFactory {
  private userId: number;
  private title: string;
  private content: string;

  constructor(private readonly prisma: PrismaService) {}

  withUserId(userId: number) {
    this.userId = userId;
    return this;
  }

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withContent(content: string) {
    this.content = content;
    return this;
  }

  build() {
    return {
      title: this.title,
      content: this.content,
    };
  }

  async persist() {
    const note = this.build();
    const noteDb = await this.prisma.note.create({
      data: { ...note, userId: this.userId },
    });
    return { note, noteDb };
  }
}
