import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Users, privilegeChangeCheck } from '../../models/Users.js';
import { updateProfile, validateUser, updateProfileByAdmin } from '../../controllers/userController'; 
import { Messages } from '../../models/Messages.js';
import { getLatestMessages } from '../../controllers/publicChatController.js';
import { Announcements } from '../../models/Announcements.js';
import { getLatestAnnouncements, postNewAnnouncement } from '../../controllers/announcementController.js';
import { allowToSpeedTest } from '../../controllers/switchStateController.js';

let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Insert the default admin user
    await new Users({
        username: 'ESNAdmin',
        password: 'admin',
        privilege: 'Administrator',
        status: [{ status: 'Ok' }]
    }).save();
    
    await new Users({ 
        username: 'coordinator', 
        password: 'password123', 
        privilege: 'Coordinator' 
    }).save();

    await new Users({
        username: 'original2',
        password: 'password123',
        privilege: 'Citizen'
    }).save();

    await new Users({
        username: 'activeUser',
        password: 'password123',
        privilege: 'Citizen'
    }).save();

    await new Messages({
        username: 'original2',
        content: 'Hello',
        timestamp: Date.now(),
        status: 'undefined',
        receiver: 'public'
    }).save();

});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
});

/*
* Unit test for the At-Least-One-Administor Rule written and pass
*/

describe('At-Least-One-Administor Rule Test', () => {

    // Test Case 1 positive
    it('should prevent the last administrator from changing their privilege level', async () => {

        const canChangePrivilege = await privilegeChangeCheck('ESNAdmin', 'Citizen');
        const updatedUser = await Users.findOne({ username: 'ESNAdmin' });

        expect(canChangePrivilege).toBe(false);
        expect(updatedUser.privilege).toBe('Administrator');
        expect(updatedUser.username).toBe('ESNAdmin');
        expect(updatedUser.status[0].status).toBe('Ok');
        expect(updatedUser.activeness).toBe(true);
        expect(updatedUser.onlineStatus).toBe(false);
        expect(updatedUser.acknowledged).toBe(false);
    });

});

/*
* Unit tests for the Initial Administrator Rule written and pass
*/

describe('Initial Administrator Rule Test', () => {

    // Test Case 1 positive
    it('should have an initial administrator with predefined credentials', async () => {
        const initialAdmin = await Users.findOne({ username: 'ESNAdmin' });

        expect(initialAdmin).not.toBeNull();
        expect(initialAdmin.username).toBe('ESNAdmin');
        expect(initialAdmin.privilege).toBe('Administrator');
        expect(initialAdmin.status[0].status).toBe('Ok');
        expect(initialAdmin.activeness).toBe(true);
        expect(initialAdmin.onlineStatus).toBe(false);
        expect(initialAdmin.acknowledged).toBe(false);
    });

});

/*
* Unit tests for the Administrator Action of User Profile Rule written and pass
*/

