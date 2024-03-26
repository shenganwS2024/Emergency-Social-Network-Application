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

describe('Logout User API', () => {
  test('It should successfully logout an existing user', async () => {
    const newUser = new User({
      username: 'existingUser',
      password: 'password123', 
    });
    const savedUser = await newUser.save();

    const res = await request(app)
      .put('/logout')
      .send({ id: savedUser._id });

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('User logs out successfully');
  });

  test('It should return an error if user is not found', async () => {

    const nonExistentUserId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put('/logout')
      .send({ id: nonExistentUserId });

    expect(res.statusCode).toBe(404);
    expect(res.text).toBe('User not found during logout');
  });

  test('It should handle errors during logout', async () => {

    await mongoose.disconnect();

    const res = await request(app)
      .put('/logout')
      .send({
        id: 'anyId', 
        status: false
      });

    await mongoose.connect(mongod.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    expect(res.statusCode).toBe(500);
    expect(res.text).toBe('Error logout');
  });
});
