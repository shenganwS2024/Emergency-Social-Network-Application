import mongoose from 'mongoose'

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false, timestamps: false },
)

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true, timestamps: false },
)

const exerciseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  videoLink: {
    type: String,
    trim: true,
  },
  likes: [
    {
      type: String,
      ref: 'Users',
    },
  ],
  dislikes: [
    {
      type: String,
      ref: 'Users',
    },
  ],

  quizQuestions: [quizQuestionSchema],
  comments: [commentSchema],
})

exerciseSchema.virtual('likeRate').get(function () {
  const totalVotes = this.likes.length + this.dislikes.length
  return totalVotes > 0 ? (this.likes.length / totalVotes) * 100 : 0
})

exerciseSchema.virtual('dislikeRate').get(function () {
  const totalVotes = this.likes.length + this.dislikes.length
  return totalVotes > 0 ? (this.dislikes.length / totalVotes) * 100 : 0
})

exerciseSchema.methods.userReaction = function (username) {
  const like = this.likes.some((like) => like.user.equals(username))
  const dislike = this.dislikes.some((dislike) => dislike.user.equals(username))
  return { like, dislike }
}

exerciseSchema.set('toJSON', { virtuals: true })
exerciseSchema.set('toObject', { virtuals: true })

let Exercises = mongoose.model('Exercises', exerciseSchema)

export { Exercises }
