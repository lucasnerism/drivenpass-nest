import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { E2eUtils } from '../e2eUtils';
import { UsersFactory } from '../factories/users.factory';

describe('Users E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService = new PrismaService();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
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
    expect(users.length).toEqual(1);
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
});
