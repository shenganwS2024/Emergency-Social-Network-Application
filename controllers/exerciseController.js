import { Exercises } from '../models/TrainExercise.js'
import { Users } from '../models/Users.js'
import mongoose from 'mongoose'
import { io } from '../config/serverConfig.js'
import { eventManager } from './EventManager.js'

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
    if (!mongoose.isValidObjectId(exerciseId)) {
      return res.status(400).send('Invalid exercise ID')
    }

    const exercise = await Exercises.findById(exerciseId)
      .populate({
        path: 'comments',
        options: { sort: { timestamp: 1 } },
      })
      .exec()

    if (exercise) {
      const user = await Users.findOne({ username: username })

      if (!user) {
        return res.status(404).send('User not found')
      }

      exercise.userReaction = {
        like: exercise.likes.includes(username),
        dislike: exercise.dislikes.includes(username),
      }

      const exerciseWithReaction = exercise.toObject()
      exerciseWithReaction.userReaction = exercise.userReaction

      res.status(200).json(exerciseWithReaction)
    } else {
      res.status(404).send('Exercise not found')
    }
  } catch (error) {
    console.error('Error getting specific exercise:', error)
    res.status(500).send('Error getting specific exercise')
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
    const exercise = await Exercises.findById(exerciseId)

    if (!exercise) {
      return res.status(404).send('Exercise not found')
    }

    const newComment = {
      author,
      content,
      timestamp,
    }

    exercise.comments.push(newComment)
    await exercise.save()

    // Emit the updated exercise object
    io.emit('new comment', exercise)

    // Return the updated exercise object
    res.status(201).json(exercise)
  } catch (error) {
    console.error('Error adding comment:', error)
    res.status(500).send('Error adding comment')
  }
}

async function handleLike(req, res) {
  const exerciseId = req.params.id
  const username = req.body.username

  try {
    const exercise = await Exercises.findById(exerciseId)
    const user = await Users.findOne({ username: username })

    if (!exercise) {
      return res.status(404).send('Exercise not found')
    }

    if (!user) {
      return res.status(404).send('User not found')
    }

    if (!exercise.likes.includes(username)) {
      exercise.likes.push(username)
      if (exercise.dislikes.includes(username)) {
        exercise.dislikes.pull(username)
      }
      await exercise.save()
    }

    const likeRate = (exercise.likes.length / (exercise.likes.length + exercise.dislikes.length)) * 100
    const dislikeRate = (exercise.dislikes.length / (exercise.likes.length + exercise.dislikes.length)) * 100

    const updatedExercise = await Exercises.findById(exerciseId).exec()
    io.emit('update exercise', updatedExercise.toJSON())

    res.status(200).json({
      success: true,
      userReaction: { like: true, dislike: false },
      likeRate,
      dislikeRate,
    })
  } catch (error) {
    console.error('Error handling like:', error)
    res.status(500).send('Error handling like')
  }
}

async function handleDislike(req, res) {
  const exerciseId = req.params.id
  const username = req.body.username

  try {
    const exercise = await Exercises.findById(exerciseId)
    const user = await Users.findOne({ username: username })

    if (!exercise) {
      return res.status(404).send('Exercise not found')
    }

    if (!user) {
      return res.status(404).send('User not found')
    }

    if (!exercise.dislikes.includes(username)) {
      exercise.dislikes.push(username)
      if (exercise.likes.includes(username)) {
        exercise.likes.pull(username)
      }
      await exercise.save()
    }

    const likeRate = (exercise.likes.length / (exercise.likes.length + exercise.dislikes.length)) * 100
    const dislikeRate = (exercise.dislikes.length / (exercise.likes.length + exercise.dislikes.length)) * 100

    const updatedExercise = await Exercises.findById(exerciseId).exec()
    io.emit('update exercise', updatedExercise.toJSON())

    res.status(200).json({
      success: true,
      userReaction: { like: false, dislike: true },
      likeRate,
      dislikeRate,
    })
  } catch (error) {
    console.error('Error handling dislike:', error)
    res.status(500).send('Error handling dislike')
  }
}

async function handleUnlike(req, res) {
  const exerciseId = req.params.id
  const username = req.body.username

  try {
    const exercise = await Exercises.findById(exerciseId)
    const user = await Users.findOne({ username: username })

    if (!exercise) {
      return res.status(404).send('Exercise not found')
    }

    if (!user) {
      return res.status(404).send('User not found')
    }

    if (exercise.likes.includes(username)) {
      exercise.likes.pull(username)
      await exercise.save()
    }

    const likeRate = (exercise.likes.length / (exercise.likes.length + exercise.dislikes.length)) * 100
    const dislikeRate = (exercise.dislikes.length / (exercise.likes.length + exercise.dislikes.length)) * 100

    const updatedExercise = await Exercises.findById(exerciseId).exec()
    io.emit('update exercise', updatedExercise.toJSON())

    res.status(200).json({
      success: true,
      userReaction: { like: false, dislike: false },
      likeRate,
      dislikeRate,
    })
  } catch (error) {
    console.error('Error handling unlike:', error)
    res.status(500).send('Error handling unlike')
  }
}

async function handleUndislike(req, res) {
  const exerciseId = req.params.id
  const username = req.body.username

  try {
    const exercise = await Exercises.findById(exerciseId)
    const user = await Users.findOne({ username: username })

    if (!exercise) {
      return res.status(404).send('Exercise not found')
    }

    if (!user) {
      return res.status(404).send('User not found')
    }

    if (exercise.dislikes.includes(username)) {
      exercise.dislikes.pull(username)
      await exercise.save()
    }

    const likeRate = (exercise.likes.length / (exercise.likes.length + exercise.dislikes.length)) * 100
    const dislikeRate = (exercise.dislikes.length / (exercise.likes.length + exercise.dislikes.length)) * 100

    const updatedExercise = await Exercises.findById(exerciseId).exec()
    io.emit('update exercise', updatedExercise.toJSON())

    res.status(200).json({
      success: true,
      userReaction: { like: false, dislike: false },
      likeRate,
      dislikeRate,
    })
  } catch (error) {
    console.error('Error handling undislike:', error)
    res.status(500).send('Error handling undislike')
  }
}

async function deleteComment(req, res) {
  const exerciseId = req.params.exerciseId
  const commentId = req.params.commentId

  try {
    const exercise = await Exercises.findById(exerciseId)

    if (!exercise) {
      return res.status(404).send('Exercise not found')
    }

    const commentIndex = exercise.comments.findIndex((comment) => comment._id.equals(commentId))

    if (commentIndex === -1) {
      return res.status(404).send('Comment not found comment to delete')
    }

    exercise.comments.splice(commentIndex, 1)
    await exercise.save()

    io.emit('comment deleted', { exerciseId, commentId })

    res.status(200).send('Comment deleted')
  } catch (error) {
    console.error('Error deleting comment:', error)
    res.status(500).send('Error deleting comment')
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
}
