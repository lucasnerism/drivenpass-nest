import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { E2eUtils } from '../e2eUtils';
import { CardsFactory } from '../factories/cards.factory';
import { UsersFactory } from '../factories/users.factory';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('Cards E2E Tests', () => {
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

  it('POST /cards => should return status 401 with invalid token', async () => {
    const card = new CardsFactory(prisma)
      .withTitle('card')
      .withIsVirtual(true)
      .withType('credit')
      .build();
    const { status } = await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer token`)
      .send(card);
    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  it('POST /cards => should create a new card', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const card = new CardsFactory(prisma)
      .withTitle('card')
      .withIsVirtual(true)
      .withType('credit')
      .build();
    const { status, body } = await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card);
    expect(status).toEqual(HttpStatus.CREATED);
    expect(body).toEqual({
      ...card,
      id: expect.any(Number),
      userId: userDb.id,
      password: expect.any(String),
      cvv: expect.any(String),
    });
  });

  it('POST /cards => should return status 400 with wrong body', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const card = new CardsFactory(prisma).withTitle('card').build();
    const { status } = await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card);
    expect(status).toEqual(HttpStatus.BAD_REQUEST);
  });

  it('POST /cards => should return status 409 with duplicated card title', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { card } = await new CardsFactory(prisma)
      .withTitle('card')
      .withIsVirtual(true)
      .withType('credit')
      .withUserId(userDb.id)
      .persist();
    const { status } = await request(app.getHttpServer())
      .post('/cards')
      .set('Authorization', `Bearer ${token}`)
      .send(card);
    expect(status).toEqual(HttpStatus.CONFLICT);
  });

  it('GET /cards => should return status 401 with invalid token', async () => {
    const { status } = await request(app.getHttpServer())
      .get('/cards')
      .set('Authorization', `Bearer token`);
    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  it("GET /cards/ => should return user's cards", async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { cardDb, card } = await new CardsFactory(prisma)
      .withTitle('card')
      .withIsVirtual(true)
      .withType('credit')
      .withUserId(userDb.id)
      .persist();
    const { status, body } = await request(app.getHttpServer())
      .get('/cards')
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.OK);
    expect(body).toEqual([{ id: cardDb.id, userId: userDb.id, ...card }]);
  });

  it('GET /cards/:id => should return status 401 with invalid token', async () => {
    const { status } = await request(app.getHttpServer())
      .get('/cards/1')
      .set('Authorization', `Bearer token`);
    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  it('GET /cards/:id => should return said card', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { cardDb, card } = await new CardsFactory(prisma)
      .withTitle('card')
      .withIsVirtual(true)
      .withType('credit')
      .withUserId(userDb.id)
      .persist();
    const { status, body } = await request(app.getHttpServer())
      .get(`/cards/${cardDb.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.OK);
    expect(body).toEqual({ id: cardDb.id, userId: userDb.id, ...card });
  });

  it('GET /cards/:id => should return status 403 if card is not from user', async () => {
    const { userDb: firstUser } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const { userDb: secondUser } = await new UsersFactory(prisma)
      .withEmail('test2@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: secondUser.id });

    const { cardDb } = await new CardsFactory(prisma)
      .withTitle('card')
      .withIsVirtual(true)
      .withType('credit')
      .withUserId(firstUser.id)
      .persist();
    const { status } = await request(app.getHttpServer())
      .get(`/cards/${cardDb.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.FORBIDDEN);
  });

  it('GET /cards/:id => should return status 404 if card doesnt exist', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { status } = await request(app.getHttpServer())
      .get(`/cards/1`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('DELETE /cards/:id => should return status 401 with invalid token', async () => {
    const { status } = await request(app.getHttpServer())
      .delete('/cards/1')
      .set('Authorization', `Bearer token`);
    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  it('DELETE /cards/:id => should delete said card', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { cardDb } = await new CardsFactory(prisma)
      .withTitle('card')
      .withIsVirtual(true)
      .withType('credit')
      .withUserId(userDb.id)
      .persist();
    const { status } = await request(app.getHttpServer())
      .delete(`/cards/${cardDb.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.OK);

    const cards = await prisma.card.findMany({});
    expect(cards).toHaveLength(0);
  });

  it('DELETE /cards/:id => should return status 403 if card is not from user', async () => {
    const { userDb: firstUser } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const { userDb: secondUser } = await new UsersFactory(prisma)
      .withEmail('test2@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: secondUser.id });

    const { cardDb } = await new CardsFactory(prisma)
      .withTitle('card')
      .withIsVirtual(true)
      .withType('credit')
      .withUserId(firstUser.id)
      .persist();
    const { status } = await request(app.getHttpServer())
      .delete(`/cards/${cardDb.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.FORBIDDEN);
  });

  it('DELETE /cards/:id => should return status 404 if card doesnt exist', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { status } = await request(app.getHttpServer())
      .delete(`/cards/1`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.NOT_FOUND);
  });
});
