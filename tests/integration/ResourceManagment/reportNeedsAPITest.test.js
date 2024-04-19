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
  test('Report a new resource need and update that resource need with a quantity offer and notify the need initiator', async () => {
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
    expect(response.body.data.resourceNeed.progress).toBe(0);

    // Step 2: Update the resource need with an offer
    const needId = response.body.data.resourceNeed._id;

    response = await request(app)
      .put(`/resourceNeeds/${needId}`)
      .send({
        offeredQuantity: 20,
        sender: 'UserB' 
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.resourceNeed.quantityFulfilled).toBe(20);
    expect(response.body.resourceNeed.progress).toBe(20);
    expect(response.body.resourceNeed.quantity).toBe(80);

    // Step 3: Verify that the user who reported the need received a notification
    response = await request(app)
      .get('/notifications/testUser') 
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({
        receiverUsername: 'testUser', 
        senderUsername: 'UserB',
        offeredQuantity: 20,
        resourceType: 'Water'
      })
    ]));
  });

  // Test case 2
  test('Report a new resource need with type "Other", but the resource type is not provided, the need should be rejected', async () => {
    
    // Step 1: Report a new resource but the resource type is not provided so rejected
    let response = await request(app)
      .post('/resourceNeeds')
      .send({
        userId: userId.toString(), 
        resourceType: 'Other',
        quantity: 100,
        urgencyLevel: 'High',
        otherResourceType: ''
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toEqual(expect.arrayContaining([
      'Other resource type is required'
    ]));

    // Step 2: Verify that no resource need was created
    response = await request(app)
      .get('/resourceNeeds')
      .send();

    expect(response.statusCode).toBe(200);
    // expect no needs generated
    expect(response.body.data.resourceNeeds).toEqual([]);
    
  });

  // Test case 3
  test('Report three new resource needs with different urgency levels and verify that they are sorted by urgency level', async () => {
    // Step 1: Report three new resource needs with different urgency levels
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
    expect(response.body.data.resourceNeed.urgencyLevel).toBe('High');

    response = await request(app)
      .post('/resourceNeeds')
      .send({
        userId: userId.toString(),
        resourceType: 'Food',
        quantity: 100,
        urgencyLevel: 'Low',
        otherResourceType: ''
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.data.resourceNeed.urgencyLevel).toBe('Low');

    response = await request(app)
      .post('/resourceNeeds')
      .send({
        userId: userId.toString(),
        resourceType: 'Shelter',
        quantity: 100,
        urgencyLevel: 'Medium',
        otherResourceType: ''
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.data.resourceNeed.urgencyLevel).toBe('Medium');

    // Step 2: Fetch the resource needs and verify that they are sorted by urgency level
    response = await request(app)
      .get('/resourceNeeds')
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body.data.resourceNeeds[0].urgencyLevel).toBe('High');
    expect(response.body.data.resourceNeeds[1].urgencyLevel).toBe('Medium');
    expect(response.body.data.resourceNeeds[2].urgencyLevel).toBe('Low');
  });

  // Test case 4
  test('Citizen could successfully delete a resource support notification after viewing it', async () => {
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
    expect(response.body.data.resourceNeed.progress).toBe(0);

    // Step 2: Update the resource need with an offer
    const needId = response.body.data.resourceNeed._id;

    response = await request(app)
      .put(`/resourceNeeds/${needId}`)
      .send({
        offeredQuantity: 20,
        sender: 'UserB' 
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.resourceNeed.quantityFulfilled).toBe(20);
    expect(response.body.resourceNeed.progress).toBe(20);
    expect(response.body.resourceNeed.quantity).toBe(80);

    // Step 3: Verify that the user who reported the need received a notification
    response = await request(app)
      .get('/notifications/testUser') 
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({
        receiverUsername: 'testUser', 
        senderUsername: 'UserB',
        offeredQuantity: 20,
        resourceType: 'Water'
      })
    ]));

    // Step 4: Delete the notification
    response = await request(app)
      .delete(`/notifications/${response.body[0]._id}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Notification deleted successfully');
  });

});
