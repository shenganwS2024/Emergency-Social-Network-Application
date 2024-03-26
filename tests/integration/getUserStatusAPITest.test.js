import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { app } from '../../server.js'; 
import { Users as User } from '../../models/Users.js'; 

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  const hashedPassword = await bcrypt.hash('dummyPassword', 10);
  await User.create({
    username: 'testUser',
    password: hashedPassword,
    status: 'help' 
  });
});

describe('User Status API', () => {
  test('It should respond with the status of the existing user', async () => {
    const res = await request(app).get(`/status/testUser`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status.status).toBe('help'); 
  });

  test('It should respond with the updated status of the existing user', async () => {
    const newStatus = 'ok';
    const timestamp = new Date();

    const res = await request(app)
      .put(`/status/testUser`) 
      .send({
        status: newStatus,
        timestamp: timestamp
      });

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('User status update successful');
  });
});