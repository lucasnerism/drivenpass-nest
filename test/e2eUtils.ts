import { PrismaService } from '../src/prisma/prisma.service';

export class E2eUtils {
  static async cleanDb(prisma: PrismaService) {
    await prisma.note.deleteMany({});
    await prisma.card.deleteMany({});
    await prisma.credential.deleteMany({});
    await prisma.user.deleteMany({});
  }
}
