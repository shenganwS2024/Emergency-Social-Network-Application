let bannedUsernames = ''
fetch('./bannedUsernames.json')
  .then((response) => response.json())
  .then((data) => {
    bannedUsernames = data.reservedUsernames
    // Use the bannedUsernames array as needed
  })
  .catch((error) => console.error('Error loading JSON file:', error))
//console.log(bannedUsernames)

showPage('home-page')

document.getElementById('joinBtn').addEventListener('click', function () {
  showPage('registration-form')
})

document.getElementById('notConfirmBtn').addEventListener('click', function () {
  document.getElementById('username').value = ''
  document.getElementById('password').value = ''
  showPage('registration-form')
})

let currentUser = { username: '', password: '' }

document.getElementById('registerForm').addEventListener('submit', function (event) {
  event.preventDefault()
  let username = document.getElementById('username').value.trim()
  let password = document.getElementById('password').value.trim()
  localStorage.setItem('username', username)

  // * Username Rule: Usernames are provided by users and should be at least 3 characters long. They should not be in the list of banned usernames. They should not already exist. Usernames are NOT case sensitive.
  // * Password Rule: Passwords are provided by users and should be at least 4 characters long. Passwords ARE case sensitive.
  if (validateUserInfo(username, password)) {
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(async (response) => {
        console.log('before 200')
        if (response.status === 200) {
          const data = await response.json()
          console.log('after 200')
          // if Both username and password is correct, log the user in and get the user and message date from the server
          console.log(data)
          const userID = data.data.userID
          //const users = data.data.users
          console.log(userID)
          localStorage.setItem('userID', userID)
          localStorage.setItem('username', username)
          //localStorage.setItem('users', JSON.stringify(users))
          localStorage.setItem('token', data.data.token)
          console.log('before acknolegement')
          console.log('name: ' + data.data.username)
          console.log('ack: ' + data.data.acknowledged)
          if (data.data.acknowledged === false) {
            console.log('before showPage')
            showPage('welcome-page')
            console.log('after acknolegement')
          } else {
            window.location.href = 'ESN_Directory.html'
          }
        } else if (response.status === 201) {
          // if the username doesn't exist, creat new user and show confirmation page
          // console.log(" 201")
          // console.log(response);
          // const data = await response.json();
          // console.log("sssss "+data);
          // localStorage.setItem('token', data.data.token);
          // console.log("sssss "+data.data.token);
          showPage('confirmation-page')
        } else if (response.status === 409) {
          alert('Conflict: Username already exists and password is incorrect. Please re-enter')
          document.getElementById('username').value = ''
          document.getElementById('password').value = ''
        } else {
          const errorText = await response.text()
          alert(errorText)
        }
      })
      .catch((error) => {
        // send to server and check if exist
      })
  }
  currentUser.username = username
  currentUser.password = password
})

document.getElementById('acknowledgeBtn').addEventListener('click', function () {
  updateUserAcknowledgement(localStorage.getItem('userID'))
  document.getElementById('username').value = ''
  document.getElementById('password').value = ''
  window.location.href = 'ESN Directory.html'
})

function showPage(pageId) {
  document.querySelectorAll('section').forEach((page) => {
    page.classList.add('hidden')
  })
  document.getElementById(pageId).classList.remove('hidden')
}

document.getElementById('confirmBtn').addEventListener('click', function () {
  // Save user data here
  fetch('/registration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: currentUser.username, password: currentUser.password }),
  })
    .then(async (response) => {
      if (response.status === 201) {
        //alert('User registered successfully')
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
      // send to server and check if exist
    })
})

function validateUserInfo(username, password) {
  username = username.toLowerCase()
  if (username.length < 3 || bannedUsernames.includes(username)) {
    alert('Username should be at least 3 characters and not banned ')
    return false
  } else if (password.length < 4) {
    alert('Password should be at least 4 characters long')
    return false
  } else {
    return true
  }
}

function updateUserAcknowledgement(userId) {
  const data = {
    id: userId,
  }

  fetch('/acknowledgement', {
    method: 'PUT', // Using PUT since it's typically used for updating resources
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.text() // Assuming the server sends a plain text response
    })
    .then((responseText) => {
      console.log('Success:', responseText)
      // Handle success response. Update the UI or notify the user as needed.
    })
    .catch((error) => {
      console.error('Error:', error)
      // Handle errors here. Show an error message to the user, for example.
    })
}
