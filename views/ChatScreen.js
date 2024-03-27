
// import {io} from '../config/serverConfig.js'
let pageNumber = 1;
       async function fetchMessages() {
        const searchInput = document.getElementById('search-input').value.trim();
   // Assuming the first page. Adjust as needed.
        ++pageNumber;
  // Encoding URI components to ensure special characters in the searchInput do not break the URL
  const encodedSearchInput = encodeURIComponent(searchInput);
            const searchURL = `/search/publicMessage/${encodedSearchInput}/${pageNumber.toString()}`;

try {
    const response = await fetch(searchURL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json', // Expecting a JSON response
        }
    });

    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const result = await response.json();
    const messages =result.data.results;
    messages.forEach((message) => {
          renderMSG(message)
        })
    
} catch (error) {
    console.error('Failed to fetch:', error.message);
    // Optionally, update the UI to notify the user that the search failed
}
}
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

document.getElementById('announcement').addEventListener('click', function () {
  window.location.href = 'Announcement.html'
})

document.getElementById('exit-chat').addEventListener('click', () => {
  // URL of the server endpoint that handles the status change
  logout()
  // Assuming the user's ID or some form of identification is needed
 })
 


document.getElementById('search-btn').addEventListener('click', async function() {
  const searchInput = document.getElementById('search-input').value.trim();
  const pageNumber = 1; // Assuming the first page. Adjust as needed.

  // Encoding URI components to ensure special characters in the searchInput do not break the URL
  const encodedSearchInput = encodeURIComponent(searchInput);
  const searchURL = `/search/publicMessage/${encodedSearchInput}/${pageNumber.toString()}`;

  try {
    const response = await fetch(searchURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json', // Expecting a JSON response
      },
    })

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`)
    }

    const result = await response.json()
    const messages = result.data.results
    const messagesContainer = document.querySelector('.messages') // Select the messages container

    // Clear existing messages before displaying new ones
    messagesContainer.innerHTML = ''
    messages.forEach((message) => {
      renderMSG(message)
    })
  } catch (error) {
    console.error('Failed to fetch:', error.message)
    // Optionally, update the UI to notify the user that the search failed
  }
});

document.getElementById('see-more-btn').addEventListener('click', function() {
fetchMessages(); // Call the function to fetch the next page of messages
});


document.addEventListener('DOMContentLoaded', function () {
  
  document.getElementById('see-more-btn').addEventListener('click', function() {
    console.log('See more button clicked'+pageNumber);
  fetchMessages(); // Call the function to fetch the next page of messages
  });
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


// Function to send a message
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


// Function to get user status
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
        resolve(data.data.status)
      })
      .catch((error) => {
        console.error('Error getting status:', error)
        reject(error)
      })
  })
}

// Function to render a message
function renderMSG(message) {
  let msgContainer = app.querySelector('.chatroom .messages')
  let senderName = message.username

  let element = document.createElement('div')
  element.setAttribute('class', 'message')
  element.innerHTML = `
        <div>
          <div class="messageContainer">
            <div class="name">${senderName + ' (' + message.status + ')'}</div>
            <div id="time">${formatTimestamp(message.timestamp)}</div>
          </div>
          <div class="text">${message.content}</div>
        </div>
        `
  msgContainer.appendChild(element)
  // Ensures that the container scrolls to the bottom to show the newest message
  msgContainer.scrollTop = msgContainer.scrollHeight - msgContainer.clientHeight
}

// Function to format the timestamp
function formatTimestamp(timestamp) {
  return new Date(timestamp)
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
    .replace(' PM', 'PM')
}

// Function to handle user logout
function logout() {
  const userId = localStorage.getItem('userID') // Implement this function based on your app's logic

  // Data to be sent in the request
  const data = {
    id: userId,
    status: false,
  }

  // Send a POST request to the server
  fetch('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add any other headers your server requires, such as authentication tokens
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data)
      // Here you can also trigger any additional logout logic, like redirecting the user
    })
    .catch((error) => {
      console.error('Error:', error)
    })
    .finally(() => {
      // Remove the token from localStorage
      localStorage.removeItem('token')
      // Optionally, redirect the user to the login page or home page
      window.location.href = '/'
    })
}
