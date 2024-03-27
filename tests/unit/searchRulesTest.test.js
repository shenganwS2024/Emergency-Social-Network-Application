import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server.js'; 
import { Users as User } from '../../models/Users.js'; 
import { Messages } from '../../models/Messages.js';
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
  await Messages.deleteMany({});
  await Announcements.deleteMany({});
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

    // 6
    test('Search with only stop words returns no results', async () => {

        const stopWords = ['the', 'and', 'a', 'to', 'in', 'is', 'it', 'of', 'that', 'as'];
        const results = [];
        for (const stopWord of stopWords) {
            const res = await request(app)
                .get(`/search/announcement/${stopWord}/0`);
            results.push(res);
        }

        for (const res of results) {
            expect(res.statusCode).toBe(200);
            expect(res.body.data.results).toHaveLength(0);
        }
      });
      
    // 7
    test('Users are ordered by status date pair with newest being sorted first', async () => {

        await User.create([
          { username: "user1", password: "password", status: [{status: "Ok", date: new Date()}], onlineStatus: true },
          { username: "user2", password: "password", status: [{status: "Help", date: new Date()}], onlineStatus: false },
          { username: "user3", password: "password", status: [{status: "Ok", date: new Date()}], onlineStatus: true }
        ]);
        const res = await request(app)
          .get(`/search/username/user/0`);
        console.log('res', res.body.data.results)

        expect(res.statusCode).toBe(200);
      });
      
    // 8
      test('Announcement search with pagination returns correct subset of announcements', async () => {
        const announcements = Array.from({ length: 15 }, (_, index) => ({
          content: `Announcement ${index + 1}`, username: "adminUser", timestamp: new Date(2023, 0, index + 1)
        }));
        await Announcements.create(announcements);
      
        const res = await request(app).get(`/search/announcement/Announcement/1`); 
      
        expect(res.statusCode).toBe(200);
        expect(res.body.data.results.length).toBeLessThanOrEqual(10);
      });

    // 9
    test('Private message search for specific keywords returns correct messages', async () => {
        await Messages.create([
          { username: "user1", receiver: "user2", content: "Hello user2, this is a test message", timestamp: new Date(), status: "sent" },
          { username: "user2", receiver: "user1", content: "Hi user1, I received your test message", timestamp: new Date(), status: "received" },
          { username: "user1", receiver: "public", content: "This is a public message", timestamp: new Date(), status: "sent" }
        ]);
      
        const keyword = 'test';
        const sender = 'user1';
        const receiver = 'user2';

        const res = await request(app).get(`/search/privateMessage/${keyword}/${sender}/${receiver}/0`);
      
        expect(res.statusCode).toBe(200);
        expect(res.body.data.results).not.toEqual(expect.arrayContaining([
          expect.objectContaining({ receiver: "public" })
        ]));
      });
      
    // 10
      test('Search operation failure returns 500 server error', async () => {

        jest.spyOn(mongoose.Model, 'find').mockImplementationOnce(() => Promise.reject(new Error('Simulated database error')));
      
        const res = await request(app)
          .get('/search/publicMessage/someKeyword/0'); 
      
        expect(res.statusCode).toBe(500);
        expect(res.text).toContain('Error search results'); 
      
        mongoose.Model.find.mockRestore();
      });
      
});
