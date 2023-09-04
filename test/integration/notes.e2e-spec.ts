import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { E2eUtils } from '../e2eUtils';
import { NotesFactory } from '../factories/notes.factory';
import { UsersFactory } from '../factories/users.factory';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('Notes E2E Tests', () => {
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

  it('POST /notes/ => should return status 401 with invalid token', async () => {
    const note = new NotesFactory(prisma)
      .withTitle('note')
      .withContent('test')
      .build();

    const { status } = await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer token`)
      .send(note);

    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  it('POST /notes => should create a new note', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const note = new NotesFactory(prisma)
      .withTitle('note')
      .withContent('test')
      .build();
    const { status, body } = await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(note);
    expect(status).toEqual(HttpStatus.CREATED);
    expect(body).toEqual({
      ...note,
      id: expect.any(Number),
      userId: userDb.id,
    });
  });

  it('POST /notes => should return status 400 with wrong body', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const note = new NotesFactory(prisma).withContent('test').build();
    const { status } = await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(note);
    expect(status).toEqual(HttpStatus.BAD_REQUEST);
  });

  it('POST /notes => should return status 409 with duplicated note title', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { note } = await new NotesFactory(prisma)
      .withTitle('note')
      .withContent('test')
      .withUserId(userDb.id)
      .persist();
    const { status } = await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(note);
    expect(status).toEqual(HttpStatus.CONFLICT);
  });

  it('GET /notes/ => should return status 401 with invalid token', async () => {
    const { status } = await request(app.getHttpServer())
      .get('/notes/')
      .set('Authorization', `Bearer token`);
    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  it("GET /notes/ => should return user's notes", async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { noteDb } = await new NotesFactory(prisma)
      .withTitle('note')
      .withContent('test')
      .withUserId(userDb.id)
      .persist();
    const { status, body } = await request(app.getHttpServer())
      .get('/notes')
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.OK);
    expect(body).toEqual([noteDb]);
  });

  it('GET /notes/:id => should return status 401 with invalid token', async () => {
    const { status } = await request(app.getHttpServer())
      .get('/notes/1')
      .set('Authorization', `Bearer token`);
    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  it('GET /notes/:id => should return said note', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { noteDb } = await new NotesFactory(prisma)
      .withTitle('note')
      .withContent('test')
      .withUserId(userDb.id)
      .persist();
    const { status, body } = await request(app.getHttpServer())
      .get(`/notes/${noteDb.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.OK);
    expect(body).toEqual(noteDb);
  });

  it('GET /notes/:id => should return status 403 if note is not from user', async () => {
    const { userDb: firstUser } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const { userDb: secondUser } = await new UsersFactory(prisma)
      .withEmail('test2@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: secondUser.id });

    const { noteDb } = await new NotesFactory(prisma)
      .withTitle('note')
      .withContent('test')
      .withUserId(firstUser.id)
      .persist();
    const { status } = await request(app.getHttpServer())
      .get(`/notes/${noteDb.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.FORBIDDEN);
  });

  it('GET /notes/:id => should return status 404 if note doesnt exist', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { status } = await request(app.getHttpServer())
      .get(`/notes/1`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.NOT_FOUND);
  });

  it('DELETE /notes/:id => should return status 401 with invalid token', async () => {
    const { status } = await request(app.getHttpServer())
      .delete('/notes/1')
      .set('Authorization', `Bearer token`);
    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  it('DELETE /notes/:id => should delete said note', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { noteDb } = await new NotesFactory(prisma)
      .withTitle('note')
      .withContent('test')
      .withUserId(userDb.id)
      .persist();
    const { status } = await request(app.getHttpServer())
      .delete(`/notes/${noteDb.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.OK);

    const notes = await prisma.note.findMany({});
    expect(notes).toHaveLength(0);
  });

  it('DELETE /notes/:id => should return status 403 if note is not from user', async () => {
    const { userDb: firstUser } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const { userDb: secondUser } = await new UsersFactory(prisma)
      .withEmail('test2@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: secondUser.id });

    const { noteDb } = await new NotesFactory(prisma)
      .withTitle('note')
      .withContent('test')
      .withUserId(firstUser.id)
      .persist();
    const { status } = await request(app.getHttpServer())
      .delete(`/notes/${noteDb.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.FORBIDDEN);
  });

  it('DELETE /notes/:id => should return status 404 if note doesnt exist', async () => {
    const { userDb } = await new UsersFactory(prisma)
      .withEmail('test@test.com')
      .withPassword('1234567aB!')
      .persist();
    const token = jwtService.sign({ id: userDb.id });

    const { status } = await request(app.getHttpServer())
      .delete(`/notes/1`)
      .set('Authorization', `Bearer ${token}`);
    expect(status).toEqual(HttpStatus.NOT_FOUND);
  });
});
