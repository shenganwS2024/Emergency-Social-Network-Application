import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../../server.js'
import { Users } from '../../../models/Users.js'; 
import { ResourceNeeds } from '../../../models/ResourceNeeds.js';

let mongod;

beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
    });

afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongod.stop();
});

describe('Resource Needs Flow', () => {
    let userId; 

    beforeEach(async () => {
        const user = await Users.create({
            username: 'testUser',
            email: 'test@example.com',
            password: 'password', 
        });
        userId = user._id; 
    });

    afterEach(async () => {
        await Users.deleteMany({}); 
        await ResourceNeeds.deleteMany({});
    });

    // Test case 1
    test('Report, update with offers, finally fulfill the need, and no further offer accepted', async () => {
        // Step 1: Report a new resource need using the created user's ID
        let response = await request(app)
            .post('/resourceNeeds')
            .send({
                userId: userId.toString(), 
                resourceType: 'Food',
                quantity: 100,
                urgencyLevel: 'Medium',
                otherResourceType: ''
            });
    
        expect(response.statusCode).toBe(201);
        expect(response.body.data.resourceNeed.totalQuantityNeeded).toBe(100);
        expect(response.body.data.resourceNeed.quantityFulfilled).toBe(0);
        const needId = response.body.data.resourceNeed._id;

        // Step 2: Update the resource need with multiple offers
        // First offer
        response = await request(app)
            .put(`/resourceNeeds/${needId}`)
            .send({ offeredQuantity: 40, sender: 'UserB' });
        expect(response.statusCode).toBe(200);
        expect(response.body.resourceNeed.quantityFulfilled).toBe(40);

        // Second offer
        response = await request(app)
            .put(`/resourceNeeds/${needId}`)
            .send({ offeredQuantity: 60, sender: 'UserC' });
        expect(response.statusCode).toBe(200);
        expect(response.body.resourceNeed.quantityFulfilled).toBe(100);

        // further offer should not be accepted
        response = await request(app)
            .put(`/resourceNeeds/${needId}`)
            .send({ offeredQuantity: 100, sender: 'UserC' });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toEqual('This need has already been fulfilled.');
    });

    // Test case 2
    test('Offer a resource support but the quantity exceeds the need', async () => {
        // Step 1: Report a new resource need using the created user's ID
        let response = await request(app)
            .post('/resourceNeeds')
            .send({
                userId: userId.toString(),
                resourceType: 'Water',
                quantity: 100,
                urgencyLevel: 'High',
                otherResourceType: ''
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.data.resourceNeed.totalQuantityNeeded).toBe(100);
        expect(response.body.data.resourceNeed.quantityFulfilled).toBe(0);
        const needId = response.body.data.resourceNeed._id;

        // Step 2: Update the resource need with an offer
        response = await request(app)
            .put(`/resourceNeeds/${needId}`)
            .send({
                offeredQuantity: 120,
                sender: 'UserB'
            });
        
        // Step 3: Verify that the need is rejected
        expect(response.statusCode).toBe(400);

        // Step 4: Verify that the need is not updated
        response = await request(app)
        .get('/resourceNeeds')
        .send();

        expect(response.statusCode).toBe(200);
        expect(response.body.data.resourceNeeds[0].quantityFulfilled).toBe(0);
    });


});
