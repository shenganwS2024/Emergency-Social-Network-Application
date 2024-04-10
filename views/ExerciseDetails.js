const urlParams = new URLSearchParams(window.location.search)
const exerciseId = urlParams.get('id')
let exerciseDetails = null

const socket = io('http://localhost:3000', {
  query: {
    token: localStorage.getItem('token'),
  },
})

async function fetchExerciseDetails() {
  try {
    const response = await fetch(`/exercises/${exerciseId}/${localStorage.getItem('username')}`)
    exerciseDetails = await response.json()
    console.log('Exercise:', exerciseDetails)
    displayExerciseDetails()
    updateLikeDislikeUI()
    updateLikeDislikeRates(exerciseDetails.likeRate, exerciseDetails.dislikeRate)
    displayComments()
  } catch (error) {
    console.error('Error fetching exercise details:', error)
  }
}

function displayExerciseDetails() {
  document.getElementById('exerciseTitle').textContent = exerciseDetails.title
  document.getElementById('exerciseAuthor').textContent = `Author: ${exerciseDetails.author}`
  document.getElementById('exerciseTimestamp').textContent = new Date(exerciseDetails.timestamp).toLocaleString()
  displayVideo(exerciseDetails.videoLink)
}

function displayVideo(videoLink) {
  const videoContainer = document.getElementById('videoContainer')
  const videoFrame = document.createElement('iframe')
  videoFrame.setAttribute('width', '380')
  videoFrame.setAttribute('height', '214')
  videoFrame.setAttribute('src', `https://www.youtube.com/embed/${extractVideoID(videoLink)}`)
  videoFrame.setAttribute('title', 'YouTube video player')
  videoFrame.setAttribute('frameborder', '0')
  videoFrame.setAttribute(
    'allow',
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
  )
  videoFrame.setAttribute('allowfullscreen', true)
  videoContainer.appendChild(videoFrame)
}

function displayComments() {
  const commentsListElement = document.querySelector('.comments-list')
  commentsListElement.innerHTML = ''

  exerciseDetails.comments.forEach((comment) => {
    const commentElement = createCommentElement(comment)
    commentsListElement.appendChild(commentElement)
  })
}

function createCommentElement(comment) {
  const commentElement = document.createElement('div')
  commentElement.classList.add('comment-item')

  const commentText = document.createElement('div')
  commentText.classList.add('comment-text')
  commentText.textContent = comment.content

  const commentFooter = document.createElement('div')
  commentFooter.classList.add('comment-footer')

  const commentAuthor = document.createElement('div')
  commentAuthor.classList.add('comment-author')
  commentAuthor.textContent = comment.author

  const commentTimestamp = document.createElement('div')
  commentTimestamp.classList.add('comment-timestamp')
  commentTimestamp.textContent = new Date(comment.timestamp).toLocaleString()

  commentElement.appendChild(commentText)
  commentFooter.appendChild(commentAuthor)
  commentFooter.appendChild(commentTimestamp)

  if (localStorage.getItem('username') === comment.author) {
    const deleteButton = createDeleteButton(comment._id)
    commentFooter.appendChild(deleteButton)
  }

  commentElement.appendChild(commentFooter)
  return commentElement
}

function createDeleteButton(commentId) {
  const deleteButton = document.createElement('button')
  deleteButton.textContent = 'Delete'
  deleteButton.classList.add('delete-comment-btn')
  deleteButton.onclick = () => deleteComment(commentId)
  return deleteButton
}

async function deleteComment(commentId) {
  try {
    const response = await fetch(`/exercises/${exerciseId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error deleting comment:', error)
  }
}

function extractVideoID(url) {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

document.getElementById('backButton').addEventListener('click', function () {
  window.location.href = 'TrainExercise.html'
})

document.getElementById('likeButton').addEventListener('click', handleLikeDislike)
document.getElementById('dislikeButton').addEventListener('click', handleLikeDislike)
document.getElementById('quizButton').addEventListener('click', takeQuiz)
document.getElementById('submitComment').addEventListener('click', submitComment)

async function handleLikeDislike(event) {
  const action = event.target.id === 'likeButton' ? 'like' : 'dislike'
  const isAlreadyReacted =
    exerciseDetails && exerciseDetails.userReaction ? exerciseDetails.userReaction[action] : false
  const endpoint = isAlreadyReacted ? `un${action}` : action

  const response = await fetch(`/exercises/${exerciseId}/${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: localStorage.getItem('username') }),
  })

  const result = await response.json()
  if (response.ok) {
    updateLikeDislikeUI(result.userReaction)
    updateLikeDislikeRates(result.likeRate, result.dislikeRate)
  } else {
    alert(result.message)
  }
}

