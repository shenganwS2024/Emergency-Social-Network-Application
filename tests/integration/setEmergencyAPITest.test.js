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
  await User.create([
    { username: "ys2", password: "password", status: [{status: "active", date: new Date()}], onlineStatus: true, contact: {emergency: ['ys3','ys4'], primary: []}, address:''},
    { username: "ys4", password: "password", status: [{status: "busy", date: new Date()}], onlineStatus: false, contact: {emergency: ['ys2', 'ys3'], primary: ['ys2']}, address:'' },
    { username: "ys3", password: "password", status: [{status: "busy", date: new Date()}], onlineStatus: false, contact: {emergency: ['ys2', 'ys4'], primary: ['ys2']}, address:''},
  ]);
});

describe('Set Emergency API', () => {
  test('It should respond with the status of the updating user contact information', async () => {
    const newUser = {
      username: 'ys2',
      contact1: 'ys4', // Contact 1 username
      contact2: 'ys3'  // Contact 2 username
    };
    // Testing the contact update
    const res = await request(app)
    .put(`/contacts/${newUser.username}`) // Adjusted to match your endpoint and include the username
    .send({ contact1: newUser.contact1, contact2: newUser.contact2 });

  expect(res.statusCode).toBe(200); // Assuming 200 is the success status code for updates
  expect(res.text).toBe('Contacts updated successfully');
  });

  test('It should respond with the input of non-existing contacts', async () => {
    const user = {
        username: 'ys3',
        contact1: 'ys4', // Does not exist
        contact2: 'User2'  // Does not exist
      };
  
      const res = await request(app)
        .put(`/contacts/${user.username}`)
        .send({ contact1: user.contact1, contact2: user.contact2 });
  
      expect(res.statusCode).toBe(403);
      expect(res.text).toBe('One or both contacts not found');
  });

  test('It should respond with the input of non-existing contacts', async () => {
    const user = {
        username: 'ys3',
        contact1: 'ys4', // Does not exist
        contact2: 'User2'  // Does not exist
      };
  
      const res = await request(app)
        .put(`/contacts/${user.username}`)
        .send({ contact1: user.contact1, contact2: user.contact2 });
  
      expect(res.statusCode).toBe(403);
      expect(res.text).toBe('One or both contacts not found');
  });

  test('It should respond with valid address input', async () => {
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

  test('It should respond with invalid address input', async () => {
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

  test('It should respond with successfully clear the contact info', async () => {
    const username = 'ys2';

  const res = await request(app)
    .delete(`/contacts/${username}`)
    expect(res.statusCode).toBe(200);
    const updatedUser = await User.findOne({ username: username });
    expect(updatedUser.contact.emergency[0]).toBe(undefined);     

});



});