import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server.js'; 

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

describe('Search Results API Integration Tests', () => {
    // 1. non state updating test
  test('Search by Username Context', async () => {
    const response = await request(app).get('/search/username/exampleCriteria/0');
    expect(response.statusCode).toBe(200);
  });

    // 2. non state updating test
  test('Search with Pagination', async () => {
    const response = await request(app).get('/search/publicMessage/exampleCriteria/1');
    expect(response.statusCode).toBe(200);
  });

    // 3. non state updating test
  test('Search with Optional Parameters', async () => {
    // Testing 'privateMessage' context with sender and receiver
    const sender = 'Alice';
    const receiver = 'Bob';
    const response = await request(app).get(`/search/privateMessage/exampleCriteria/0/${sender}/${receiver}`);
    expect(response.statusCode).toBe(200);
  });
});
