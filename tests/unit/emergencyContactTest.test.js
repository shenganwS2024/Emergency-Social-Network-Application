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
    { username: "ys2", password: "password", status: [{status: "active", date: new Date()}], onlineStatus: true, contacts: {emergency: ['ys3','ys4'], primary: []} },
    { username: "ys4", password: "password", status: [{status: "busy", date: new Date()}], onlineStatus: false, contacts: {emergency: ['ys2', 'ys3'], primary: ['ys2']} },
    { username: "ys3", password: "password", status: [{status: "busy", date: new Date()}], onlineStatus: false, contacts: {emergency: ['ys2', 'ys4'], primary: ['ys2']} },
  ]);
});

describe('Validate Contact Identity', () => {
    test('It should successfully update contacts', async () => {
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

      test('It should update the primary contact field of the emergency contacts', async () => {
        const user = {
          username: 'ys2',
          contact1: 'ys4', 
          contact2: 'ys3'  
        };
    
        const res = await request(app)
          .put(`/contacts/${user.username}`)
          .send({ contact1: user.contact1, contact2: user.contact2 });

        const contact1 = await User.findOne({ username: user.contact1 });
        const contact2 = await User.findOne({ username: user.contact2 });
        expect(contact1.contact.primary).toEqual([user.username]);
        expect(contact2.contact.primary).toEqual([user.username]);
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe('Contacts updated successfully');
      });


      test('It should not update the contact due to duplicity', async () => {
        // Assuming 'newUser' contains valid user details and 'username' is part of it
        const newUser = {
          username: 'testUser',
          contact1: '1111', // Contact 1 username
          contact2: '1111'  // Contact 2 username
        };
        // Testing the contact update
        const res = await request(app)
          .put(`/contacts/${newUser.username}`) // Adjusted to match your endpoint and include the username
          .send({ contact1: newUser.contact1, contact2: newUser.contact2 });
    
        expect(res.statusCode).toBe(401); // Assuming 200 is the success status code for updates
        expect(res.text).toBe('Contacts cannot be the same');
      });

      test('Contact username cannot be the same as the current username', async () => {
        const user = {
          username: 'ys2',
          contact1: 'ys2', // Same as username
          contact2: 'ys4'
        };
    
        const res = await request(app)
          .put(`/contacts/${user.username}`)
          .send({ contact1: user.contact1, contact2: user.contact2 });
    
        expect(res.statusCode).toBe(402);
        expect(res.text).toBe('Contacts cannot be the same as the user');
      });

      test('It should handle non-existent contact usernames', async () => {
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

      test('It should handle current user invalid', async () => {
        const user = {
          username: 'ys3s',// Does not exist
          contact2: 'ys2', // Does not exist
          contact1: 'ys4', // Does not exist
        };
    
        const res = await request(app)
          .put(`/contacts/${user.username}`)
          .send({ contact1: user.contact1});
    
        expect(res.statusCode).toBe(404);
        expect(res.text).toBe('User not found');
      });

      test('It should handle functionality of the clear contact button - clear contacts', async () => {
          const username = 'ys2';
    
        const res = await request(app)
          .delete(`/contacts/${username}`)
          expect(res.statusCode).toBe(200);
          const updatedUser = await User.findOne({ username: username });
          expect(updatedUser.contact.emergency[0]).toBe(undefined);     
    
      });

      test('It should handle functionality of the clear contact button - clear address', async () => {
          const username = 'ys2';
    
        const res = await request(app)
          .delete(`/address/${username}`)
          expect(res.statusCode).toBe(200);
          const updatedUser = await User.findOne({ username: username });
          expect(updatedUser.address).toBe('');     
    
      });
   

});
