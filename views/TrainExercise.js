const socket = io('http://localhost:3000', {
  query: {
    token: localStorage.getItem('token'),
  },
})

const backButton = document.getElementById('backButton')
backButton.addEventListener('click', () => navigateTo('ESN Directory.html'))

const exercisesList = document.getElementById('exercisesList')
const uploadButton = document.getElementById('uploadButton')
uploadButton.addEventListener('click', () => navigateTo('UploadExercise.html'))

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
  exercises.forEach((exercise) => {
    addExerciseToDOM(exercise)
  })
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

socket.on('new exercise', (exercise) => {
  addExerciseToDOM(exercise)
})

fetchExercises()
