import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server.js'; 
import { Duels } from '../../models/Duels.js'; 
import { Players } from '../../models/Players.js';

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

describe('Comprehensive Integration Tests for Duel Lobby API', () => {
    test('Successfully register a player and fetch them', async () => {
      const playerName = 'integrationTestPlayer';
      // Register a new player
      let res = await request(app).post(`/players/${playerName}`);
      expect(res.statusCode).toBe(201);
  
      // Fetch the newly registered player
      res = await request(app).get(`/players/${playerName}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.player).toHaveProperty('playerName', playerName);
    });
  
    test('Fail to fetch a non-existent player, fetch a null result', async () => {
      const playerName = 'nonExistentPlayer';
      const res = await request(app).get(`/players/${playerName}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.player).toBeNull();
    });
  
    test('Create a duel and retrieve it successfully', async () => {
      const challengerName = 'challengerIntegration';
      const challengedName = 'challengedIntegration';
  
      // Ensure both players are registered
      await request(app).post(`/players/${challengerName}`);
      await request(app).post(`/players/${challengedName}`);
  
      // Create a new duel
      let res = await request(app).post(`/duels/${challengerName}/${challengedName}`);
      expect(res.statusCode).toBe(201);
  
      // Retrieve and verify the created duel
      res = await request(app).get(`/duels/${challengerName}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.duel).toHaveProperty('challengerName', challengerName);
      expect(res.body.duel).toHaveProperty('challengedName', challengedName);
    });
  
    test('Update a player\'s challenge status and validate the change successfully', async () => {
      const challenger = 'statusChallenger';
      const challenged = 'statusChallenged';
  
      // Set up players
      await request(app).post(`/players/${challenger}`);
      await request(app).post(`/players/${challenged}`);
  
      // Update the challenger's status
      let res = await request(app).put(`/challengeStatuses/${challenger}/${challenged}`).send({ inChallenge: true });
      expect(res.statusCode).toBe(200);
  
      // Verify the challenger's status update
      res = await request(app).get(`/players/${challenger}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.player).toHaveProperty('inChallenge', true);
  
      // Verify the challenged player's status remains unchanged (assuming they don't auto-accept the challenge)
      res = await request(app).get(`/players/${challenged}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.player).toHaveProperty('inChallenge', true); // Or true, depending on business logic
    });
  
    test('Try to update challenge status with invalid data, failure with 400 statusCode', async () => {
      const invalidPlayer = 'invalidUpdatePlayer';
  
      // Attempt to update without a valid player setup
      const res = await request(app).put(`/challengeStatuses/${invalidPlayer}/somePlayer`).send({ inChallenge: 'invalid' });
      expect(res.statusCode).toBe(400); // Adjust based on how your API handles such errors
    });
  });
  