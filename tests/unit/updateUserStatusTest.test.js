import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server.js'; 
import { Users as User } from '../../models/Users.js'; 

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

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Search Functionality', () => {
  test('Username Search with Exact Match returns correct user(s)', async () => {

    await User.create([
      { username: "johnDoe", password: "password", status: [{status: "active", date: new Date()}], onlineStatus: true },
      { username: "janeDoe", password: "password", status: [{status: "busy", date: new Date()}], onlineStatus: false }
    ]);

 
    const res = await request(app)
      .get(`/search/username/johnDoe/0`); 

    expect(res.statusCode).toBe(200);

    expect(res.body.data.results).toEqual(expect.arrayContaining([
      expect.objectContaining({
        username: "johnDoe",
        onlineStatus: true
      })
    ]));
  });

  test('Pagination for Public Messages handles pagination correctly', async () => {


    const res = await request(app)
      .get(`/search/publicMessage/someKeyword/1`); 

    expect(res.statusCode).toBe(200);

    expect(res.body.data.results.length).toBeLessThanOrEqual(10);
  });

});
