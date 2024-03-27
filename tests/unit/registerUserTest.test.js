import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server.js'; 
import { Users as User } from '../../models/Users.js'; 
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

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

describe('Register User API', () => {
  test('It should successfully register a new user', async () => {
    const newUser = {
      username: 'newUser',
      password: 'password123',
    };

    const res = await request(app)
      .post('/registration') 
      .send(newUser);

    expect(res.statusCode).toBe(201);
  });

  test('It should not register a user with invalid input', async () => {
    const invalidUser = {
      username: 'nu', 
      password: 'pass',
      status: 'active',
      role: 'user'
    };

    const res = await request(app)
      .post('/registration') 
      .send(invalidUser);

    expect(res.statusCode).toBe(500); 
  });

  test('It should not register a user with an empty username', async () => {
    const emptyUsername = {
      username: '',
      password: 'password123',
    };

    const res = await request(app)
      .post('/registration') 
      .send(emptyUsername);

    expect(res.statusCode).toBe(500);
  });

  test('It should handle token creation error', async () => {
    const newUser = {
      username: 'validUser',
      password: 'validPassword123',
    };

    jwt.sign.mockImplementation(() => {
      throw new Error('Token creation failed');
    });

    const res = await request(app)
      .post('/registration')
      .send(newUser);

    jwt.sign.mockRestore();

    expect(res.statusCode).toBe(500);
    expect(res.text).toBe('Error creating token');
  });

  test('It should handle errors during the user registration process', async () => {
    const newUser = {
      username: 'userWithError',
      password: 'strongPassword',
      status: 'active',
      role: 'user'
    };

    await mongoose.disconnect();

    const res = await request(app)
      .post('/registration')
      .send(newUser);

    await mongoose.connect(mongod.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    expect(res.statusCode).toBe(500);

  });

});
