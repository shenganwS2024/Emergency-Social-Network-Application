const socket = io('http://localhost:3000', {
  query: {
    token: localStorage.getItem('token'),
  },
})

const backButton = document.getElementById('backButton')
backButton.addEventListener('click', function () {
  navigateTo('ESN Directory.html')
})

const exercisesList = document.getElementById('exercisesList')
const uploadButton = document.getElementById('uploadButton')
uploadButton.addEventListener('click', function () {
  navigateTo('UploadExercise.html')
})

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

  const title = document.createElement('h2')
  title.textContent = exercise.title

  const userInfo = document.createElement('p')
  userInfo.className = 'user-info'
  userInfo.innerHTML = `${exercise.author} - <time datetime="${exercise.timestamp}">${new Date(
    exercise.timestamp,
  ).toLocaleString()}</time>`

  exerciseCard.appendChild(title)
  exerciseCard.appendChild(userInfo)

  exerciseCard.addEventListener('click', () => {
    navigateTo(`ExerciseDetails.html?id=${exercise._id}`)
  })

  return exerciseCard
}

function navigateTo(url) {
  window.location.href = url
}

socket.on('new exercise', (exercise) => {
  addExerciseToDOM(exercise)
})

fetchExercises()
