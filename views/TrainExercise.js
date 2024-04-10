const socket = io('http://localhost:3000', {
  query: {
    token: localStorage.getItem('token'),
  },
})
const backButton = document.getElementById('backButton')
backButton.addEventListener('click', function () {
  window.location.href = 'ESN Directory.html'
})

const exercisesList = document.getElementById('exercisesList')
const uploadButton = document.getElementById('uploadButton')
uploadButton.addEventListener('click', function () {
  window.location.href = 'UploadExercise.html'
})

// Fetch exercises from the server and display them
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
  exercisesList.innerHTML = '' // Clear existing exercises
  exercises.forEach((exercise) => {
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
      window.location.href = `ExerciseDetails.html?id=${exercise._id}`
    })

    exercisesList.appendChild(exerciseCard)
  })
}

function addExerciseToDOM(exercise) {
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
    window.location.href = `ExerciseDetails.html?id=${exercise._id}`
  })

  // Prepend the new exercise to the list to show it at the top
  exercisesList.prepend(exerciseCard)
}

socket.on('new exercise', (exercise) => {
  addExerciseToDOM(exercise)
})

fetchExercises()
