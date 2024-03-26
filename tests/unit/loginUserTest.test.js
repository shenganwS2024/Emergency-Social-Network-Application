import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { app } from '../../server.js'; 
import { Users as User } from '../../models/Users.js'; 

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

describe('Validate User API', () => {
    test('It should successfully validate an existing user and return a token', async () => {

        const user = new User({
          username: 'existingUser',
          password: 'password123', 
        });
        await user.save();
      

        jwt.sign.mockImplementation(() => 'fakeToken');
      
        const res = await request(app)
          .post('/login')
          .send({
            username: 'existingUser',
            password: 'password123',
          });
      
        expect(res.statusCode).toBe(200);
        expect(res.body.data.token).toBe('fakeToken'); 
      
        jwt.sign.mockRestore();
    });
    
    test('It should return an error for incorrect password', async () => {
  
        const user = new User({
          username: 'userIncorrectPassword',
          password: 'correctPassword',
        });
        await user.save();

        const res = await request(app)
          .post('/login')
          .send({
            username: 'userIncorrectPassword',
            password: 'wrongPassword',
          });

        expect(res.statusCode).toBe(401);
        expect(res.text).toBe('Authentication failed');
    });

    test('It should create a new account for a non-existing user', async () => {
        const res = await request(app)
          .post('/login')
          .send({
            username: 'newUser',
            password: 'password123',
          });

        expect(res.statusCode).toBe(201);
        expect(res.text).toBe('New Account');
    });

    test('It should handle JWT token creation error', async () => {

        const user = new User({
          username: 'userTokenError',
          password: 'password123',
        });
        await user.save();

        // Force jwt.sign to throw an error.
        jwt.sign.mockImplementation(() => {
          throw new Error('Token creation failed');
        });

        const res = await request(app)
          .post('/login')
          .send({
            username: 'userTokenError',
            password: 'password123',
          });

        expect(res.statusCode).toBe(500);
        jwt.sign.mockRestore();
    });

    test('It should handle errors during user lookup', async () => {

        await mongoose.disconnect();

        const res = await request(app)
          .post('/login')
          .send({
            username: 'anyUser',
            password: 'anyPassword',
          });


        await mongoose.connect(mongod.getUri(), {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });

        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('Error during validation');
    });
});
