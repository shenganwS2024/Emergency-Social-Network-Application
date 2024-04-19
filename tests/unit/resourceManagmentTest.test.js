import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server'; 
import { ResourceNeeds } from '../../models/ResourceNeeds';
import { Notification } from '../../models/Notifications';
import { Users } from '../../models/Users';

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

describe('Resource Need Controller Tests', () => {
    let userId = '';

    beforeEach(async () => {
        await ResourceNeeds.deleteMany({});
        await Notification.deleteMany({});
        await Users.deleteMany({});
    
        const user = new Users({
          username: 'testUser',
          password: 'password'
        });
        await user.save();
        userId = user._id;
      });

    // Test case 1
  it('Successfully reports a resource need with valid data', async () => {

    const res = await request(app)
      .post('/resourceNeeds')
      .send({
        userId: userId.toString(),
        resourceType: 'Water',
        quantity: 100,
        urgencyLevel: 'High',
        otherResourceType: ''
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.resourceNeed.resourceType).toBe('Water');
  });

    // Test case 2
    it('Fails to report a resource need with invalid urgency level missing', async () => {
        
        const res = await request(app)
          .post('/resourceNeeds')
          .send({
            userId: userId.toString(),
            resourceType: 'Water',
            quantity: 100,
          });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(expect.arrayContaining([
            'Urgency level is required'
          ]));

      } );
      
    // Test case 3
    it('Fails to report a resource need with invalid quantity', async () => {
        
        const res = await request(app)
          .post('/resourceNeeds')
          .send({
            userId: userId.toString(),
            resourceType: 'Water',
            quantity: 'invalid',
            urgencyLevel: 'High',
          });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(expect.arrayContaining([
            'Quantity is invalid'
          ]));
      } );

    // Test case 4
    it('Fails to report a resource need with invalid resource type', async () => {
        
        const res = await request(app)
          .post('/resourceNeeds')
          .send({
            userId: userId.toString(),
            quantity: 100,
            urgencyLevel: 'High',
          });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(expect.arrayContaining([
            'Resource type is required'
          ]));
      } );

    // Test case 5
    it('Fails to report a resource need with invalid other resource type', async () => {
        
        const res = await request(app)
          .post('/resourceNeeds')
          .send({
            userId: userId.toString(),
            resourceType: 'Other',
            quantity: 100,
            urgencyLevel: 'High',
          });
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(expect.arrayContaining([
            'Other resource type is required'
          ]));
      } );

    // Test case 6
    it('successfully get reported resource needs', async () => {
        const res = await request(app)
          .get('/resourceNeeds')
          .send();
    
        expect(res.statusCode).toBe(200);
        expect(res.body.data.resourceNeeds).toEqual([]);
      } );

    // Test case 7
    it('Test for Valid Offer Submission', async () => {
        const res = await request(app)
          .post('/resourceNeeds')
          .send({
            userId: userId.toString(),
            resourceType: 'Water',
            quantity: 100,
            urgencyLevel: 'High',
            otherResourceType: ''
          });
    
        const needId = res.body.data.resourceNeed._id;
    
        const response = await request(app)
          .put(`/resourceNeeds/${needId}`)
          .send({ offeredQuantity: 40, sender: 'UserB' });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.resourceNeed.quantityFulfilled).toBe(40);
      } );

    // Test case 8
    it('Test for Invalid Offer Submission', async () => {
        const res = await request(app)
          .post('/resourceNeeds')
          .send({
            userId: userId.toString(),
            resourceType: 'Water',
            quantity: 100,
            urgencyLevel: 'High',
            otherResourceType: ''
          });
    
        const needId = res.body.data.resourceNeed._id;
    
        let response = await request(app)
          .put(`/resourceNeeds/${needId}`)
          .send({ offeredQuantity: 120, sender: 'UserB' });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toEqual('This need has already been fulfilled.');
    
        response = await request(app)
          .get('/resourceNeeds')
          .send();
    
        expect(response.statusCode).toBe(200);
        expect(response.body.data.resourceNeeds[0].quantityFulfilled).toBe(0);
      } );

    // Test case 9
    it('Fails to report a resource need with all fields missing', async () => {
        
        const res = await request(app)
          .post('/resourceNeeds')
          .send({});
    
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(expect.arrayContaining([
            "Resource type is required", 
            "Quantity is invalid", 
            "Urgency level is required"
          ]));
      } );

    // Test case 10
    it('Fails to report a resource offer with messing input', async () => {
            
            const res = await request(app)
            .put('/resourceNeeds/123')
            .send({});
        
            expect(res.statusCode).toBe(500);
            expect(res.body.message).toEqual('Internal server error');
      } );

      
});
