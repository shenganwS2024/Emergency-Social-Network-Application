
// import {io} from '../config/serverConfig.js'

console.log('localstorage token', localStorage.getItem('token'))
const socket = io('http://localhost:3000/', {
  query: {
    token: localStorage.getItem('token'),
  },
})
const app = document.querySelector('.app')

socket.on('chat message', function (msg) {
  if (msg.receiver === 'public') {
    renderMSG(msg)
  }
})

document.getElementById('directory-button').addEventListener('click', function () {
  window.location.href = 'ESN%20Directory.html'
})

// Handle user logout
document.getElementById('exit-chat').addEventListener('click', () => {
  // URL of the server endpoint that handles the status change
  logout()
  // Assuming the user's ID or some form of identification is needed
})

document.getElementById('announcement').addEventListener('click', async function () {
  window.location.href = 'Announcement.html'
}) 

document.getElementById('search-btn').addEventListener('click', function() {
  const searchQuery = document.getElementById('search-input').value.toLowerCase();
  const searchContext = 'publicChat';
});

document.addEventListener('DOMContentLoaded', function () {
  // Assuming you have a way to get the current user's username
  const username = localStorage.getItem('username')
  fetch(`/messages/${username}/public`)
    .then((response) => response.json())
    .then((data) => {
      const messages = data.data.messages
      messages.forEach((message) => {
        renderMSG(message)
      })
    })
    .catch((error) => console.error('Error fetching messages:', error))

  document.getElementById('send-msg').addEventListener('click', async function () {
    const messageInput = document.getElementById('message-input')
    const messageText = messageInput.value.trim()
    const currentTime = new Date().toISOString()
    const currentStatus = await getUserStatus(username)

    if (messageText) {
      // Create the payload
      const data = {
        content: messageText,
        username: username,
        timestamp: currentTime,
        status: currentStatus,
      }
      console.log(data)

      // Send the data to the server
      fetch(`/messages/${username}/public`, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data)
          messageInput.value = '' // Clear the input after sending
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    } else {
      alert('Please enter a message before posting.')
    }
  })
})

function getUserStatus(username) {
  return new Promise((resolve, reject) => {
    fetch(`/status/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Status got successfully:', data.data.status)
        resolve(data.data.status.status)
      })
      .catch((error) => {
        console.error('Error getting status:', error)
        reject(error)
      })
  })
}

function renderMSG(message) {
  //("before container");
  let msgContainer = app.querySelector('.chatroom .messages')
  let senderName = message.username
  //console.log("after container");

  let element = document.createElement('div')
  element.setAttribute('class', 'message')
  // Adjust the format so the timestamp matches the demo
  element.innerHTML = `
        <div>
        <div class ="messageContainer">
            <div class ="name">${senderName + '     (' + message.status + ')'}</div>
            <div id="time">${new Date(message.timestamp)
              .toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
              .replace(/\//g, '.')
              .replace(', ', ' ')
              .replace(' AM', 'AM')
              .replace(' PM', 'PM')}</div>
            </div>
            <div class = "text">${message.content}</div>
        </div>
        `
  //console.log("before appending");
  msgContainer.appendChild(element)
  //console.log("after appending");
  // Ensures that the container scrolls to the bottom to show newest message
  msgContainer.scrollTop = msgContainer.scrollHeight - msgContainer.clientHeight
}

function logout() {
  const userId = localStorage.getItem('userID') // Implement this function based on your app's logic

  // Data to be sent in the request
  const data = {
    id: userId,
    status: false,
  }

  // Send a POST request to the server
  fetch('/logout', {
    method: 'POST', // or 'PUT' if updating the status
    headers: {
      'Content-Type': 'application/json',
      // Add any other headers your server requires, such as authentication tokens
    },
    body: JSON.stringify(data), // Convert the JavaScript object to a JSON string
  })
    .then((response) => response.json()) // Parse the JSON response
    .then((data) => {
      console.log('Success:', data)
      // Here you can also trigger any additional logout logic, like redirecting the user
    })
    .catch((error) => {
      console.error('Error:', error)
    })
    .finally(() => {
      //socket.emit("exituser");
      // Remove the token from localStorage
      console.log(localStorage.getItem('token'))
      localStorage.removeItem('token')

      // Optionally, redirect the user to the login page or home page
      window.location.href = '/'
    })
}
