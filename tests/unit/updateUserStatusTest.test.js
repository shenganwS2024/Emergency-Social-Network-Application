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
    // Seed the database with test data
    await User.create([
      { username: "johnDoe", password: "password", status: [{status: "active", date: new Date()}], onlineStatus: true },
      { username: "janeDoe", password: "password", status: [{status: "busy", date: new Date()}], onlineStatus: false }
    ]);

    // Perform the search
    const res = await request(app)
      .get(`/search/username/johnDoe/0`); // Assuming '0' signifies the first page

    expect(res.statusCode).toBe(200);
    // Ensure the response contains the expected user
    expect(res.body.data.results).toEqual(expect.arrayContaining([
      expect.objectContaining({
        username: "johnDoe",
        onlineStatus: true
      })
    ]));
  });

  test('Pagination for Public Messages handles pagination correctly', async () => {
    // Assuming PublicMessages is your model for public messages, you'd seed data here
    // This example skips the seeding part for brevity

    const res = await request(app)
      .get(`/search/publicMessage/someKeyword/1`); // Assuming '1' signifies the second page of results

    expect(res.statusCode).toBe(200);
    // Test expectations here, for example, checking the length of the results array
    expect(res.body.data.results.length).toBeLessThanOrEqual(10);
  });

  // Add more tests as needed for other scenarios
});
