import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { E2eUtils } from '../e2eUtils';
import { CredentialsFactory } from '../factories/credentials.factory';
import { UsersFactory } from '../factories/users.factory';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('Credentials E2E Tests', () => {
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

  it('POST /credentials => should create a new credential', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const credential = new CredentialsFactory(prisma)
      .withTitle('credential')
      .withUrl('https://www.test.com')
      .withUsername('test')
      .withPassword('test')
      .build();
    const { status, body } = await request(app.getHttpServer())
      .post('/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send(credential);
    expect(status).toEqual(HttpStatus.CREATED);
    expect(body).toEqual({
      ...credential,
      id: expect.any(Number),
      userId: userDb.id,
    });
  });

  it('POST /credentials => should return status 400 with wrong body', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const credential = new CredentialsFactory(prisma)
      .withTitle('credential')
      .withUrl('https://www.test.com')
      .withUsername('test')
      .build();
    const { status } = await request(app.getHttpServer())
      .post('/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send(credential);
    expect(status).toEqual(HttpStatus.BAD_REQUEST);
  });

  it('POST /credentials => should return status 409 with duplicated credential title', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { credential } = await new CredentialsFactory(prisma)
      .withTitle('credential')
      .withUrl('https://www.test.com')
      .withUsername('test')
      .withPassword('test')
      .withUserId(userDb.id)
      .persist();
    const { status } = await request(app.getHttpServer())
      .post('/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send(credential);
    expect(status).toEqual(HttpStatus.CONFLICT);
  });

  it("GET /credentials/ => should return user's credentials", async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { credentialDb } = await new CredentialsFactory(prisma)
      .withTitle('credential')
      .withUrl('https://www.test.com')
      .withUsername('test')
      .withPassword('test')
      .withUserId(userDb.id)
      .persist();
    const { status, body } = await request(app.getHttpServer())
      .get('/credentials')
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.OK);
    expect(body).toEqual([credentialDb]);
  });

  it('GET /credentials/:id => should return said credential', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { credentialDb } = await new CredentialsFactory(prisma)
      .withTitle('credential')
      .withUrl('https://www.test.com')
      .withUsername('test')
      .withPassword('test')
      .withUserId(userDb.id)
      .persist();
    const { status, body } = await request(app.getHttpServer())
      .get(`/credentials/${credentialDb.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.OK);
    expect(body).toEqual(credentialDb);
  });

  it('GET /credentials/:id => should return status 403 if credential is not from user', async () => {
    const { userDb: firstUser } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const { userDb: secondUser } = await new UsersFactory(prisma)
      .withEmail('test2@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: secondUser.id });

    const { credentialDb } = await new CredentialsFactory(prisma)
      .withTitle('credential')
      .withUrl('https://www.test.com')
      .withUsername('test')
      .withPassword('test')
      .withUserId(firstUser.id)
      .persist();
    const { status } = await request(app.getHttpServer())
      .get(`/credentials/${credentialDb.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.FORBIDDEN);
  });

  it('GET /credentials/:id => should return status 404 if credential doesnt exist', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { status } = await request(app.getHttpServer())
      .get(`/credentials/1`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('DELETE /credentials/:id => should return said credential', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { credentialDb } = await new CredentialsFactory(prisma)
      .withTitle('credential')
      .withUrl('https://www.test.com')
      .withUsername('test')
      .withPassword('test')
      .withUserId(userDb.id)
      .persist();
    const { status } = await request(app.getHttpServer())
      .delete(`/credentials/${credentialDb.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.OK);
  });

  it('DELETE /credentials/:id => should return status 403 if credential is not from user', async () => {
    const { userDb: firstUser } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const { userDb: secondUser } = await new UsersFactory(prisma)
      .withEmail('test2@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: secondUser.id });

    const { credentialDb } = await new CredentialsFactory(prisma)
      .withTitle('credential')
      .withUrl('https://www.test.com')
      .withUsername('test')
      .withPassword('test')
      .withUserId(firstUser.id)
      .persist();
    const { status } = await request(app.getHttpServer())
      .delete(`/credentials/${credentialDb.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.FORBIDDEN);
  });

  it('DELETE /credentials/:id => should return status 404 if credential doesnt exist', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { status } = await request(app.getHttpServer())
      .delete(`/credentials/1`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.NOT_FOUND);
  });
});
