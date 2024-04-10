document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('addQuestionBtn').addEventListener('click', function () {
    const quizQuestionsContainer = document.getElementById('quizQuestionsContainer')
    const questionDiv = document.createElement('div')
    questionDiv.className = 'quizQuestion'
    const questionInput = document.createElement('input')
    questionInput.type = 'text'
    questionInput.name = 'question'
    questionInput.placeholder = 'Enter question'
    questionDiv.appendChild(questionInput)
    const answerInput = document.createElement('input')
    answerInput.type = 'text'
    answerInput.name = 'answer'
    answerInput.placeholder = 'Enter answer'
    questionDiv.appendChild(answerInput)
    quizQuestionsContainer.appendChild(questionDiv)
  })
  var modal = document.getElementById('successModal')
  var okBtn = document.getElementById('okBtn')

  okBtn.onclick = function () {
    window.location.href = 'TrainExercise.html'
  }

  document.getElementById('cancelBtn').addEventListener('click', function () {
    window.location.href = 'TrainExercise.html'
  })

  document.getElementById('newExerciseForm').addEventListener('submit', async function (e) {
    e.preventDefault()
    const title = document.getElementById('title').value.trim()
    const videoLink = document.getElementById('videoLink').value.trim()
    const questionElements = document.querySelectorAll('.quizQuestion')
    const author = localStorage.getItem('username')
    const timestamp = Date.now()
    let isValid = true

    // Hide all notifications
    document.querySelectorAll('.notification').forEach((notification) => {
      notification.classList.remove('show')
    })

    // Validate title
    if (title === '') {
      showNotification('Please enter a title for the exercise.', 'titleNotification')
      isValid = false
    }

    // Validate video link
    if (!isValidYouTubeLink(videoLink)) {
      showNotification('Please enter a valid YouTube video link.', 'videoLinkNotification')
      isValid = false
    }

    // Validate quiz questions
    if (questionElements.length === 0) {
      showNotification('Please add at least one quiz question.', 'quizNotification')
      isValid = false
    }

    // Validate quiz questions and answers
    questionElements.forEach((questionDiv, index) => {
      const question = questionDiv.querySelector('input[name="question"]').value.trim()
      const answer = questionDiv.querySelector('input[name="answer"]').value.trim()
      if (question === '' || answer === '') {
        showNotification(`Please fill in question ${index + 1} and its answer.`, 'quizNotification')
        isValid = false
      }
    })

    if (!isValid) {
      return
    }

    try {
      const response = await fetch('/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, author, videoLink, timestamp, questionElements }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      modal.style.display = 'block'
    } catch (error) {
      console.error('Error saving exercise:', error)
    }
  })
  function showNotification(message, elementId) {
    const notification = document.getElementById(elementId)
    notification.textContent = message
    notification.classList.add('show')
  }

  function isValidYouTubeLink(url) {
    const youtubeLinkPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    return youtubeLinkPattern.test(url)
  }
})
