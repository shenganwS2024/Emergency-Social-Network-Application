// Global variables
let pageNumber = 1
const socket = io('https://s24esnb2.onrender.com/', {
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
document.getElementById('stop-search').addEventListener('click', stopSearch)
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
  const searchInput = getSearchInput()
  const searchURL = createSearchURL(searchInput)

  try {
    const result = await fetchSearchResults(searchURL)
    if(result.data.results.length === 0) {
      alert('No search result to display.')
    }
    displayMessages(result.data.results)
    
  } catch (error) {
    console.error('Failed to fetch:', error.message)
  }
}

async function stopSearch() {
  window.location.reload()
}

function getSearchInput() {
  return document.getElementById('search-input').value.trim()
}

function createSearchURL(searchInput) {
  const encodedSearchInput = encodeURIComponent(searchInput)
  return `/search/publicMessage/${encodedSearchInput}/${pageNumber}`
}

async function fetchSearchResults(searchURL) {
  const response = await fetch(searchURL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  return await response.json()
}

function displayMessages(messages) {
  const messagesContainer = document.querySelector('.messages')
  messagesContainer.innerHTML = ''
  messages.forEach(renderMSG)
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
    if(result.data.results.length === 0) {
      alert('No search result to display.')
      return
    }
    result.data.results.forEach(renderMSG)
  } catch (error) {
    console.error('Failed to fetch:', error.message)
  }
}

// Send message
async function sendMessage() {
  const messageText = getMessageText()
  if (!messageText) {
    alert('Please enter a message before posting.')
    return
  }

  const username = localStorage.getItem('username')
  const currentTime = new Date().toISOString()
  const currentStatus = await getUserStatus(username)

  const messageData = {
    content: messageText,
    username: username,
    timestamp: currentTime,
    status: currentStatus,
  }

  try {
    const result = await postMessage(username, messageData)
    console.log('Success:', result)
    clearMessageInput()
  } catch (error) {
    console.error('Error:', error)
  }
}

function getMessageText() {
  const messageInput = document.getElementById('message-input')
  return messageInput.value.trim()
}

function clearMessageInput() {
  const messageInput = document.getElementById('message-input')
  messageInput.value = ''
}

async function postMessage(username, messageData) {
  const response = await fetch(`/messages/${username}/public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData),
  })
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }
  return response.json()
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
  const msgContainer = app.querySelector('.chatroom .messages')
  const messageElement = createMessageElement(message)
  appendMessageToContainer(msgContainer, messageElement)
  scrollToBottom(msgContainer)
}

function createMessageElement(message) {
  const element = document.createElement('div')
  element.setAttribute('class', 'message')
  element.innerHTML = `
    <div>
      <div class="messageContainer">
        <div class="name">${message.username + ' (' + message.status + ')'}</div>
        <div id="time">${formatTimestamp(message.timestamp)}</div>
      </div>
      <div class="text">${message.content}</div>
    </div>
  `
  return element
}

function appendMessageToContainer(container, messageElement) {
  container.appendChild(messageElement)
}

function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight - container.clientHeight
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
  const logoutData = {
    id: userId,
    status: false,
  }

  sendLogoutRequest(logoutData).then(handleLogoutSuccess).catch(handleLogoutError).finally(cleanupAfterLogout)
}

function sendLogoutRequest(data) {
  return fetch('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((response) => response.json())
}

function handleLogoutSuccess(data) {
  console.log('Success:', data)
}

function handleLogoutError(error) {
  console.error('Error:', error)
}

function cleanupAfterLogout() {
  localStorage.removeItem('token')
  window.location.href = '/'
}
