document.addEventListener('DOMContentLoaded', function () {
  setUpEventListeners()
})

function setUpEventListeners() {
  document.getElementById('addQuestionBtn').addEventListener('click', addQuestion)
  document.getElementById('cancelBtn').addEventListener('click', () => redirectTo('TrainExercise.html'))
  document.getElementById('newExerciseForm').addEventListener('submit', submitExerciseForm)
  document.getElementById('okBtn').onclick = () => redirectTo('TrainExercise.html')
}

function addQuestion() {
  const quizQuestionsContainer = document.getElementById('quizQuestionsContainer')
  const questionDiv = createQuestionDiv()
  quizQuestionsContainer.appendChild(questionDiv)
}

function createQuestionDiv() {
  const questionDiv = document.createElement('div')
  questionDiv.className = 'quizQuestion'

  const questionInput = createInput('question', 'Enter question')
  questionDiv.appendChild(questionInput)

  const answerInput = createInput('answer', 'Enter answer')
  questionDiv.appendChild(answerInput)

  return questionDiv
}

function createInput(name, placeholder) {
  const input = document.createElement('input')
  input.type = 'text'
  input.name = name
  input.placeholder = placeholder
  return input
}

async function submitExerciseForm(e) {
  e.preventDefault()

  const formData = getFormData()
  if (!formData.isValid) {
    return
  }

  try {
    const response = await fetch('/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    showModal('successModal')
  } catch (error) {
    console.error('Error saving exercise:', error)
  }
}

function getFormData() {
  clearAllNotifications()
  const title = document.getElementById('title').value.trim()
  const videoLink = document.getElementById('videoLink').value.trim()
  const author = localStorage.getItem('username')
  const timestamp = Date.now()
  let isValid = true

  // Validation
  if (title === '') {
    showNotification('Please enter a title for the exercise.', 'titleNotification')
    isValid = false
  }

  if (!isValidYouTubeLink(videoLink)) {
    showNotification('Please enter a valid YouTube video link.', 'videoLinkNotification')
    isValid = false
  }

  const questionElements = document.querySelectorAll('.quizQuestion')
  if (questionElements.length === 0) {
    showNotification('Please add at least one quiz question.', 'quizNotification')
    isValid = false
  }

  const quizQuestions = Array.from(questionElements).map((questionDiv) => {
    const question = questionDiv.querySelector('input[name="question"]').value.trim()
    const answer = questionDiv.querySelector('input[name="answer"]').value.trim()
    if (question === '' || answer === '') {
      showNotification(`Please fill in the question and its answer.`, 'quizNotification')
      isValid = false
    }
    return { question, answer }
  })

  return { title, author, videoLink, timestamp, quizQuestions, isValid }
}

function clearAllNotifications() {
  document.querySelectorAll('.notification').forEach((notification) => {
    notification.textContent = ''
    notification.classList.remove('show')
  })
}

function showNotification(message, elementId) {
  const notification = document.getElementById(elementId)
  notification.textContent = message
  notification.classList.add('show')
}

function isValidYouTubeLink(url) {
  const youtubeLinkPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
  return youtubeLinkPattern.test(url)
}

function showModal(modalId) {
  const modal = document.getElementById(modalId)
  modal.style.display = 'block'
}

function redirectTo(url) {
  window.location.href = url
}
