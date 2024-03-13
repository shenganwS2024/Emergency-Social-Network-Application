import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { app } from '../server.js'; // Adjust path as necessary
import User from '../models/Users'; // Adjust path as necessary

let mongod;
console.log("app",app)
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
    status: 'help' // Corrected the comment to match the actual status set
  });
});

describe('User Status API', () => {
  test('It should respond with the status of the existing user', async () => {
    const res = await request(app).get(`/status/testUser`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status.status).toBe('help'); // Corrected to match the expected response structure
  });

  //test('It should handle non-existing users correctly', async () => {
  //  const res = await request(app).get(`/status/nonExistingUser`);
  //  console.log("res in not existing user", res.body)
  //  expect(res.statusCode).toBe(404);
  //});

  test('It should respond with the updated status of the existing user', async () => {
    const newStatus = 'ok';
    const timestamp = new Date();

    const res = await request(app)
      .put(`/status/testUser`) // Use the username of the user created in beforeEach
      .send({
        status: newStatus,
        timestamp: timestamp
      });

    // Assuming the response structure for a successful update is a simple text message or similar
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('User status update successful');
    // Note: Comparing dates directly might not work as expected due to serialization; consider comparing the value as string if necessary
  });
});