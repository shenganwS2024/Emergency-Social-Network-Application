const MIN_USERNAME_LENGTH = 3
const MIN_PASSWORD_LENGTH = 4

let bannedUsernames = []
fetchBannedUsernames()

showPage('home-page')
attachEventListeners()

let currentUser = { username: '', password: '' }

async function fetchBannedUsernames() {
  try {
    const response = await fetch('./bannedUsernames.json')
    const data = await response.json()
    bannedUsernames = data.reservedUsernames
  } catch (error) {
    console.error('Error loading JSON file:', error)
  }
}

function attachEventListeners() {
  document.getElementById('joinBtn').addEventListener('click', () => showPage('registration-form'))
  document.getElementById('notConfirmBtn').addEventListener('click', resetForm)
  document.getElementById('registerForm').addEventListener('submit', registerUser)
  document.getElementById('acknowledgeBtn').addEventListener('click', acknowledgeUser)
  document.getElementById('confirmBtn').addEventListener('click', confirmUserRegistration)
}

async function registerUser(event) {
  event.preventDefault()
  const username = document.getElementById('username').value.trim()
  const password = document.getElementById('password').value.trim()
  localStorage.setItem('username', username)

  if (validateUserInfo(username, password) && !(await isSpeedTestMode())) {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (response.status === 200) {
        handleSuccessfulLogin(await response.json(), username)
      } else if (response.status === 201) {
        showPage('confirmation-page')
      } else if (response.status === 409) {
        alert('Conflict: Username already exists and password is incorrect. Please re-enter')
        resetForm()
      } else {
        alert(await response.text())
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  currentUser.username = username
  currentUser.password = password
}

function handleSuccessfulLogin(data, username) {
  const { userID, token, acknowledged } = data.data
  localStorage.setItem('userID', userID)
  localStorage.setItem('username', username)
  localStorage.setItem('token', token)

  if (!acknowledged) {
    showPage('welcome-page')
  } else {
    window.location.href = 'ESN Directory.html'
  }
}

function validateUserInfo(username, password) {
  username = username.toLowerCase()
  if (username.length < MIN_USERNAME_LENGTH || bannedUsernames.includes(username)) {
    alert(`Username should be at least ${MIN_USERNAME_LENGTH} characters and not banned`)
    return false
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    alert(`Password should be at least ${MIN_PASSWORD_LENGTH} characters long`)
    return false
  } else {
    return true
  }
}

function resetForm() {
  document.getElementById('username').value = ''
  document.getElementById('password').value = ''
  showPage('registration-form')
}

function showPage(pageId) {
  document.querySelectorAll('section').forEach((page) => {
    page.classList.add('hidden')
  })
  document.getElementById(pageId).classList.remove('hidden')
}

async function isSpeedTestMode() {
  try {
    const response = await fetch('/speedTest', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    const data = await response.json()
    if (data.data.isSpeedTestMode === true) {
      alert('Speed Test Mode is on. Please try again later')
      return true
    }
    return false
  } catch (error) {
    console.error('Error getting status:', error)
    return false
  }
}

function acknowledgeUser() {
  updateUserAcknowledgement(localStorage.getItem('userID'))
  resetForm()
  window.location.href = 'ESN Directory.html'
}

function confirmUserRegistration() {
  fetch('/registration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: currentUser.username, password: currentUser.password }),
  })
    .then(async (response) => {
      if (response.status === 201) {
        const data = await response.json()
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('userID', data.data.userID)
        showPage('welcome-page')
      } else {
        const errorText = await response.text()
        alert(errorText)
      }
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function updateUserAcknowledgement(userId) {
  fetch('/acknowledgement', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: userId }),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      console.log('Success:', await response.text())
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}