function updateLikeDislikeUI(userReaction = exerciseDetails.userReaction) {
  const likeButton = document.getElementById('likeButton')
  const dislikeButton = document.getElementById('dislikeButton')

  if (userReaction) {
    likeButton.classList.toggle('bi-hand-thumbs-up-fill', userReaction.like)
    likeButton.classList.toggle('bi-hand-thumbs-up', !userReaction.like)
    dislikeButton.classList.toggle('bi-hand-thumbs-down-fill', userReaction.dislike)
    dislikeButton.classList.toggle('bi-hand-thumbs-down', !userReaction.dislike)
  }
}

function updateLikeDislikeRates(likeRate, dislikeRate) {
  document.getElementById('likeButton').textContent = `(${likeRate.toFixed(2)}%)`
  document.getElementById('dislikeButton').textContent = `(${dislikeRate.toFixed(2)}%)`
}

function takeQuiz() {
  const quizModal = document.getElementById('quizModal')
  const quizForm = document.getElementById('quizForm')

  quizForm.innerHTML = ''

  if (exerciseDetails) {
    exerciseDetails.quizQuestions.forEach((question, index) => {
      const questionElement = document.createElement('div')
      questionElement.innerHTML = `
        <p>Q${index + 1}: ${question.question}</p>
        <input type="text" name="answer${index}" placeholder="Type your answer">
        <div class="result" id="result${index}"></div>
      `
      quizForm.appendChild(questionElement)
    })
  }

  quizModal.style.display = 'block'

  document.querySelector('.close').onclick = function () {
    quizModal.style.display = 'none'
  }
}

document.getElementById('submitQuiz').addEventListener('click', submitQuiz)

function submitQuiz() {
  const quizForm = document.getElementById('quizForm')
  const formData = new FormData(quizForm)
  const quizResults = document.getElementById('quizResults')

  quizResults.innerHTML = ''

  if (exerciseDetails) {
    exerciseDetails.quizQuestions.forEach((question, index) => {
      const userAnswer = formData.get(`answer${index}`).trim().toLowerCase()
      const resultElement = document.getElementById(`result${index}`)

      if (userAnswer === question.answer.toLowerCase()) {
        resultElement.innerHTML = `Correct! Your answer: ${userAnswer}`
        resultElement.classList.add('correct')
        resultElement.classList.remove('incorrect')
      } else {
        resultElement.innerHTML = `Incorrect. Your answer: ${userAnswer}. Correct answer: ${question.answer}`
        resultElement.classList.add('incorrect')
        resultElement.classList.remove('correct')
      }
    })
  }

  quizResults.scrollIntoView({ behavior: 'smooth' })
}

async function submitComment() {
  const commentContent = document.getElementById('commentInput').value.trim()
  if (commentContent === '') {
    alert('Please enter a comment.')
    return
  }
  const commentData = {
    author: localStorage.getItem('username'),
    content: commentContent,
    timestamp: new Date(),
  }

  try {
    const response = await fetch(`/exercises/${exerciseId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    document.getElementById('commentInput').value = ''
  } catch (error) {
    console.error('Error submitting comment:', error)
  }
}

socket.on('new comment', (updatedExercise) => {
  if (updatedExercise._id === exerciseId) {
    exerciseDetails = updatedExercise
    displayComments()
  }
})

socket.on('update exercise', (updatedExercise) => {
  if (updatedExercise._id === exerciseId) {
    exerciseDetails = updatedExercise
    updateLikeDislikeUI()
    updateLikeDislikeRates(updatedExercise.likeRate, updatedExercise.dislikeRate)
  }
})

socket.on('comment deleted', ({ exerciseId: deletedExerciseId, commentId }) => {
  if (deletedExerciseId === exerciseId) {
    exerciseDetails.comments = exerciseDetails.comments.filter((comment) => comment._id !== commentId)
    displayComments()
  }
})

fetchExerciseDetails()
