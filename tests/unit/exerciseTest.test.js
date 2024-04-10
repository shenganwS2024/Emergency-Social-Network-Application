import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { app } from '../../server.js'
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

beforeEach(async () => {
  await Exercises.deleteMany({})
  await Users.deleteMany({})
})

describe('Exercise Controller', () => {
  //1
  test('GET /exercises should return all exercises sorted by timestamp', async () => {
    const exercise1 = new Exercises({ title: 'Exercise 1', author: 'User1', timestamp: new Date('2023-01-01') })
    const exercise2 = new Exercises({ title: 'Exercise 2', author: 'User2', timestamp: new Date('2023-01-02') })
    await exercise1.save()
    await exercise2.save()

    const res = await request(app).get('/exercises')

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].title).toBe('Exercise 1')
    expect(res.body[1].title).toBe('Exercise 2')
  })

  //2
  test('GET /exercises/:id/:username should return the exercise with populated comments and user reaction', async () => {
    const user = new Users({ username: 'User1', password: 'password' })
    await user.save()

    const exercise = new Exercises({
      title: 'Exercise',
      author: 'User1',
      likes: ['User1'],
      comments: [{ author: 'User1', content: 'Comment', timestamp: new Date() }],
    })
    await exercise.save()

    const res = await request(app).get(`/exercises/${exercise._id}/User1`)

    expect(res.statusCode).toBe(200)
    expect(res.body.title).toBe('Exercise')
    expect(res.body.comments).toHaveLength(1)
    expect(res.body.comments[0].content).toBe('Comment')
    expect(res.body.userReaction.like).toBe(true)
  })

  //3
  test('GET /exercises/:id/:username should return 404 if exercise is not found', async () => {
    const res = await request(app).get(`/exercises/${new mongoose.Types.ObjectId()}/User1`)

    expect(res.statusCode).toBe(404)
    expect(res.text).toBe('Exercise not found')
  })

  //4
  test('POST /exercises should create a new exercise', async () => {
    const exerciseData = {
      title: 'New Exercise',
      author: 'User1',
      videoLink: 'https://example.com/video',
      timestamp: new Date(),
      quizQuestions: [],
    }

    const res = await request(app).post('/exercises').send(exerciseData)

    expect(res.statusCode).toBe(201)
    expect(res.body.title).toBe('New Exercise')
    expect(res.body.author).toBe('User1')
  })

  //5
  test('POST /exercises/:id/comments should add a new comment to the exercise', async () => {
    const exercise = new Exercises({ title: 'Exercise', author: 'User1' })
    await exercise.save()

    const commentData = { author: 'User1', content: 'New Comment', timestamp: new Date() }

    const res = await request(app).post(`/exercises/${exercise._id}/comments`).send(commentData)

    expect(res.statusCode).toBe(201)
    expect(res.body.comments).toHaveLength(1)
    expect(res.body.comments[0].content).toBe('New Comment')
  })

  //6
  test('PUT /exercises/:id/like should add a like to the exercise', async () => {
    const user = new Users({ username: 'User1', password: 'password' })
    await user.save()

    const exercise = new Exercises({ title: 'Exercise', author: 'User1' })
    await exercise.save()

    const res = await request(app).put(`/exercises/${exercise._id}/like`).send({ username: 'User1' })

    expect(res.statusCode).toBe(200)
    expect(res.body.userReaction.like).toBe(true)
    expect(res.body.likeRate).toBe(100)
  })

  //7
  test('PUT /exercises/:id/dislike should add a dislike to the exercise', async () => {
    const user = new Users({ username: 'User1', password: 'password' })
    await user.save()

    const exercise = new Exercises({ title: 'Exercise', author: 'User1' })
    await exercise.save()

    const res = await request(app).put(`/exercises/${exercise._id}/dislike`).send({ username: 'User1' })

    expect(res.statusCode).toBe(200)
    expect(res.body.userReaction.dislike).toBe(true)
    expect(res.body.dislikeRate).toBe(100)
  })

  //8
  test('PUT /exercises/:id/unlike should remove a like from the exercise', async () => {
    const user = new Users({ username: 'User1', password: 'password' })
    await user.save()

    const exercise = new Exercises({ title: 'Exercise', author: 'User1', likes: ['User1'] })
    await exercise.save()

    const res = await request(app).put(`/exercises/${exercise._id}/unlike`).send({ username: 'User1' })

    expect(res.statusCode).toBe(200)
    expect(res.body.userReaction.like).toBe(false)
  })

  //9
  test('PUT /exercises/:id/undislike should remove a dislike from the exercise', async () => {
    const user = new Users({ username: 'User1', password: 'password' })
    await user.save()

    const exercise = new Exercises({ title: 'Exercise', author: 'User1', dislikes: ['User1'] })
    await exercise.save()

    const res = await request(app).put(`/exercises/${exercise._id}/undislike`).send({ username: 'User1' })

    expect(res.statusCode).toBe(200)
    expect(res.body.userReaction.dislike).toBe(false)
  })

  //10
  test('PUT /exercises/:id/like should return 404 if user is not found', async () => {
    const exercise = new Exercises({ title: 'Exercise', author: 'User1' })
    await exercise.save()

    const res = await request(app).put(`/exercises/${exercise._id}/like`).send({ username: 'NonexistentUser' })

    expect(res.statusCode).toBe(404)
    expect(res.text).toBe('User not found')
  })
})
