import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server.js'; 
import { Messages } from '../../models/Messages.js'; 

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
  await Messages.deleteMany({});
});

describe('Get Latest Messages API', () => {
  test('It should successfully retrieve messages for the public receiver', async () => {
    jest.spyOn(Messages, 'find').mockResolvedValue([{ message: 'Public message' }]);

    const res = await request(app)
      .get(`/messages/senderName/public`) 
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.data.messages).toEqual([{ message: 'Public message' }]);
    expect(Messages.find).toHaveBeenCalledWith({ receiver: 'public' });

    Messages.find.mockRestore();
  });

  test('It should successfully retrieve messages between two specific users', async () => {
    const senderName = 'Alice';
    const receiverName = 'Bob';
    jest.spyOn(Messages, 'find').mockResolvedValue([{ message: 'Hello, Bob!' }, { message: 'Hi, Alice!' }]);

    const res = await request(app)
      .get(`/messages/${senderName}/${receiverName}`) 
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.data.messages.length).toBe(2);
    expect(Messages.find).toHaveBeenCalledWith({$or: [
      { username: senderName, receiver: receiverName },
      { username: receiverName, receiver: senderName }
    ]});

    Messages.find.mockRestore();
  });

  test('It should handle errors during messages retrieval', async () => {

    jest.spyOn(Messages, 'find').mockRejectedValue(new Error('Simulated retrieval error'));

    const res = await request(app)
      .get(`/messages/userA/userB`) 
      .send();

    expect(res.statusCode).toBe(500);
    expect(res.text).toBe('Error getting messages');

    Messages.find.mockRestore();
  });
});
