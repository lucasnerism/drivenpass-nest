import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { E2eUtils } from '../e2eUtils';
import { UsersFactory } from '../factories/users.factory';
import { NotesFactory } from '../factories/notes.factory';
import { CardsFactory } from '../factories/cards.factory';
import { CredentialsFactory } from '../factories/credentials.factory';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('Users E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService = new PrismaService();
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET,
        }),
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    jwtService = app.get(JwtService);
    await app.init();

    await E2eUtils.cleanDb(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('POST /users/auth/sign-up => should create a new user', async () => {
    const user = new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .build();
    const response = await request(app.getHttpServer())
      .post('/users/auth/sign-up')
      .send(user);
    expect(response.status).toEqual(HttpStatus.CREATED);

    const users = await prisma.user.findMany({});
    expect(users.length).toEqual(1);
  });

  it('POST /users/auth/sign-up => should return status 400 with wrong body', async () => {
    const user = new UsersFactory(prisma).withPassword('123456aB!').build();
    const { status } = await request(app.getHttpServer())
      .post('/users/auth/sign-up')
      .send(user);
    expect(status).toEqual(HttpStatus.BAD_REQUEST);

    const users = await prisma.user.findMany({});
    expect(users.length).toEqual(0);
  });

  it('POST /users/auth/sign-up => should return status 409 with duplicate email', async () => {
    const { user } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();

    const { status } = await request(app.getHttpServer())
      .post('/users/auth/sign-up')
      .send(user);
    expect(status).toEqual(HttpStatus.CONFLICT);

    const users = await prisma.user.findMany({});
    expect(users).toHaveLength(1);
  });

  it('POST /users/auth/sign-in => should return token', async () => {
    const { user } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();

    const { status, body } = await request(app.getHttpServer())
      .post('/users/auth/sign-in')
      .send(user);
    expect(status).toEqual(HttpStatus.OK);
    expect(body).toEqual({ token: expect.any(String) });
  });

  it('POST /users/auth/sign-in => should return status 401 with wrong email', async () => {
    const { user } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();

    const { status } = await request(app.getHttpServer())
      .post('/users/auth/sign-in')
      .send({ ...user, email: 'wrong@email.com' });
    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  it('POST /users/auth/sign-in => should return status 401 with wrong password', async () => {
    const { user } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();

    const { status } = await request(app.getHttpServer())
      .post('/users/auth/sign-in')
      .send({ ...user, password: 'wrongPassword' });
    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  it('POST /erase => should delete all user data', async () => {
    const { userDb, user } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();

    const token = jwtService.sign({ id: userDb.id });

    await new NotesFactory(prisma)
      .withTitle('note')
      .withContent('test')
      .withUserId(userDb.id)
      .persist();

    await new CardsFactory(prisma)
      .withTitle('card')
      .withIsVirtual(true)
      .withType('credit')
      .withUserId(userDb.id)
      .persist();

    await new CredentialsFactory(prisma)
      .withTitle('credential')
      .withUrl('https://www.test.com')
      .withUsername('test')
      .withPassword('test')
      .withUserId(userDb.id)
      .persist();

    const { status } = await request(app.getHttpServer())
      .post('/erase')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: user.password });
    expect(status).toEqual(HttpStatus.OK);
    const notes = await prisma.note.findMany({});
    expect(notes).toHaveLength(0);
    const credentials = await prisma.credential.findMany({});
    expect(credentials).toHaveLength(0);
    const cards = await prisma.card.findMany({});
    expect(cards).toHaveLength(0);
    const users = await prisma.user.findMany({});
    expect(users).toHaveLength(0);
  });

  it('POST /erase => should return status 401 if wrong body', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();

    const token = jwtService.sign({ id: userDb.id });

    await new NotesFactory(prisma)
      .withTitle('note')
      .withContent('test')
      .withUserId(userDb.id)
      .persist();

    await new CardsFactory(prisma)
      .withTitle('card')
      .withIsVirtual(true)
      .withType('credit')
      .withUserId(userDb.id)
      .persist();

    await new CredentialsFactory(prisma)
      .withTitle('credential')
      .withUrl('https://www.test.com')
      .withUsername('test')
      .withPassword('test')
      .withUserId(userDb.id)
      .persist();

    const { status } = await request(app.getHttpServer())
      .post('/erase')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'wrongPassword' });
    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
    const notes = await prisma.note.findMany({});
    expect(notes).toHaveLength(1);
    const credentials = await prisma.credential.findMany({});
    expect(credentials).toHaveLength(1);
    const cards = await prisma.card.findMany({});
    expect(cards).toHaveLength(1);
    const users = await prisma.user.findMany({});
    expect(users).toHaveLength(1);
  });

  it('POST /erase => should return status 401 with invalid token', async () => {
    const { status } = await request(app.getHttpServer())
      .post('/erase')
      .set('Authorization', `Bearer token`)
      .send({ password: 'password' });
    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
  });
});
