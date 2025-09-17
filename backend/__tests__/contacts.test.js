const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app;
let mongod;
let token;
let contactId;

describe('Contacts API', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.SECRET = 'testsecret';
    app = require('../server');
    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'user@test.com';
    const password = 'abcdefghij';
    await request(app).post('/auth/register').send({ email, password });
    const l = await request(app).post('/auth/login').send({ email, password });
    token = l.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  test('create contact -> 201 and list -> 200', async () => {
    const c = await request(app)
      .post('/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'John', lastName: 'Doe', phone: '+123456789' });
    expect(c.status).toBe(201);
    contactId = c.body.id;

    const g = await request(app)
      .get('/contacts')
      .set('Authorization', `Bearer ${token}`);
    expect(g.status).toBe(200);
    expect(Array.isArray(g.body.contacts)).toBe(true);
  });

  test('update then delete contact', async () => {
    const u = await request(app)
      .patch(`/contacts/${contactId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '+987654321' });
    expect(u.status).toBe(200);

    const d = await request(app)
      .delete(`/contacts/${contactId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(d.status).toBe(204);
  });
});


