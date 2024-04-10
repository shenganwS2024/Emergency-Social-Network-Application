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
  deleteComment,
} from '../controllers/exerciseController.js'

const router = express.Router()

router.get('/exercises', getExercises)
router.get('/exercises/:id/:username', getExerciseById)
router.post('/exercises', postExercise)
router.post('/exercises/:id/comments', addComment)
router.put('/exercises/:id/like', handleLike)
router.put('/exercises/:id/dislike', handleDislike)
router.put('/exercises/:id/unlike', handleUnlike)
router.put('/exercises/:id/undislike', handleUndislike)
router.delete('/exercises/:exerciseId/comments/:commentId', deleteComment)

export default router
