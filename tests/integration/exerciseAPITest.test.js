import request from 'supertest'
import { app } from '../../server.js'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Exercises } from '../../models/TrainExercise.js'
import { Users } from '../../models/Users.js'

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongod.stop()
})

describe('Exercise API', () => {
  let testExercise
  let testUser

  beforeEach(async () => {
    // Create a test user
    testUser = new Users({ username: 'testuser', password: 'password' })
    await testUser.save()

    // Create a test exercise
    testExercise = new Exercises({
      title: 'Test Exercise',
      author: 'Test Author',
      videoLink: 'https://example.com/video',
      quizQuestions: [
        { question: 'Question 1', answer: 'Answer 1' },
        { question: 'Question 2', answer: 'Answer 2' },
      ],
    })
    await testExercise.save()
  })

  afterEach(async () => {
    // Clean up the test data
    await Exercises.deleteMany()
    await Users.deleteMany()
  })

  //1
  test('GET /exercises should return all exercises', async () => {
    const response = await request(app).get('/exercises')

    expect(response.status).toBe(200)
    expect(response.body.length).toBeGreaterThan(0)
    expect(response.body[0].title).toBe('Test Exercise')
    expect(response.body[0].author).toBe('Test Author')
  })

  //2
  test('GET /exercises/:id/:username should return a specific exercise with user reaction', async () => {
    const response = await request(app).get(`/exercises/${testExercise._id}/${testUser.username}`)

    expect(response.status).toBe(200)
    expect(response.body.title).toBe('Test Exercise')
    expect(response.body.author).toBe('Test Author')
    expect(response.body.userReaction.like).toBe(false)
    expect(response.body.userReaction.dislike).toBe(false)
  })

  //3
  test('POST /exercises should create a new exercise', async () => {
    const newExercise = {
      title: 'New Exercise',
      author: 'New Author',
      videoLink: 'https://example.com/new-video',
      quizQuestions: [
        { question: 'New Question 1', answer: 'New Answer 1' },
        { question: 'New Question 2', answer: 'New Answer 2' },
      ],
    }

    const response = await request(app).post('/exercises').send(newExercise)

    expect(response.status).toBe(201)
    expect(response.body.title).toBe('New Exercise')
    expect(response.body.author).toBe('New Author')

    // Check if the exercise is saved in the database
    const savedExercise = await Exercises.findById(response.body._id)
    expect(savedExercise.title).toBe('New Exercise')
    expect(savedExercise.author).toBe('New Author')
  })

  //4
  test('POST /exercises/:id/comments should add a comment to an exercise', async () => {
    const newComment = {
      author: 'Test User',
      content: 'Test Comment',
    }

    const response = await request(app).post(`/exercises/${testExercise._id}/comments`).send(newComment)

    expect(response.status).toBe(201)
    expect(response.body.comments.length).toBe(1) // Check the comments array length
    expect(response.body.comments[0].author).toBe('Test User') // Check the author of the first comment
    expect(response.body.comments[0].content).toBe('Test Comment') // Check the content of the first comment

    // Check if the comment is added to the exercise in the database
    const updatedExercise = await Exercises.findById(testExercise._id)
    expect(updatedExercise.comments.length).toBe(1)
    expect(updatedExercise.comments[0].author).toBe('Test User')
    expect(updatedExercise.comments[0].content).toBe('Test Comment')
  })

  //5
  test('PUT /exercises/:id/like should handle user liking an exercise', async () => {
    const response = await request(app).put(`/exercises/${testExercise._id}/like`).send({ username: testUser.username })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.userReaction.like).toBe(true)
    expect(response.body.userReaction.dislike).toBe(false)

    // Check if the user is added to the likes array in the database
    const updatedExercise = await Exercises.findById(testExercise._id)
    expect(updatedExercise.likes).toContain(testUser.username)
    expect(updatedExercise.dislikes).not.toContain(testUser.username)
  })

  //6
  test('PUT /exercises/:id/unlike should handle user unliking an exercise', async () => {
    // Like the exercise first
    await request(app).put(`/exercises/${testExercise._id}/like`).send({ username: testUser.username })

    const response = await request(app)
      .put(`/exercises/${testExercise._id}/unlike`)
      .send({ username: testUser.username })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.userReaction.like).toBe(false)
    expect(response.body.userReaction.dislike).toBe(false)

    // Check if the user is removed from the likes array in the database
    const updatedExercise = await Exercises.findById(testExercise._id)
    expect(updatedExercise.likes).not.toContain(testUser.username)
  })
})
