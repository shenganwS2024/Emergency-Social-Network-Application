import { Exercises } from '../models/TrainExercise.js'
import { Users } from '../models/Users.js'
import mongoose from 'mongoose'
import { io } from '../config/serverConfig.js'
import { eventManager } from './EventManager.js'

// Common function to find an exercise by ID
async function findExerciseById(exerciseId) {
  if (!mongoose.isValidObjectId(exerciseId)) {
    throw new Error('Invalid exercise ID')
  }

  const exercise = await Exercises.findById(exerciseId)
  if (!exercise) {
    throw new Error('Exercise not found')
  }

  return exercise
}

// Common function to find a user by username
async function findUserByUsername(username) {
  const user = await Users.findOne({ username })
  if (!user) {
    throw new Error('User not found')
  }

  return user
}

// Common function to handle likes and dislikes
async function handleReaction(exerciseId, username, action) {
  const exercise = await findExerciseById(exerciseId)
  const user = await findUserByUsername(username)

  const isLiked = exercise.likes.includes(username)
  const isDisliked = exercise.dislikes.includes(username)

  if (action === 'like' && !isLiked) {
    exercise.likes.push(username)
    if (isDisliked) {
      exercise.dislikes.pull(username)
    }
  } else if (action === 'dislike' && !isDisliked) {
    exercise.dislikes.push(username)
    if (isLiked) {
      exercise.likes.pull(username)
    }
  } else if (action === 'unlike' && isLiked) {
    exercise.likes.pull(username)
  } else if (action === 'undislike' && isDisliked) {
    exercise.dislikes.pull(username)
  }

  await exercise.save()
  const updatedExercise = await Exercises.findById(exerciseId).exec()
  io.emit('update exercise', updatedExercise.toJSON())

  const likeRate = (exercise.likes.length / (exercise.likes.length + exercise.dislikes.length)) * 100
  const dislikeRate = (exercise.dislikes.length / (exercise.likes.length + exercise.dislikes.length)) * 100

  return {
    success: true,
    userReaction: { like: action === 'like', dislike: action === 'dislike' },
    likeRate,
    dislikeRate,
  }
}

// Your existing endpoints, refactored to use the common functions
async function getExercises(req, res) {
  try {
    const exercises = await Exercises.find().sort({ timestamp: 1 })
    res.status(200).json(exercises)
  } catch (error) {
    console.error('Error getting exercises:', error)
    res.status(500).send('Error getting exercises')
  }
}
async function getExerciseById(req, res) {
  try {
    const exerciseId = req.params.id
    const username = req.params.username

    const exercise = await findExerciseById(exerciseId)
    const user = await findUserByUsername(username)

    exercise.userReaction = {
      like: exercise.likes.includes(username),
      dislike: exercise.dislikes.includes(username),
    }

    const exerciseWithReaction = exercise.toObject()
    exerciseWithReaction.userReaction = exercise.userReaction

    res.status(200).json(exerciseWithReaction)
  } catch (error) {
    if (error.message === 'Exercise not found') {
      res.status(404).send('Exercise not found')
    } else {
      console.error('Error getting specific exercise:', error)
      res.status(500).send('Error getting specific exercise')
    }
  }
}

async function postExercise(req, res) {
  const { title, author, videoLink, timestamp, quizQuestions } = req.body

  try {
    const newExercise = new Exercises({ title, author, timestamp, videoLink, quizQuestions })
    await newExercise.save()
    eventManager.notify('new exercise', newExercise)
    res.status(201).json(newExercise)
  } catch (error) {
    console.error('Error posting exercise:', error)
    res.status(500).send('Error posting exercise')
  }
}

async function addComment(req, res) {
  const exerciseId = req.params.id
  const { author, content, timestamp } = req.body

  try {
    const exercise = await findExerciseById(exerciseId)

    const newComment = { author, content, timestamp }
    exercise.comments.push(newComment)
    await exercise.save()

    io.emit('new comment', exercise)
    res.status(201).json(exercise)
  } catch (error) {
    console.error('Error adding comment:', error)
    res.status(500).send(error.message)
  }
}

async function handleLike(req, res) {
  try {
    const response = await handleReaction(req.params.id, req.body.username, 'like')
    res.status(200).json(response)
  } catch (error) {
    if (error.message === 'Exercise not found') {
      res.status(404).send('Exercise not found')
    } else if (error.message === 'User not found') {
      res.status(404).send('User not found')
    } else {
      console.error('Error handling like:', error)
      res.status(500).send('Error handling like')
    }
  }
}

async function handleDislike(req, res) {
  try {
    const response = await handleReaction(req.params.id, req.body.username, 'dislike')
    res.status(200).json(response)
  } catch (error) {
    console.error('Error handling dislike:', error)
    res.status(500).send(error.message)
  }
}

async function handleUnlike(req, res) {
  try {
    const response = await handleReaction(req.params.id, req.body.username, 'unlike')
    res.status(200).json(response)
  } catch (error) {
    console.error('Error handling unlike:', error)
    res.status(500).send(error.message)
  }
}

async function handleUndislike(req, res) {
  try {
    const response = await handleReaction(req.params.id, req.body.username, 'undislike')
    res.status(200).json(response)
  } catch (error) {
    console.error('Error handling undislike:', error)
    res.status(500).send(error.message)
  }
}

async function deleteComment(req, res) {
  const exerciseId = req.params.exerciseId
  const commentId = req.params.commentId

  try {
    const exercise = await findExerciseById(exerciseId)

    const commentIndex = exercise.comments.findIndex((comment) => comment._id.equals(commentId))
    if (commentIndex === -1) {
      return res.status(404).send('Comment not found')
    }

    exercise.comments.splice(commentIndex, 1)
    await exercise.save()

    io.emit('comment deleted', { exerciseId, commentId })
    res.status(200).send('Comment deleted')
  } catch (error) {
    console.error('Error deleting comment:', error)
    res.status(500).send(error.message)
  }
}

export {
  getExercises,
  postExercise,
  getExerciseById,
  addComment,
  handleLike,
  handleDislike,
  handleUnlike,
  handleUndislike,
  deleteComment,
  findExerciseById,
}
