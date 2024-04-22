import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server.js';
import { Messages } from '../../models/Messages.js';

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

describe('Post New Message API', () => {
    test('It should post a new private message from sender to receiver', async () => {
        const sender = 'user5';
        const receiver = 'user6';
        const newMessage = {
            username: sender,
            content: 'Hello, this is a new message!',
            timestamp: new Date(),
            status: 'sent',
            receiver
        };

        const res = await request(app)
            .post(`/messages/${sender}/${receiver}`)
            .send(newMessage);

        expect(res.statusCode).toBe(201);
        expect(res.body.data.message.username).toBe(sender);
        expect(res.body.data.message.content).toBe(newMessage.content);
        expect(res.body.data.message.receiver).toBe(receiver);

        // Check if the message is actually saved in the database
        const savedMessage = await Messages.findOne({ username: sender, receiver: receiver });
        expect(savedMessage).toBeTruthy();
        expect(savedMessage.content).toBe(newMessage.content);
    });

    test('It should handle errors during message saving', async () => {
        const sender = 'user7';
        const receiver = 'user8';
        const newMessage = {
            username: sender,
            content: 'This message will fail',
            timestamp: new Date(),
            status: 'sent',
            receiver
        };

        // Simulate an error by closing the mongoose connection before attempting to save
        await mongoose.connection.close();

        const res = await request(app)
            .post(`/messages/${sender}/${receiver}`)
            .send(newMessage);

        expect(res.statusCode).toBe(500);
        expect(res.text).toContain('Error saving message');

        // Reconnect to continue with other tests
        await mongoose.connect(mongod.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
    });
});