describe('Administrator Action of User Profile Rule Test', () => {

    // Test Case 1 positive
    it('should allow an admin to update username', async () => {
        const user = await Users.create({
            username: 'original',
            password: 'password123',
            privilege: 'Citizen'
        });

        await updateProfile({
            params: { username: 'original' },
            body: { new_username: 'updated' }
        }, {
            status: (statusCode) => ({
                send: () => ({ statusCode })
            })
        });

        const updatedUser = await Users.findOne({ username: 'updated' });
        expect(updatedUser).toBeTruthy();
        expect(updatedUser.username).toBe('updated');
        expect(updatedUser.privilege).toBe('Citizen');
        expect(updatedUser.status[0].status).toBe('undefined');
        expect(updatedUser.activeness).toBe(true);
        expect(updatedUser.onlineStatus).toBe(false);
        expect(updatedUser.acknowledged).toBe(false);
    });

    // Test Case 2 positive
    it('should allow an admin to update privilege level', async () => {
        const user = await Users.create({
            username: 'original1',
            password: 'password123',
            privilege: 'Administrator'
        });

        await updateProfile({
            params: { username: 'original1' },
            body: { privilege: 'Coordinator' }
        }, {
            status: (statusCode) => ({
                send: () => ({ statusCode })
            })
        });

        const updatedUser = await Users.findOne({ username: 'original1' });
        expect(updatedUser).toBeTruthy();
        expect(updatedUser.username).toBe('original1');
        expect(updatedUser.privilege).toBe('Coordinator');
        expect(updatedUser.status[0].status).toBe('undefined');
        expect(updatedUser.activeness).toBe(true);
        expect(updatedUser.onlineStatus).toBe(false);
        expect(updatedUser.acknowledged).toBe(false);
    });

    // Test Case 3 positive
    it('should allow an admin to update user activeness', async () => {

        await updateProfile({
            params: { username: 'original2' },
            body: { activeness: false }
        }, {
            status: (statusCode) => ({
                send: () => ({ statusCode })
            })
        });

        const updatedUser = await Users.findOne({ username: 'original2' });
        expect(updatedUser).toBeTruthy();
        expect(updatedUser.username).toBe('original2');
        expect(updatedUser.privilege).toBe('Citizen');
        expect(updatedUser.status[0].status).toBe('undefined');
        expect(updatedUser.activeness).toBe(false);
        expect(updatedUser.onlineStatus).toBe(false);
        expect(updatedUser.acknowledged).toBe(false);
    });

    // Test Case 4 negative
    it('should not allow an admin to update an unauthorized field, such as emergency status', async () => {
        const user = await Users.create({
            username: 'original3',
            password: 'password123',
            privilege: 'Citizen'
        });

        await updateProfile({
            params: { username: 'original3' },
            body: { status: 'Ok' }
        }, {
            status: (statusCode) => ({
                send: () => ({ statusCode })
            })
        });

        const updatedUser = await Users.findOne({ username: 'original3' });
        expect(updatedUser).toBeTruthy();
        expect(updatedUser.username).toBe('original3');
        expect(updatedUser.privilege).toBe('Citizen');
        expect(updatedUser.status[0].status).toBe('undefined');
        expect(updatedUser.activeness).toBe(true);
        expect(updatedUser.onlineStatus).toBe(false);
        expect(updatedUser.acknowledged).toBe(false);
    });
    
});

/*
* Unit tests for the Privilege Rule written and pass
*/

describe('Privilege Rule Test', () => {

    // Test Case 1 positive
    it('should allow a coordinator to post a public announcement', async () => {
        // user coordinator is with privilege level Coordinator
        await postNewAnnouncement({
            body: { username: 'coordinator', content: 'Hello', timestamp: Date.now() }
        }, {
            status: (statusCode) => ({
                send: () => ({ statusCode })
            })
        });

        const announcement = await Announcements.findOne({ username: 'coordinator' });
        expect(announcement).toBeTruthy();
        expect(announcement.content).toBe('Hello');
        expect(announcement.timestamp).toBeTruthy();
    });

    // Test Case 2 positive
    it('should allow an administrator to post a public announcement', async () => {
        await postNewAnnouncement({
            body: { username: 'ESNAdmin', content: 'Hello', timestamp: Date.now() }
        }, {
            status: (statusCode) => ({
                send: () => ({ statusCode })
            })
        });

        const announcement = await Announcements.findOne({ username: 'ESNAdmin' });
        expect(announcement).toBeTruthy();
        expect(announcement.content).toBe('Hello');
        expect(announcement.timestamp).toBeTruthy();
    });

    // Test Case 3 negative
    it('should not allow a Citizen to post a public announcement', async () => {
        await postNewAnnouncement({
            body: { username: 'activeUser', content: 'Hello', timestamp: Date.now() }
        }, {
            status: (statusCode) => ({
                send: () => ({ statusCode })
            }) 
        });

        const announcement = await Announcements.findOne({ username: 'activeUser' });
        expect(announcement).toBeNull();
    });

    // Test Case 4 negative
    it('should not allow a Coordinator to modify user profile', async () => {
        // user coordinator is with privilege level Coordinator
        await updateProfileByAdmin({
            params: { username: 'coordinator' },
            body: { privilege: 'Administrator' }
        }, {
            status: (statusCode) => ({
                send: () => ({ statusCode })
            })
        });

        const updatedUser = await Users.findOne({ username: 'coordinator' });
        // ensure the user's privilege level is not changed
        expect(updatedUser.privilege).toBe('Coordinator');
        expect(updatedUser.username).toBe('coordinator');
        expect(updatedUser.status[0].status).toBe('undefined');
        expect(updatedUser.activeness).toBe(true);
        expect(updatedUser.onlineStatus).toBe(false);
        expect(updatedUser.acknowledged).toBe(false);
    });

    // Test Case 5 positive
    it('should allow a Citizen to join the community', async () => {
        const newUser = await Users.create({ username: 'newCitizen', password : 'pass123', privilege: 'Citizen'});
        await newUser.save();
        const req = {
            body: { username: 'newCitizen', password: 'pass123' }
        };

        await validateUser(req, {   
            status: (statusCode) => ({
                send: () => ({ statusCode })
            })
        });

        const user = await
        Users.findOne({ username: 'newCitizen' });
        expect(user).toBeTruthy();
        expect(user.username).toBe('newCitizen');
        expect(user.privilege).toBe('Citizen');
        expect(user.status[0].status).toBe('undefined');
        expect(user.activeness).toBe(true);
    });

    // Test Case 6 negative
    it('should not allow an unauthorized users to perform an ESN speed test', async () => {
        // user activeUser is with privilege level Citizen
        const req = {
            body: { username: 'activeUser' }
        };

        const res = {
            statusCode: null,
            message: '',
            status(code) {
                this.statusCode = code;
                return this;
            },
            send(msg) {
                this.message = msg;
                return this;
            }
        };

        await allowToSpeedTest(req, res);

        expect(res.statusCode).toBe(403);
        expect(res.message).toContain('User does not have the privilege to switch to speed test mode');
    });

});

