import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server.js'; 
import { Announcements } from '../../models/Announcements.js';  
import { User } from '../../models/Users.js';

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
  await Announcements.deleteMany({});
  await Announcements.create([
    {
      username: 'user1',
      content: 'Announcement 1',
      timestamp: new Date().toISOString(),
    },
    {
      username: 'user2',
      content: 'Announcement 2',
      timestamp: new Date().toISOString(),
    },
  ]);
});

describe('Announcements API', () => {

  // non state updating test
  test('It should retrieve all announcements for page 0', async () => {
    const res = await request(app).get('/announcement/0');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.announcements.length).toBe(0);
  });

});
