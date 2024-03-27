// Global variables
let pageNumber = 1
const socket = io('http://localhost:3000/', {
  query: {
    token: localStorage.getItem('token'),
  },
})
const app = document.querySelector('.app')

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeChat)
document.getElementById('directory-button').addEventListener('click', () => redirectTo('ESN%20Directory.html'))
document.getElementById('announcement').addEventListener('click', () => redirectTo('Announcement.html'))
document.getElementById('exit-chat').addEventListener('click', logout)
document.getElementById('search-btn').addEventListener('click', searchMessages)
document.getElementById('see-more-btn').addEventListener('click', () => fetchMessages(pageNumber++))
document.getElementById('send-msg').addEventListener('click', sendMessage)

// Socket event listener
socket.on('chat message', function (msg) {
  if (msg.receiver === 'public') {
    renderMSG(msg)
  }
})

// Initialize chat
function initializeChat() {
  const username = localStorage.getItem('username')
  fetchUserMessages(username)
  fetchUserStatus(username)
}

// Fetch user messages
async function fetchUserMessages(username) {
  try {
    const response = await fetch(`/messages/${username}/public`)
    const data = await response.json()
    data.data.messages.forEach(renderMSG)
  } catch (error) {
    console.error('Error fetching messages:', error)
  }
}

// Fetch user status
async function fetchUserStatus(username) {
  try {
    const status = await getUserStatus(username)
    console.log('User status:', status)
  } catch (error) {
    console.error('Error fetching status:', error)
  }
}

// Search messages
async function searchMessages() {
  const searchInput = document.getElementById('search-input').value.trim()
  const encodedSearchInput = encodeURIComponent(searchInput)
  const searchURL = `/search/publicMessage/${encodedSearchInput}/${pageNumber}`

  try {
    const response = await fetch(searchURL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    const result = await response.json()
    const messagesContainer = document.querySelector('.messages')
    messagesContainer.innerHTML = ''
    result.data.results.forEach(renderMSG)
  } catch (error) {
    console.error('Failed to fetch:', error.message)
  }
}

// Fetch messages
async function fetchMessages() {
  const searchInput = document.getElementById('search-input').value.trim()
  const encodedSearchInput = encodeURIComponent(searchInput)
  const searchURL = `/search/publicMessage/${encodedSearchInput}/${pageNumber}`

  try {
    const response = await fetch(searchURL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    const result = await response.json()
    result.data.results.forEach(renderMSG)
  } catch (error) {
    console.error('Failed to fetch:', error.message)
  }
}

// Send message
async function sendMessage() {
  const messageInput = document.getElementById('message-input')
  const messageText = messageInput.value.trim()
  const currentTime = new Date().toISOString()
  const username = localStorage.getItem('username')
  const currentStatus = await getUserStatus(username)

  if (messageText) {
    const data = {
      content: messageText,
      username: username,
      timestamp: currentTime,
      status: currentStatus,
    }
    try {
      const response = await fetch(`/messages/${username}/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      console.log('Success:', result)
      messageInput.value = ''
    } catch (error) {
      console.error('Error:', error)
    }
  } else {
    alert('Please enter a message before posting.')
  }
}

// Get user status
function getUserStatus(username) {
  return fetch(`/status/${username}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((data) => data.data.status)
    .catch((error) => {
      console.error('Error getting status:', error)
      throw error
    })
}

// Render message
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
  msgContainer.scrollTop = msgContainer.scrollHeight - msgContainer.clientHeight
}

// Format timestamp
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

// Redirect to a different page
function redirectTo(url) {
  window.location.href = url
}

// Handle user logout
function logout() {
  const userId = localStorage.getItem('userID')
  const data = {
    id: userId,
    status: false,
  }

  fetch('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
    .finally(() => {
      localStorage.removeItem('token')
      window.location.href = '/'
    })
}
