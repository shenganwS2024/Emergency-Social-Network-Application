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
  await User.create([
    { username: "ys2", password: "password", status: [{status: "active", date: new Date()}], onlineStatus: true, contacts: {emergency: ['ys3','ys4'], primary: []}, address:''},
    { username: "ys4", password: "password", status: [{status: "busy", date: new Date()}], onlineStatus: false, contacts: {emergency: ['ys2', 'ys3'], primary: ['ys2']} },
    { username: "ys3", password: "password", status: [{status: "busy", date: new Date()}], onlineStatus: false, contacts: {emergency: ['ys2', 'ys4'], primary: ['ys2']} },
  ]);
});

describe('Validate Address', () => {
    test('It should successfully update address', async () => {
        // Create test users
       
    
        const address = '211 2nd St, San Francisco';
        const username = 'ys2'; // Username to update address for
    
        // Simulate the API call
        const res = await request(app)
          .put(`/address/${username}`) // Adjusted to match your endpoint and include the username
          .send({ address: address });
    
        expect(res.statusCode).toBe(200); // Check if the status code is 200
        expect(res.body).toHaveProperty('isValid', true); // Check if the address was validated successfully
    
        // Optionally, verify if the address was actually updated in the database
        const updatedUser = await User.findOne({ username: username });
        expect(updatedUser.address).toBe('211 2nd St, San Francisco, CA, USA'); // Or match it with validAddress if it differs
      });

      test('It should NOT successfully update address', async () => {
        // Create test users
    
        const address = '211@agaregtyea';
        const username = 'ys2'; // Username to update address for
    
        // Simulate the API call
        const res = await request(app)
          .put(`/address/${username}`) // Adjusted to match your endpoint and include the username
          .send({ address: address });
    
        expect(res.statusCode).toBe(500); // Check if the status code is 500 (Error)
    
        // Optionally, verify if the address was not updated in the database
        const updatedUser = await User.findOne({ username: username });
        expect(updatedUser.address).toBe(''); 
      });

      test('address current user not valid', async () => {
        // Create test users
    
        const address = '211 2nd St, San Francisco';
        const username = 'ys2s'; // Username to update address for
    
        // Simulate the API call
        const res = await request(app)
          .put(`/address/${username}`) // Adjusted to match your endpoint and include the username
          .send({ address: address });
    
        expect(res.statusCode).toBe(404); // Check if the status code is 200
        expect(res.text).toBe('User not found');
      });
    });

      
   


