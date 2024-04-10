import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { app } from '../../server.js'
import { Exercises } from '../../models/TrainExercise.js'
import { Users } from '../../models/Users.js'
import * as exerciseController from '../../controllers/exerciseController.js'

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
  // 1
  test('getExercises should return all exercises sorted by timestamp', async () => {
    const exercise1 = new Exercises({ title: 'Exercise 1', author: 'User1', timestamp: new Date('2023-01-01') })
    const exercise2 = new Exercises({ title: 'Exercise 2', author: 'User2', timestamp: new Date('2023-01-02') })
    await exercise1.save()
    await exercise2.save()

    const req = {}
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await exerciseController.getExercises(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.any(Array))
    expect(res.json.mock.calls[0][0]).toHaveLength(2)
    expect(res.json.mock.calls[0][0][0].title).toBe('Exercise 1')
    expect(res.json.mock.calls[0][0][1].title).toBe('Exercise 2')
  })

  // 2
  test('getExerciseById should return the exercise with populated comments and user reaction', async () => {
    const user = new Users({ username: 'User1', password: 'password' })
    await user.save()

    const exercise = new Exercises({
      title: 'Exercise',
      author: 'User1',
      likes: ['User1'],
      comments: [{ author: 'User1', content: 'Comment', timestamp: new Date() }],
    })
    await exercise.save()

    const req = {
      params: {
        id: exercise._id.toString(),
        username: 'User1',
      },
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await exerciseController.getExerciseById(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Exercise',
        comments: expect.arrayContaining([
          expect.objectContaining({
            content: 'Comment',
          }),
        ]),
        userReaction: expect.objectContaining({
          like: true,
        }),
      }),
    )
  })

  // 3
  test('getExerciseById should return 404 if exercise is not found', async () => {
    const req = {
      params: {
        id: new mongoose.Types.ObjectId().toString(),
        username: 'User1',
      },
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }

    await exerciseController.getExerciseById(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.send).toHaveBeenCalledWith('Exercise not found')
  })

  // 4
  test('postExercise should create a new exercise', async () => {
    const exerciseData = {
      title: 'New Exercise',
      author: 'User1',
      videoLink: 'https://example.com/video',
      timestamp: new Date(),
      quizQuestions: [],
    }

    const req = {
      body: exerciseData,
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await exerciseController.postExercise(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Exercise',
        author: 'User1',
      }),
    )
  })

  // 5
  test('addComment should add a new comment to the exercise', async () => {
    const exercise = new Exercises({ title: 'Exercise', author: 'User1' })
    await exercise.save()

    const commentData = { author: 'User1', content: 'New Comment', timestamp: new Date() }

    const req = {
      params: {
        id: exercise._id.toString(),
      },
      body: commentData,
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await exerciseController.addComment(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        comments: expect.arrayContaining([
          expect.objectContaining({
            content: 'New Comment',
          }),
        ]),
      }),
    )
  })

  // 6
  test('handleLike should add a like to the exercise', async () => {
    const user = new Users({ username: 'User1', password: 'password' })
    await user.save()

    const exercise = new Exercises({ title: 'Exercise', author: 'User1' })
    await exercise.save()

    const req = {
      params: {
        id: exercise._id.toString(),
      },
      body: {
        username: 'User1',
      },
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await exerciseController.handleLike(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        userReaction: expect.objectContaining({
          like: true,
        }),
        likeRate: 100,
      }),
    )
  })

  // 7
  test('handleDislike should add a dislike to the exercise', async () => {
    const user = new Users({ username: 'User1', password: 'password' })
    await user.save()

    const exercise = new Exercises({ title: 'Exercise', author: 'User1' })
    await exercise.save()

    const req = {
      params: {
        id: exercise._id.toString(),
      },
      body: {
        username: 'User1',
      },
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await exerciseController.handleDislike(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        userReaction: expect.objectContaining({
          dislike: true,
        }),
        dislikeRate: 100,
      }),
    )
  })

  // 8
  test('handleUnlike should remove a like from the exercise', async () => {
    const user = new Users({ username: 'User1', password: 'password' })
    await user.save()

    const exercise = new Exercises({ title: 'Exercise', author: 'User1', likes: ['User1'] })
    await exercise.save()

    const req = {
      params: {
        id: exercise._id.toString(),
      },
      body: {
        username: 'User1',
      },
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await exerciseController.handleUnlike(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        userReaction: expect.objectContaining({
          like: false,
        }),
      }),
    )
  })

  // 9
  test('handleUndislike should remove a dislike from the exercise', async () => {
    const user = new Users({ username: 'User1', password: 'password' })
    await user.save()

    const exercise = new Exercises({ title: 'Exercise', author: 'User1', dislikes: ['User1'] })
    await exercise.save()

    const req = {
      params: {
        id: exercise._id.toString(),
      },
      body: {
        username: 'User1',
      },
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await exerciseController.handleUndislike(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        userReaction: expect.objectContaining({
          dislike: false,
        }),
      }),
    )
  })

  // 10
  test('handleLike should return 404 if user is not found', async () => {
    const exercise = new Exercises({ title: 'Exercise', author: 'User1' })
    await exercise.save()

    const req = {
      params: {
        id: exercise._id.toString(),
      },
      body: {
        username: 'NonexistentUser',
      },
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }

    await exerciseController.handleLike(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.send).toHaveBeenCalledWith('User not found')
  })
})
