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

describe('Comprehensive Integration Tests for Duel Game API', () => {
    test('Successfully retrieve a multiplechoices question', async () => {
      
      const questionNumber = '1'; 
      const res = await request(app).get(`/questions/${questionNumber}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.question).toBeDefined();
    });
  
    test('Fail to retrieve a question with an invalid number', async () => {
      const invalidNumber = 'invalid'; // Invalid question number
      const res = await request(app).get(`/questions/${invalidNumber}`);
      expect(res.statusCode).toBe(500); 
    });
  
    test('Upload a submission to a duel and verify the submission existence successfully', async () => {
      const playerName = 'submitter';
      const duelInfo = {
        challengerName: playerName,
        challengedName: 'opponent',
        submissions: []
      };
      const newDuel = await Duels.create(duelInfo);
  
      const submissionData = {
        answer: 'testAnswer',
        questionInfo: {
          questionDescription: 'testDescription',
          correctAnswer: 'correctAnswer'
        }
      };
  
      const res = await request(app).put(`/submissions/${playerName}`).send(submissionData);
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Submission uploaded successfully');
  
      // Verify the submission was correctly stored
      const updatedDuel = await Duels.findById(newDuel._id);
      expect(updatedDuel.submissions[0].studentAnswers).toContain(submissionData.answer);
    });
  
    test('Attempt to upload a duplicate submission causes a 400 failure', async () => {
      const playerName = 'submitterDupe';
      await Duels.create({
        challengerName: playerName,
        challengedName: 'opponentDupe',
        submissions: [{
          questionDescriptions: ['testDescription'],
          questionAnswers: ['correctAnswer'],
          studentAnswers: ['testAnswer']
        }]
      });
  
      const duplicateSubmission = {
        answer: 'duplicateAnswer',
        questionInfo: {
          questionDescription: 'testDescription', // Same as existing
          correctAnswer: 'correctAnswer'
        }
      };
  
      const res = await request(app).put(`/submissions/${playerName}`).send(duplicateSubmission);
      expect(res.statusCode).toBe(400);
      expect(res.text).toContain('Question description already exists');
    });
  
    test('Retrieve duel results successfully', async () => {
      const player = 'resultPlayer';
      const opponent = 'resultOpponent';
  
      // Setup duel result data
      const duelResult = await Duels.create({
        challengerName: player,
        challengedName: opponent,
        submissions: [
          {
            questionDescriptions: ['Q1', 'Q2'],
            questionAnswers: ['A1', 'A2'],
            studentAnswers: ['A1', 'wrongAnswer']
          },
          {
            questionDescriptions: ['Q1', 'Q2'],
            questionAnswers: ['A1', 'A2'],
            studentAnswers: ['wrongAnswer', 'A2']
          }
        ]
      });
  
      const res = await request(app).get(`/results/${player}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('isWin', "tie");
      expect(res.body).toHaveProperty('accuracy', "0.50");
      expect(res.body).toHaveProperty('mistakes', [{question: 'Q2', correctAnswer: 'A2', userAnswer: 'wrongAnswer'}]);
    });
  
    test('Attempt to get results for a player not in any duel, failure with 404', async () => {
      const nonPlayer = 'nonPlayer';
      const res = await request(app).get(`/results/${nonPlayer}`);
      expect(res.statusCode).toBe(404);
      expect(res.text).toContain('Duel not found or invalid submissions');
    });
  
    test('Update readiness status successfully', async () => {
      const readyPlayer = 'readyPlayer';
      await Players.create({ playerName: readyPlayer });
  
      const readinessStatus = {
        opponent: 'readyOpponent', // Assumed to be used in logic
        ready: true,
        number: '1' // Assumed to be used in readiness logic
      };
  
      const res = await request(app).put(`/readyStatuses/${readyPlayer}`).send(readinessStatus);
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Player readiness updated successful');
  
      // Verify readiness update
      const updatedPlayer = await Players.findOne({ playerName: readyPlayer });
      expect(updatedPlayer.ready).toBe(true);
    });
  
    test('Fail to update readiness for non-existent player, failture with 404', async () => {
        const nonExistentPlayer = 'ghostPlayer';
        const readinessUpdate = {
          opponent: 'opponentPlayer',
          ready: true,
          number: '1'
        };
    
        const res = await request(app).put(`/readyStatuses/${nonExistentPlayer}`).send(readinessUpdate);
        expect(res.statusCode).toBe(404);
        expect(res.text).toContain('Player not found');
      });
    
      test('Successfully update readiness and trigger event', async () => {
        const playerOne = 'playerOneReady';
        const playerTwo = 'playerTwoReady';
        await Players.create({ playerName: playerOne });
        await Players.create({ playerName: playerTwo });
    
        // Set playerOne ready
        let resOne = await request(app).put(`/readyStatuses/${playerOne}`).send({
          opponent: playerTwo,
          ready: true,
          number: '1'
        });
    
        expect(resOne.statusCode).toBe(200);
        expect(resOne.text).toContain('Player readiness updated successful');
    
        // Verify readiness state in database
        const updatedPlayerOne = await Players.findOne({ playerName: playerOne });
        expect(updatedPlayerOne.ready).toBe(true);
    
        // Set playerTwo ready
        let resTwo = await request(app).put(`/readyStatuses/${playerTwo}`).send({
          opponent: playerOne,
          ready: true,
          number: '1'
        });
    
        expect(resTwo.statusCode).toBe(200);
        expect(resTwo.text).toContain('Player readiness updated successful');
    
        // Verify readiness state in database
        const updatedPlayerTwo = await Players.findOne({ playerName: playerTwo });
        expect(updatedPlayerTwo.ready).toBe(true);
      });
    
      test('Handle invalid readiness update request, failure with 400', async () => {
        const player = 'playerInvalidUpdate';
        await Players.create({ playerName: player });
    
        const readinessUpdate = {
          opponent: 'opponentInvalid',
          ready: 'notABoolean', // Invalid readiness status
          number: '1'
        };
    
        const res = await request(app).put(`/readyStatuses/${player}`).send(readinessUpdate);
        expect(res.statusCode).toBe(400);
        expect(res.text).toContain('Invalid readiness provided');
      });
    });
    
  