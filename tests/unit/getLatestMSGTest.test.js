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
  test('It should successfully retrieve public messages', async () => {
    const mockMessages = [{ message: 'Public message' }];
    jest.spyOn(Messages, 'aggregate').mockResolvedValue(mockMessages);

    const res = await request(app)
      .get(`/messages/senderName/public`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.data.messages).toEqual(mockMessages);
    expect(Messages.aggregate).toHaveBeenCalled();

    Messages.aggregate.mockRestore();
  });

  test('It should successfully retrieve messages between two specific users', async () => {
    const senderName = 'Alice';
    const receiverName = 'Bob';
    const mockMessages = [{ message: 'Hello, Bob!' }, { message: 'Hi, Alice!' }];
    jest.spyOn(Messages, 'aggregate').mockResolvedValue(mockMessages);

    const res = await request(app)
      .get(`/messages/${senderName}/${receiverName}`) 
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.data.messages).toEqual(mockMessages);
    expect(Messages.aggregate).toHaveBeenCalled();

    Messages.aggregate.mockRestore();
  });

  test('It should handle errors during messages retrieval', async () => {
    jest.spyOn(Messages, 'aggregate').mockRejectedValue(new Error('Simulated retrieval error'));

    const res = await request(app)
      .get(`/messages/userA/userB`) 
      .send();

    expect(res.statusCode).toBe(500);
    expect(res.text).toBe('Error getting messages');

    Messages.aggregate.mockRestore();
  });
});
