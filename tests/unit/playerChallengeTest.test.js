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

beforeEach(async () => {
  await Duels.deleteMany({});
  await Players.deleteMany({});
});

describe('Duel Lobby API Routes', () => {
  test('GET /players - fetch all players successfully', async () => {
    const players = [
      { playerName: 'player1', inChallenge: false, ready: true },
      { playerName: 'player2', inChallenge: false, ready: false }
    ];
    await Players.insertMany(players);
    const res = await request(app).get('/players');
    expect(res.statusCode).toBe(200);
    expect(res.body.players).toHaveLength(players.length);
  });

  test('GET /players/:playerName - fetch a single player successfully', async () => {
    const playerName = 'testPlayer';
    await Players.create({ playerName: playerName, inChallenge: false, ready: true });
    const res = await request(app).get(`/players/${playerName}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.player).toHaveProperty('playerName', playerName);
  });

  test('POST /players/:playerName - register a new player successfully', async () => {
    const playerName = 'newPlayer';
    const res = await request(app).post(`/players/${playerName}`);
    expect(res.statusCode).toBe(201);
    const player = await Players.findOne({ playerName: playerName });
    expect(player).not.toBeNull();
  });

  test('GET /duels - fetch all duels successfully', async () => {
    const duels = [
      { challengerName: 'player1', challengedName: 'player2' },
      { challengerName: 'player3', challengedName: 'player4' }
    ];
    await Duels.insertMany(duels);
    const res = await request(app).get('/duels');
    expect(res.statusCode).toBe(200);
    expect(res.body.duels).toHaveLength(duels.length);
  });

  test('GET /duels/:playerName - fetch duels for a specific player successfully', async () => {
    const playerName = 'player1';
    const duel = { challengerName: playerName, challengedName: 'player2' };
    await Duels.create(duel);
    const res = await request(app).get(`/duels/${playerName}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.duel).toHaveProperty('challengerName', playerName);
  });

  test('DELETE /players/:playerName - remove a player successfully and verify its non-existence', async () => {
    const playerName = 'playerToDelete';
    await Players.create({ playerName: playerName });
    const res = await request(app).delete(`/players/${playerName}`);
    expect(res.statusCode).toBe(200);
    const player = await Players.findOne({ playerName: playerName });
    expect(player).toBeNull();
  });

  test('DELETE /duels/:playerName - remove a duel involving a specific player successfully', async () => {
    const playerName = 'playerInDuel';
    const duel = { challengerName: playerName, challengedName: 'anotherPlayer' };
    await Duels.create(duel);
    const res = await request(app).delete(`/duels/${playerName}`);
    expect(res.statusCode).toBe(200);
    const duelCheck = await Duels.findOne({ $or: [{ challengerName: playerName }, { challengedName: playerName }] });
    expect(duelCheck).toBeNull();
  });

  test('GET /players/:playerName - player does not exist, return with null', async () => {
    const playerName = 'nonexistentPlayer';
    const res = await request(app).get(`/players/${playerName}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.player).toBeNull();
  });

  test('POST /players/:playerName - add a duplicate player, failure with 500', async () => {
    const playerName = 'duplicatePlayer';
    await Players.create({ playerName: playerName });
    const res = await request(app).post(`/players/${playerName}`);
    // Depending on how you handle duplicates, the status code might vary. Adjust as necessary.
    expect(res.statusCode).toBe(500);
  });

  test('GET /duels/:playerName - duel does not exist for player, return with null', async () => {
    const playerName = 'playerWithNoDuel';
    const res = await request(app).get(`/duels/${playerName}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.duel).toBeNull();
  });

  test('DELETE /players/:playerName - try to delete a player that does not exist, failture with 404', async () => {
    const playerName = 'nonexistentPlayerToDelete';
    const res = await request(app).delete(`/players/${playerName}`);
    expect(res.statusCode).toBe(404);
  });

  test('DELETE /duels/:playerName - try to delete a duel for a player not in any duels, failture with 404', async () => {
    const playerName = 'playerNotInDuel';
    const res = await request(app).delete(`/duels/${playerName}`);
    expect(res.statusCode).toBe(404);
  });

  test('PUT /challengeStatuses/:challenger/:challenged - update with invalid challenger, failture with 404', async () => {
    const challenger = 'invalidChallenger';
    const challenged = 'someChallenged';
    const res = await request(app)
      .put(`/challengeStatuses/${challenger}/${challenged}`)
      .send({ inChallenge: true });
    expect(res.statusCode).toBe(404);
    expect(res.text).toContain('Challenger not found');
  });

  test('PUT /challengeStatuses/:challenger/:challenged - update with invalid inChallenge status, failture with 400', async () => {
    const challenger = 'validChallenger';
    const challenged = 'validChallenged';
    // Ensure the challenger and challenged exist for this test
    await Players.create([{ playerName: challenger }, { playerName: challenged }]);
    
    const res = await request(app)
      .put(`/challengeStatuses/${challenger}/${challenged}`)
      .send({ inChallenge: 'invalidStatus' }); // Invalid inChallenge status
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Invalid inChallenge status provided');
  });
});
