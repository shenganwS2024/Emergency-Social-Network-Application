import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../server.js'; 
import Messages from '../models/Messages.js';

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
    await Messages.deleteMany({});
});

describe('Chat Privately API', () => {
    test('It should fetch the latest private messages between two users', async () => {
        // Setup: Create two users and some private messages between them
        const sender = 'user1';
        const receiver = 'user2';

        await Messages.create([
            { username: sender, content: 'Hey, how are you?', timestamp: new Date(), status: 'sent', receiver: receiver },
            { username: receiver, content: 'I am good, thanks! How about you?', timestamp: new Date(), status: 'received', receiver: sender }
        ]);

        // Action: Fetch the latest messages between the two users
        const res = await request(app).get(`/messages/${sender}/${receiver}`);
        // Assertions
        expect(res.statusCode).toBe(200);
        expect(res.body.data.messages).toHaveLength(2);
        const messageUsernames = res.body.data.messages.map(msg => msg.username);
        expect(messageUsernames).toContain(sender);
        expect(messageUsernames).toContain(receiver);
    });

    // Additional test to handle scenarios where there are no messages between the users
    test('It should return an empty array if there are no messages between two users', async () => {
        const sender = 'user3';
        const receiver = 'user4';

        // Action: Attempt to fetch messages between two users with no message history
        const res = await request(app).get(`/messages/${sender}/${receiver}`);

        // Assertions
        expect(res.statusCode).toBe(200);
        expect(res.body.data.messages).toHaveLength(0);
    });

    // test to post a new private message from sender to receiver
    test('It should post a new private message from sender to receiver', async () => {
            const sender = 'user5';
            const receiver = 'user6';
            const newMessage = {
                    username: sender,
                    content: 'Hello, this is a new message!',
                    timestamp: new Date(), 
                    status: 'sent'
            };
            // Action: Post a new message from sender to receiver
            const res = await request(app)
                    .post(`/messages/${sender}/${receiver}`)
                    .send(newMessage); 

            // Assertions
            expect(res.statusCode).toBe(201);
            expect(res.body.data.message.username).toBe(sender);
            expect(res.body.data.message.content).toBe(newMessage.content);
            expect(res.body.data.message.receiver).toBe(receiver);
    });
});