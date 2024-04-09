import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server.js'; 
import { MultipleChoicesQuestions } from '../../models/MultipleChoicesQuestions.js'; 
import { TrueFalseQuestions } from '../../models/TrueFalseQuestions.js';
import { ShortAnswerQuestions } from '../../models/ShortAnswerQuestions.js';

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
    await MultipleChoicesQuestions.deleteMany({});
    await TrueFalseQuestions.deleteMany({});
    await ShortAnswerQuestions.deleteMany({});

    await MultipleChoicesQuestions.create([
        {
            questionDescription: "What is the capital of France?",
            choices: ["Paris", "London", "Rome", "Berlin"],
            correctAnswer: "Paris"
        }
    ]);

    await TrueFalseQuestions.create([
        {
            questionDescription: "Is monkey a cat?",
            choices: ["True", "False"],
            correctAnswer: "False"
        }
    ]);

    await ShortAnswerQuestions.create([
        {
            questionDescription: "What is the US legal age for drinking?",
            correctAnswer: "21"
        }
    ]);
});

describe('Testsuites for Question Fetch Functionality', () => {

    // The first question should always be a multiplechoices question
  test('Fetch a multiplechoices question for the first question successfully', async () => {

    const res = await request(app)
      .get(`/questions/1`); 

    expect(res.statusCode).toBe(200);

    expect(res.body.question).toEqual(
      expect.objectContaining({
            questionDescription: "What is the capital of France?",
            choices: ["Paris", "London", "Rome", "Berlin"],
            correctAnswer: "Paris"
      })
    );
  });

    // The second question should always be a true/false question
    test('Fetch a true/false question for the second question successfully', async () => {

        const res = await request(app)
            .get(`/questions/2`); 

        expect(res.statusCode).toBe(200);

        expect(res.body.question).toEqual(
            expect.objectContaining({
                questionDescription: "Is monkey a cat?",
                choices: ["True", "False"],
                correctAnswer: "False"
            })
        );
    });

    // The third question should always be a short answer question
    test('Fetch a short answer question for the third question successfully', async () => {

        const res = await request(app)
            .get(`/questions/3`); 

        expect(res.statusCode).toBe(200);

        expect(res.body.question).toEqual(
            expect.objectContaining({
                questionDescription: "What is the US legal age for drinking?",
                correctAnswer: "21"
            })
        );
    });

    test('Negative test: attempt to fetch a question with an invalid number, returns 500 server error', async () => {

        jest.spyOn(mongoose.Model, 'find').mockImplementationOnce(() => Promise.reject(new Error('Simulated database error')));
    
        const res = await request(app)
            .get(`/questions/4`);
        
        expect(res.statusCode).toBe(500);
        expect(res.text).toContain('Error getting the question');
    });
      
});
