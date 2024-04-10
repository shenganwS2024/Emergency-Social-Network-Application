import express from 'express'
import {
  getExercises,
  postExercise,
  getExerciseById,
  addComment,
  handleLike,
  handleDislike,
  handleUnlike,
  handleUndislike,
} from '../controllers/exerciseController.js'

const router = express.Router()

router.get('/exercises', getExercises)
router.post('/exercises', postExercise)
router.get('/exercises/:id/:username', getExerciseById)
router.post('/exercises/:id/comments', addComment)
router.put('/exercises/:id/like', handleLike)
router.put('/exercises/:id/dislike', handleDislike)
router.put('/exercises/:id/unlike', handleUnlike)
router.put('/exercises/:id/undislike', handleUndislike)

export default router
