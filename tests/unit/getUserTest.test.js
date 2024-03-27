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

describe('Get User API', () => {
  test('It should successfully retrieve users and their latest status', async () => {

    const user1 = new User({
      username: 'user1',
      password: 'password',
      status: [{ status: 'Online', date: new Date() }],
    });
    const user2 = new User({
      username: 'user2',
      password: 'password',
      status: [{ status: 'Offline', date: new Date() }], 
    });
    await User.insertMany([user1, user2]);

    const res = await request(app)
      .get('/users') 
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.data.users.length).toBe(2);
    expect(res.body.data.users.some(u => u.status === 'Online')).toBe(true);
    expect(res.body.data.users.some(u => u.status === 'Offline')).toBe(true);
  });

  test('It should handle errors during user retrieval', async () => {
    jest.spyOn(User, 'find').mockImplementationOnce(() => {
      throw new Error('Simulated retrieval error');
    });

    const res = await request(app)
      .get('/users')
      .send();

    expect(res.statusCode).toBe(500);
    expect(res.text).toBe('Users get server error');

    User.find.mockRestore();
  });

  test('It should handle users without statuses by defaulting to "undefined"', async () => {

    const userWithoutStatus = new User({
      username: 'noStatusUser',
      password: 'password',

      status: []
    });
    await userWithoutStatus.save();


    const res = await request(app)
      .get('/users') 
      .send();


    expect(res.statusCode).toBe(200);
    expect(res.body.data.users).toHaveLength(1);
    expect(res.body.data.users[0].status).toBe('undefined');


    expect(res.body.data.users[0].username).toBe('noStatusUser');
});
});
