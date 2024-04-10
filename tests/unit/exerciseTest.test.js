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
  test('getExercises should return all exercises sorted by timestamp', async () => {
    const exercise1 = new Exercises({ title: 'Exercise 1', author: 'hakan', timestamp: new Date('2023-01-01') })
    const exercise2 = new Exercises({ title: 'Exercise 2', author: 'testuser', timestamp: new Date('2023-01-02') })
    await exercise1.save()
    await exercise2.save()

    const res = await request(app).get('/exercises')

    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(2)
    expect(res.body[0].title).toBe('Exercise 1')
    expect(res.body[1].title).toBe('Exercise 2')
  })

  test('getExerciseById should return the exercise with populated comments and user reaction', async () => {
    const user = new Users({ username: 'testuser', password: 'password' })
    await user.save()

    const exercise = new Exercises({
      title: 'Exercise',
      author: 'testuser',
      likes: ['testuser'],
      comments: [{ author: 'testuser', content: 'Comment' }],
    })
    await exercise.save()

    const res = await request(app).get(`/exercises/${exercise._id}/testuser`)

    expect(res.statusCode).toBe(200)
    expect(res.body.title).toBe('Exercise')
    expect(res.body.comments.length).toBe(1)
    expect(res.body.comments[0].author).toBe('testuser')
    expect(res.body.userReaction.like).toBe(true)
    expect(res.body.userReaction.dislike).toBe(false)
  })

  test('getExerciseById should return 404 if exercise is not found', async () => {
    const user = new Users({ username: 'Author', password: 'password' })
    await user.save()

    const res = await request(app).get(`/exercises/${new mongoose.Types.ObjectId()}/testuser`)

    expect(res.statusCode).toBe(404)
    expect(res.text).toBe('Exercise not found')
  })

  test('postExercise should create a new exercise', async () => {
    const exerciseData = {
      title: 'New Exercise',
      author: 'Author',
      videoLink: 'https://youtu.be/erLbbextvlY?si=q21hP5yzL_W5p_bN',
      timestamp: new Date(),
      quizQuestions: [],
    }

    const res = await request(app).post('/exercises').send(exerciseData)

    expect(res.statusCode).toBe(201)
    expect(res.body.title).toBe('New Exercise')
    expect(res.body.author).toBe('Author')
  })

  test('addComment should add a new comment to the exercise', async () => {
    const exercise = new Exercises({ title: 'Exercise', author: 'testuser' })
    await exercise.save()

    const commentData = { author: 'testuser', content: 'New Comment', timestamp: new Date() }

    const res = await request(app).post(`/exercises/${exercise._id}/comments`).send(commentData)

    expect(res.statusCode).toBe(201)
    expect(res.body.comments.length).toBe(1) // Check that the comment count has increased
    expect(res.body.comments[0].author).toBe('testuser') // Check the author of the first comment
    expect(res.body.comments[0].content).toBe('New Comment') // Check the content of the first comment

    const updatedExercise = await Exercises.findById(exercise._id)
    expect(updatedExercise.comments.length).toBe(1) // Check that the comment has been added to the database
  })

  test('handleLike should add a like to the exercise', async () => {
    const user = new Users({ username: 'testuser', password: 'password' })
    await user.save()

    const exercise = new Exercises({ title: 'Exercise', author: 'testuser' })
    await exercise.save()

    const res = await request(app).put(`/exercises/${exercise._id}/like`).send({ username: 'testuser' })

    expect(res.statusCode).toBe(200)
    expect(res.body.userReaction.like).toBe(true)
    expect(res.body.likeRate).toBe(100)

    const updatedExercise = await Exercises.findById(exercise._id)
    expect(updatedExercise.likes.includes('testuser')).toBe(true)
  })

  test('handleDislike should add the user to the dislikes array and remove from likes', async () => {
    const user = new Users({ username: 'testuser', password: 'password' })
    await user.save()

    const exercise = new Exercises({ title: 'Exercise', author: 'author', likes: ['testuser'] })
    await exercise.save()

    const res = await request(app).put(`/exercises/${exercise._id}/dislike`).send({ username: 'testuser' })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.userReaction.like).toBe(false)
    expect(res.body.userReaction.dislike).toBe(true)

    const updatedExercise = await Exercises.findById(exercise._id)
    expect(updatedExercise.dislikes).toContain('testuser')
    expect(updatedExercise.likes).not.toContain('testuser')
  })

  test('handleUnlike should remove the user from the likes array', async () => {
    const user = new Users({ username: 'testuser', password: 'password' })
    await user.save()

    const exercise = new Exercises({ title: 'Exercise', author: 'author', likes: ['testuser'] })
    await exercise.save()

    const res = await request(app).put(`/exercises/${exercise._id}/unlike`).send({ username: 'testuser' })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.userReaction.like).toBe(false)
    expect(res.body.userReaction.dislike).toBe(false)

    const updatedExercise = await Exercises.findById(exercise._id)
    expect(updatedExercise.likes).not.toContain('testuser')
  })

  test('handleUndislike should remove the user from the dislikes array', async () => {
    const user = new Users({ username: 'testuser', password: 'password' })
    await user.save()

    const exercise = new Exercises({ title: 'Exercise', author: 'author', dislikes: ['testuser'] })
    await exercise.save()

    const res = await request(app).put(`/exercises/${exercise._id}/undislike`).send({ username: 'testuser' })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.userReaction.like).toBe(false)
    expect(res.body.userReaction.dislike).toBe(false)

    const updatedExercise = await Exercises.findById(exercise._id)
    expect(updatedExercise.dislikes).not.toContain('testuser')
  })

  test('handleLike, handleDislike, handleUnlike, handleUndislike should return 404 if user is not found', async () => {
    const exercise = new Exercises({ title: 'Exercise', author: 'author' })
    await exercise.save()

    const res1 = await request(app).put(`/exercises/${exercise._id}/like`).send({ username: 'nonexistentuser' })
    const res2 = await request(app).put(`/exercises/${exercise._id}/dislike`).send({ username: 'nonexistentuser' })
    const res3 = await request(app).put(`/exercises/${exercise._id}/unlike`).send({ username: 'nonexistentuser' })
    const res4 = await request(app).put(`/exercises/${exercise._id}/undislike`).send({ username: 'nonexistentuser' })

    expect(res1.statusCode).toBe(404)
    expect(res1.text).toBe('User not found')
    expect(res2.statusCode).toBe(404)
    expect(res2.text).toBe('User not found')
    expect(res3.statusCode).toBe(404)
    expect(res3.text).toBe('User not found')
    expect(res4.statusCode).toBe(404)
    expect(res4.text).toBe('User not found')
  })
})
