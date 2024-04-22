import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server.js';
import { Users } from '../../models/Users.js'; 
import bcrypt from 'bcryptjs';

let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
});

beforeEach(async () => {
    await Users.deleteMany({});
});

afterEach(async () => {
    await Users.deleteMany({});
});

/*
* 4 state updating tests for Administer User Profile Use Case
*/
describe('Update Profile', () => {

    // Test Case 1
    it('should update the username of a user', async () => {
        // Create a user
        const originalUser = new Users({ 
            username: 'originalUser', 
            password: 'password123', 
            privilege: 'Admini' 
        });
        await originalUser.save();

        // Update the user's username
        const response = await request(app)
            .put(`/users/profile/${originalUser.username}`)
            .send({ new_username: 'newUser' });

        expect(response.status).toBe(200);
        expect(response.text).toBe('User profile update successful');

        // Verify database update
        const updatedUser = await Users.findOne({ username: 'newUser' });
        expect(updatedUser).not.toBeNull();
        expect(updatedUser.username).toBe('newUser');
        expect(updatedUser.privilege).toBe(originalUser.privilege);
        expect(updatedUser.activeness).toBe(originalUser.activeness);
        expect(updatedUser.acknowledged).toBe(originalUser.acknowledged);

        await Users.deleteMany({});
    });

    // Test Case 2
    it('should update the password of a user and hash it', async () => {
        // Create a user
        const user = new Users({ username: 'testUser', password: 'oldPassword', privilege: 'Citizen' });
        await user.save();
  
        // Update the user's password
        const newPassword = 'newPassword123';
        const response = await request(app)
          .put(`/users/profile/${user.username}`)
          .send({ password: newPassword });

        expect(response.status).toBe(200);
        expect(response.text).toBe('User profile update successful');

        // Verify that the password has been hashed
        const updatedUser = await Users.findOne({ username: 'testUser' });
        expect(updatedUser.password).not.toBe(newPassword); 
        expect(await bcrypt.compare(newPassword, updatedUser.password)).toBe(true);
        expect(updatedUser.privilege).toBe(user.privilege);
        expect(updatedUser.username).toBe(user.username);
        expect(updatedUser.activeness).toBe(user.activeness);
        expect(updatedUser.acknowledged).toBe(user.acknowledged);

        await Users.deleteMany({});
      });

    // Test Case 3
    it('should update the activeness of a user', async () => {
        // Create a user
        const user = new Users({ username: 'activeUser', password: 'password123', activeness: true });
        await user.save();
    
        // Test updateProfile
        const response = await request(app)
          .put(`/users/profile/${user.username}`)
          .send({ activeness: false });
    
        expect(response.status).toBe(200);
        expect(response.text).toContain('User profile update successful');
    
        // Verify database update
        const updatedUser = await Users.findOne({ username: 'activeUser' });
        expect(updatedUser.activeness).toBe(false);
        expect(updatedUser.username).toBe(user.username);
        expect(updatedUser.privilege).toBe(user.privilege);
        expect(updatedUser.acknowledged).toBe(user.acknowledged);
      });    

    // Test Case 4
    it('should update the privilege of a user', async () => {
        // Create two admin users
        const admin1 = new Users({ username: 'admin1', password: 'admin123', privilege: 'Administrator' });
        const admin2 = new Users({ username: 'admin2', password: 'admin123', privilege: 'Administrator' });
        await admin1.save();
        await admin2.save();
    
        // Test updateProfile
        const response = await request(app)
          .put(`/users/profile/${admin2.username}`)
          .send({ privilege: 'Citizen' });

        expect(response.status).toBe(200);
        expect(response.text).toBe('User profile update successful');
    
        // Verify database update
        const updatedUser = await Users.findOne({ username: 'admin2' });
        expect(updatedUser.privilege).toBe('Citizen');
        expect(updatedUser.username).toBe(admin2.username);
        expect(updatedUser.activeness).toBe(admin2.activeness);
        expect(updatedUser.acknowledged).toBe(admin2.acknowledged);

        await Users.deleteMany({});
      });
});