/*
* Unit tests for the Active-Inactive Rule written and pass
*/

describe('Active-Inactive Rule Test', () => {

    // Test Case 1 positive
    it('new accounts should be active by default', async () => {
        const newUser = await Users.create({ username: 'newUser', password: 'pass123' });
        await newUser.save();
        const req = {
            body: { username: 'newuser', password: 'pass123'}
        };

        await validateUser(req, {
            status: (statusCode) => ({
                send: () => ({ statusCode })
            })
        });

        const user = await Users.findOne({ username: 'newUser' });
        expect(user.activeness).toBe(true);
        // ensure other fields are not affected
        expect(user).toBeTruthy();
        expect(user.username).toBe('newUser');
        expect(user.privilege).toBe('Citizen');
        expect(user.status[0].status).toBe('undefined');
        expect(user.onlineStatus).toBe(false);
        expect(user.acknowledged).toBe(false);

    });

    // Test Case 2 negative
    it('prevents inactive users from logging in', async () => {
        // original2 is an inactive user just altered by the admin from the previous test
        const req = {
            body: { username: 'original2', password: 'password123' }
        };

        const res = {
            statusCode: null,
            message: '',
            status(code) {
                this.statusCode = code;
                return this;
            },
            send(msg) {
                this.message = msg;
                return this;
            }
        };

        await validateUser(req, res);

        expect(res.statusCode).toBe(403);
        expect(res.message).toContain('Inactive user');
    });

    // Test Case 3 negative
    it('ensures inactive user public chat message is inaccessible', async () => {
        // original2 is an inactive user just altered by the admin from the previous test
        const req = {
            params: { senderName: 'original2', receiverName: 'public' }
        };

        const res = {
            statusCode: null,
            message: '',
            status(code) {
                this.statusCode = code;
                return this;
            },
            send(msg) {
                this.message = msg;
                return this;
            }
        };

        await getLatestMessages(req, res);

        expect(res.statusCode).toBe(500);
        expect(res.message).toContain('Error getting messages');
    });

    // Test Case 4 positive
    it('allows admins to access inactive user profiles', async () => {
        await Users.create({ username: 'adminViewableUser', password: 'test123', activeness: false });

        await updateProfile({
            params: { username: 'adminViewableUser' },
            body: { privilege: 'Coordinator' }
        }, {
            status: (statusCode) => ({
                send: () => ({ statusCode })
            })
        });

        const updatedUser = await Users.findOne({ username: 'adminViewableUser' });
        expect(updatedUser).toBeTruthy();
        expect(updatedUser.username).toBe('adminViewableUser');
        expect(updatedUser.privilege).toBe('Coordinator');
        expect(updatedUser.status[0].status).toBe('undefined');
        expect(updatedUser.activeness).toBe(false);
        expect(updatedUser.onlineStatus).toBe(false);
        expect(updatedUser.acknowledged).toBe(false);
    });


    // Test Case 5 
    it('ensures inactive coordinator annoucement is inaccessible', async () => {
        
        await new Users({
            username: 'activeUserWithAnnouncement',
            password: 'password123',
            privilege: 'Coordinator',
        }).save();
    
        await new Announcements({
            username: 'activeUserWithAnnouncement',
            content: 'Hello',
            timestamp: Date.now()
        }).save();

        const req = {
            params: { pageNumber: '0' }
        };

        const res = {
            statusCode: null,
            message: '',
            status(code) {
                this.statusCode = code;
                return this;
            },
            send(msg) {
                this.message = msg;
                return this;
            }
        };

        await getLatestAnnouncements(req, res);

        expect(res.statusCode).toBe(500);
        expect(res.message).toContain('Error getting announcements');
    });

});
