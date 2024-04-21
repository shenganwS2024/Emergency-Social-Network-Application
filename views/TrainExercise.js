// Socket initialization
const socket = io('https://s24esnb2.onrender.com', {
  query: {
    token: localStorage.getItem('token'),
  },
})

// DOM Elements
const backButton = document.getElementById('backButton')
const exercisesList = document.getElementById('exercisesList')
const uploadButton = document.getElementById('uploadButton')

// Event Listeners
backButton.addEventListener('click', () => navigateTo('ESN Directory.html'))
uploadButton.addEventListener('click', () => navigateTo('UploadExercise.html'))
socket.on('new exercise', addExerciseToDOM)

// Fetch and display exercises on load
fetchExercises()

// Functions
async function fetchExercises() {
  try {
    const response = await fetch('/exercises')
    const exercises = await response.json()
    displayExercises(exercises)
  } catch (error) {
    console.error('Error fetching exercises:', error)
  }
}

function displayExercises(exercises) {
  exercisesList.innerHTML = ''
  exercises.forEach(addExerciseToDOM)
}

function addExerciseToDOM(exercise) {
  const exerciseCard = createExerciseCard(exercise)
  exercisesList.appendChild(exerciseCard)
}

function createExerciseCard(exercise) {
  const exerciseCard = document.createElement('article')
  exerciseCard.className = 'exercise-card'
  exerciseCard.addEventListener('click', () => navigateTo(`ExerciseDetails.html?id=${exercise._id}`))

  const title = createElement('h2', { textContent: exercise.title })
  const userInfo = createElement('p', {
    className: 'user-info',
    innerHTML: `${exercise.author} - <time datetime="${exercise.timestamp}">${new Date(
      exercise.timestamp,
    ).toLocaleString()}</time>`,
  })

  appendChildren(exerciseCard, [title, userInfo])
  return exerciseCard
}

function createElement(tag, attributes = {}) {
  const element = document.createElement(tag)
  Object.entries(attributes).forEach(([key, value]) => {
    element[key] = value
  })
  return element
}

function appendChildren(parent, children) {
  children.forEach((child) => parent.appendChild(child))
}

function navigateTo(url) {
  window.location.href = url
}
