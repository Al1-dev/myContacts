const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app;
let mongod;

describe('Auth API', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.SECRET = 'testsecret';
    app = require('../server');
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  test('register -> 201 then login -> 200 returns token', async () => {
    const email = 'user@test.com';
    const password = 'abcdefghij';

    const r = await request(app).post('/auth/register').send({ email, password });
    expect([201, 409]).toContain(r.status); // allow reruns

    const l = await request(app).post('/auth/login').send({ email, password });
    expect(l.status).toBe(200);
    expect(l.body.token).toBeDefined();
  });

  test('login invalid -> 401', async () => {
    const l = await request(app).post('/auth/login').send({ email: 'no@no.com', password: 'abcdefghij' });
    expect(l.status).toBe(401);
  });
});


