import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server.js'; 
import { Users as User } from '../../models/Users.js'; 
import { Announcements } from '../../models/Announcements.js';

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
    // 1
  test('Username Search with Exact Match returns correct users', async () => {

    await User.create([
      { username: "user1", password: "password", status: [{status: "Ok", date: new Date()}], onlineStatus: true },
      { username: "user2", password: "password", status: [{status: "Help", date: new Date()}], onlineStatus: false }
    ]);

    const res = await request(app)
      .get(`/search/username/user1/0`); 

    expect(res.statusCode).toBe(200);

    expect(res.body.data.results).toEqual(expect.arrayContaining([
      expect.objectContaining({
        username: "user1",
        onlineStatus: true
      })
    ]));
  });

    // 2
  test('Pagination for Public Messages handles pagination correctly', async () => {
    const res = await request(app)
      .get(`/search/publicMessage/someKeyword/1`); 

    expect(res.statusCode).toBe(200);

    expect(res.body.data.results.length).toBeLessThanOrEqual(10);
  });

    // 3
  test('Username search with a partial match returns all matching users', async () => {
    await User.create([
      { username: "user1", password: "password", status: [{status: "Ok", date: new Date()}], onlineStatus: true },
      { username: "user2", password: "password", status: [{status: "Help", date: new Date()}], onlineStatus: false }
    ]);

    const res = await request(app)
      .get(`/search/username/user/0`); 

    expect(res.statusCode).toBe(200);
    expect(res.body.data.results).toEqual(expect.arrayContaining([
      expect.objectContaining({
        username: "user1",
        onlineStatus: true
      }),
      expect.objectContaining({
        username: "user2",
        onlineStatus: false
      })
    ]));
  });
  
    // 4
  test('Status search returns users with the specified status', async () => {
    await User.create([
      { username: "user1", password: "password", status: [{status: "Ok", date: new Date()}], onlineStatus: true },
      { username: "user2", password: "password", status: [{status: "Help", date: new Date()}], onlineStatus: false }
    ]);

    const res = await request(app)
      .get(`/search/status/Ok/0`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.results).toEqual(expect.arrayContaining([
      expect.objectContaining({
        username: "user1",
        onlineStatus: true
      })
    ]));
  });

    // 5
    test('Public announcements search returns announcements containing the keyword', async () => {
        const keyword = 'important';
        const announcements = [
          { content: "This is an important announcement", username: "Admin", timestamp: new Date() },
          { content: "This announcement is not important", username: "Admin", timestamp: new Date()}
        ];
        await Announcements.create(announcements);
        
        const res = await request(app)
        .get(`/search/announcement/${keyword}/0`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.results).toEqual(expect.arrayContaining([
            expect.objectContaining({
                content: "This is an important announcement",
                username: "Admin"
            })
        ]));
      });
      
  
  
});
