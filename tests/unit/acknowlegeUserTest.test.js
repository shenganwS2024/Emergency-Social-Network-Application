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

describe('User Acknowledgement API', () => {
  test('It should successfully acknowledge an existing user', async () => {
    const newUser = new User({
      username: 'acknowledgingUser',
      password: 'password123', 
      acknowledged: false,
    });
    const savedUser = await newUser.save();

    const res = await request(app)
      .put('/acknowledgement')
      .send({ id: savedUser._id });

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('User acknowledged successfully');

    const updatedUser = await User.findById(savedUser._id);
    expect(updatedUser.acknowledged).toBe(true);
  });

  test('It should return an error if user is not found', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put('/acknowledgement')
      .send({ id: nonExistentUserId });

    expect(res.statusCode).toBe(404);
    expect(res.text).toBe('User not found during acknowledgement');
  });

  test('It should handle errors during user acknowledgment', async () => {
    jest.spyOn(User, 'findById').mockImplementationOnce(() => {
      throw new Error('Simulated finding error');
    });

    const res = await request(app)
      .put('/acknowledgement')
      .send({ id: 'anyValidId' });

    expect(res.statusCode).toBe(500);
    expect(res.text).toBe('Error acknowledgement');

    User.findById.mockRestore();
  });
  
});
