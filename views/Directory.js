let pageNumber = 1

function incrementPageNumber() {
  pageNumber++
}

function getEncodedValues() {
  const searchInput = document.getElementById('search-input-private').value.trim()
  const encodedSearchInput = encodeURIComponent(searchInput)
  const sender = encodeURIComponent(localStorage.getItem('username'))
  const receiver = encodeURIComponent(localStorage.getItem('receiver'))

  return { encodedSearchInput, sender, receiver }
}

function constructSearchURL({ encodedSearchInput, sender, receiver }) {
  return `/search/privateMessage/${encodedSearchInput}/${pageNumber}/${sender}/${receiver}`
}

async function fetchMessages() {
  incrementPageNumber()
  const { encodedSearchInput, sender, receiver } = getEncodedValues()
  const searchURL = constructSearchURL({ encodedSearchInput, sender, receiver })

  try {
    const response = await fetch(searchURL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`)
    }

    const messages = await response.json()
    displayMessages(messages.data.results)
  } catch (error) {
    console.error('Failed to fetch:', error.message)
    // Optionally, update the UI to notify the user that the search failed
  }
}
const socket = io('https://s24esnb2.onrender.com/', {
  query: {
    token: localStorage.getItem('token'),
  },
})
const app = document.querySelector('.modal-content')
document.addEventListener('DOMContentLoaded', async () => {
  const statusSearchToggle = document.getElementById('status-search-toggle')
  let isChecked = false // Boolean flag to track the toggle state
  const profileChatModal = document.getElementById('profile-chat-modal');

  statusSearchToggle.addEventListener('click', function () {
    const searchInput = document.getElementById('search-input')
    const statusDropdown = document.getElementById('status-dropdown')

    if (isChecked) {
      // If it was already checked, uncheck it and show the input field
      statusSearchToggle.checked = false
      searchInput.style.display = 'block' // Show input field
      statusDropdown.style.display = 'none' // Hide dropdown
    } else {
      // If it was unchecked, check it and show the dropdown
      searchInput.style.display = 'none' // Hide input field
      statusDropdown.style.display = 'block' // Show dropdown
    }
    // Toggle the isChecked flag
    isChecked = !isChecked
  })

  let users
  let currentUser
  try {
    // Attempt to fetch the users
    const userResponse = await fetch('/users')
    const data = await userResponse.json()
    users = data.data.users
    console.log('the stored username ', localStorage.getItem('username'))
    currentUser = users.find((user) => user.username === localStorage.getItem('username'))
    localStorage.setItem('currentUser', JSON.stringify(currentUser))
    displayUsers(users, currentUser)
  } catch (error) {
    // Handle any fetch errors
    console.error('Error fetching users:', error)
  }
  const token = localStorage.getItem('token')
  const socket = io({
    query: {
      token: token, // Use the retrieved token here
    },
  })

  socket.on('speed test logout', function (user) {
    if (user.username !== localStorage.getItem('username')) {
      logout()
    }
  })

  socket.on('userStatusChanged', function (update) {
    console.log('status changed!', update.username, update.onlineStatus)
    const userIndex = users.findIndex((user) => user.username === update.username)
    if (userIndex !== -1) {
      users[userIndex].onlineStatus = update.onlineStatus
      //localStorage.setItem('users', JSON.stringify(users))
      displayUsers(users, currentUser) // Refresh the user list UI
    } else {
      users.push(update)
      //localStorage.setItem('users', JSON.stringify(users))
      displayUsers(users, currentUser)
    }
  })

  socket.on('update status', function (user) {
    const userIndex = users.findIndex((eachUser) => eachUser.username === user.username)

    users[userIndex].status = user.status

    displayUsers(users, currentUser)
  })

  socket.on('changeActiveness', function(data) {
    console.log('Activeness Change Received:', data);
    
    let currentUser = JSON.parse(localStorage.getItem('currentUser'))
    // Check if the activeness is false
    if (data.activeness === false && data.username === currentUser.username) {
      // Perform your action here when activeness is false
      console.log('Activeness for', data.username, 'is now inactive.');
      // You can call any function here to handle what should happen when inactive
      handleUserInactivity(data.username);
    }
  });

  socket.on('changeUsername', function(data) {
    // Check if the activeness is false
    let currentUser = JSON.parse(localStorage.getItem('currentUser'))
    console.log('current', currentUser.username)
    users.forEach((user) => {
      if (user.username === data.username) {
        user.username = data.new_username;
        console.log('new username', data.new_username, currentUser.username)
        
        if (currentUser.username === data.username) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          console.log('current user', currentUser.username)
          currentUser = user;

          localStorage.setItem('username', currentUser.username)
          console.log('set username to be: ', currentUser.username)
        }
      }
    })
    localStorage.setItem('users', JSON.stringify(users))

    displayUsers(users, currentUser);
  });

  // Get the notification
  var notification = document.getElementById('myNotification')

  // Get the <span> element that closes the notification
  var span = document.getElementsByClassName('close')[0]

  span.onclick = function () {
    notification.style.display = 'none'
  }

  // Get the dismiss button and add a click event handler to close the notification
  var dismissBtn = document.getElementById('dismissBtn')
  dismissBtn.onclick = function () {
    notification.style.display = 'none'
  }

  // Get the view location button and redirect when clicked
  var viewLocationBtn = document.getElementById('viewLocationBtn')
  viewLocationBtn.onclick = function () {
    window.location.href = 'Map.html'
  }

  async function showNotification() {
    var notification = document.getElementById('myNotification')
    notification.style.display = 'block'
    pageNumber = 1
    sender = localStorage.getItem('username')
    receiver = localStorage.getItem('emergency')

    const searchURL = `/search/privateMessage/${'status'}/${pageNumber.toString()}/${sender}/${receiver}`

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
      messages.forEach((message) => {
        renderStatusHistory(message, 'notification', 'myNotification')
      })

      // Assuming `displayMessages` is a function you've defined to update the UI with the fetched messages
    } catch (error) {
      console.error('Failed to fetch:', error.message)
      // Optionally, update the UI to notify the user that the search failed
    }
  }

  socket.on('emergency', function (user) {
    console.log('emergency frontend', user.username)
    console.log('current user primary', currentUser.contact.primary)
    currentUser = JSON.parse(localStorage.getItem('currentUser'))

    if (currentUser.contact.primary.includes(user.username)) {
      localStorage.setItem('emergency', user.username)
      document.querySelector('.notification-header h2').textContent = `${user.username} is in danger!`
      // document.querySelector('.notification-body').textContent = `Status history: ${user.status}`;
      // Show the notification
      showNotification()
    }
  })

  document.getElementById('search-btn').addEventListener('click', async function () {
    const searchInput = document.getElementById('search-input').value.trim()
    const statusDropdown = document.getElementById('status-dropdown')
    const isStatusSearch = document.getElementById('status-search-toggle').checked
    let pageNumber = '0' // You may want to change this dynamically if implementing pagination
    let searchContext = isStatusSearch ? 'status' : 'username'
    let searchValue
    if (isStatusSearch) {
      searchValue = statusDropdown.value
    } else {
      searchValue = searchInput
    }

    // Ensure the input is encoded properly to handle special characters
    const encodedSearchInput = encodeURIComponent(searchValue)
    const searchURL = `/search/${searchContext}/${encodedSearchInput}/${pageNumber}`

    try {
      const response = await fetch(searchURL, {
        method: 'GET', // Explicitly stating the method for clarity
        headers: {
          Accept: 'application/json', // Expecting JSON response
        },
      })

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`)
      }

      const result = await response.json()
      if (result.data.results.length === 0) {
        alert('No results found')
      }

      // Assuming `displayUsers` is a function you've defined to update the UI with the search results
      displayUsers(result.data.results, currentUser) // Removed `currentUser` assuming it's not used here or is globally accessible
    } catch (error) {
      console.error('Failed to fetch:', error.message)
      // Optionally, update the UI to notify the user that the search failed
    }
  })

  document.getElementById('stop-search').addEventListener('click', function () {
    // Clear the search input
    window.location.reload()
  })

  document.getElementById('stop-search-private').addEventListener('click', function () {
    // Clear the search input
    window.location.reload()
  })
  document.getElementById('search-btn-private').addEventListener('click', async function () {
    const searchInput = document.getElementById('search-input-private').value.trim()
    const pageNumber = 1 // Assuming the first page. Adjust as needed.
    const sender = localStorage.getItem('username') // Assuming sender's username is stored in localStorage
    const receiver = localStorage.getItem('receiver') // Adjust according to your application's logic

    // Ensure there's a receiver set before proceeding
    if (!receiver) {
      console.error('Receiver not defined.')
      return
    }

    // Encoding URI components to ensure special characters in the searchInput do not break the URL
    const encodedSearchInput = encodeURIComponent(searchInput)
    const searchURL = `/search/privateMessage/${encodedSearchInput}/${pageNumber.toString()}/${encodeURIComponent(
      sender,
    )}/${encodeURIComponent(receiver)}`

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
      if (messages.length === 0) {
        alert('No results found')
      }
      console.log('any thing' + messages)
      const messagesContainer = document.querySelector('.messages') // Select the messages container

      // Clear existing messages before displaying new ones
      messagesContainer.innerHTML = ''
      console.log('statu ' + messages)
      messages.forEach((message) => {
        if (searchInput === 'status') {
          console.log('going to status history' + message)
          renderStatusHistory(message, 'chat', 'chat-modal')
        } else {
          renderMSG(message)
        }
      })

      // Assuming `displayMessages` is a function you've defined to update the UI with the fetched messages
    } catch (error) {
      console.error('Failed to fetch:', error.message)
      // Optionally, update the UI to notify the user that the search failed
    }
  })

  document.getElementById('speed-test-btn').addEventListener('click', function () {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (currentUser.privilege === 'Administrator') {
      window.location.href = 'SpeedTest.html'
    }
    else {
      alert('You are not authorized to start a speed test')
    }
  })

  document.getElementById('exit-chat').addEventListener('click', function () {
    logout()
  })

  document.getElementById('send-message').addEventListener('click', async function () {
    const messageInput = document.getElementById('chat-message')
    const messageText = messageInput.value.trim()
    const currentTime = new Date().toISOString()

    const username = localStorage.getItem('username')
    const reciever = document.getElementById('chat-username').textContent
    localStorage.setItem('reciever', reciever)
    const currentStatus = await getUserStatus(username)

    if (messageText) {
      // Create the payload
      const data = {
        content: messageText,
        username: username,
        timestamp: currentTime,
        status: currentStatus,
        username: username,
        reciever: reciever,
      }

      // Send the data to the server
      fetch(`/messages/${username}/${reciever}`, {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          messageInput.value = '' // Clear the input after sending
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    } else {
      alert('Please enter a message before posting.')
    }
  })

  document.getElementById('see-more').addEventListener('click', function () {
    fetchMessages() // Call the function to fetch the next page of messages
  })

  document.getElementById('enterDuel').addEventListener('click', function () {
    const username = localStorage.getItem('username')
    registerNewPlayer(username)
  })

  socket.on('alertUpdated', (data) => {
    const roomName = [data.sender, data.receiver].sort().join('_')

    if (currentUser.chatChecked !== undefined && currentUser.chatChecked[roomName] !== undefined) {
      if (data.checked) {
        if (data.sender === currentUser.username) {
          currentUser.chatChecked[roomName] = data.checked
        }
      } else {
        if (data.receiver === currentUser.username) {
          currentUser.chatChecked[roomName] = data.checked
        }
      }
    } else {
      if (currentUser.chatChecked === undefined && data.checked === false) {
        if (data.receiver === currentUser.username) {
          currentUser.chatChecked = {}
          currentUser.chatChecked[roomName] = false
        }
      } else if (currentUser.chatChecked && data.checked === false) {
        if (data.receiver === currentUser.username) {
          currentUser.chatChecked[roomName] = false
        }
      }
    }
    localStorage.setItem('currentUser', JSON.stringify(currentUser))
    displayUsers(users, currentUser)
  })
})

function displayUsers(users, currentUser) {
  const userList = document.getElementById('userList')
  userList.innerHTML = '' // Clear existing list
  sortUsers(users)
  users.forEach((user) => {
    const userElement = createUserElement(user, currentUser)
    addUserAlertIcon(user, currentUser, userElement)
    addUserClickListener(user, userElement)
    userList.appendChild(userElement)
  })
}

function sortUsers(users) {
  users.sort((a, b) => {
    if (a.onlineStatus === b.onlineStatus) {
      return a.username.localeCompare(b.username) // Sort alphabetically if online status is the same
    }
    return b.onlineStatus ? 1 : -1 // Sort by online status, online users first
  })
}

function createUserElement(user, currentUser) {
  const userElement = document.createElement('li')
  userElement.textContent = `${user.username} (${user.status})`
  userElement.classList.add('user', user.onlineStatus ? 'online' : 'offline')
  return userElement
}

function addUserAlertIcon(user, currentUser, userElement) {
  const roomName = [currentUser.username, user.username].sort().join('_')
  if (currentUser.chatChecked && currentUser.chatChecked[roomName] === false) {
    const alertIcon = document.createElement('span')
    alertIcon.textContent = '🚨'
    alertIcon.style.color = 'red'
    alertIcon.style.marginLeft = '5px'
    userElement.appendChild(alertIcon)
  }
}

function userOptionModal(){

}

function addUserClickListener(user, userElement) {
  
  const profileChatModal = document.getElementById('profile-chat-modal');
  userElement.addEventListener('click', () => {
    //openChatModal(user.username)
    profileChatModal.style.display = 'block';
    document.getElementById('profile-option').addEventListener('click', function () {
      let currentUser = JSON.parse(localStorage.getItem('currentUser'))
      console.log(currentUser.privilege)
      if(currentUser.privilege == 'Administrator'){
      localStorage.setItem('selectedUser', JSON.stringify(user))
      // Redirect to the profile page
      window.location.href = 'profile.html';}
      else {
        alert('You are not authorized to view this page')
        profileChatModal.style.display = 'none';
      }
    });
      document.getElementById('private-chat-option').addEventListener('click', function () {
        updateChatStatus(localStorage.getItem('username'), user.username, 'join')
        profileChatModal.style.display = 'none';
        openChatModal(user.username)
      });
    
  })
}

function openChatModal(username) {
  document.getElementById('chat-username').textContent = username

  const receiver = username
  localStorage.setItem('receiver', receiver)
  username = localStorage.getItem('username')
  const roomName = [username, receiver].sort().join('_')
  let currentUser = JSON.parse(localStorage.getItem('currentUser'))
  if (currentUser.chatChecked === undefined) {
    currentUser.chatChecked = {}
  }
  currentUser.chatChecked[roomName] = true
  localStorage.setItem('currentUser', JSON.stringify(currentUser))

  socket.on(roomName, function (msg) {
    console.log('socket listening on', roomName, ' with msg: ', msg.content)

    renderMSG(msg)
  })
  fetch(`/messages/${username}/${receiver}`)
    .then((response) => response.json())
    .then((data) => {
      const messages = data.data.messages
      messages.forEach((message) => {
        renderMSG(message)
      })
    })
    .catch((error) => console.error('Error fetching messages:', error))

  document.getElementById('chat-username').textContent = receiver
  const chatModal = document.getElementById('chat-modal')
  chatModal.style.display = 'block'

  document.getElementById('close-chat').addEventListener('click', function () {
    socket.off(roomName)
    updateChatStatus(localStorage.getItem('username'), receiver, 'leave')
    chatModal.style.display = 'none'
    const messagesContainer = chatModal.querySelector('.messages')
    messagesContainer.innerHTML = ''
  })
}

function renderMSG(message) {
  const chatModal = document.getElementById('chat-modal')
  const msgContainer = chatModal.querySelector('.messages')

  const messageElement = createMessageElement(message)
  msgContainer.appendChild(messageElement)
  scrollToBottom(msgContainer)
}

function createMessageElement(message) {
  const messageElement = document.createElement('div')
  messageElement.classList.add('message')
  messageElement.appendChild(createMessageHeader(message))
  messageElement.appendChild(createMessageBody(message.content))
  return messageElement
}

function createMessageHeader(message) {
  const messageHeader = document.createElement('div')
  messageHeader.classList.add('message-header')

  const senderElement = createSenderElement(message)
  const timestampElement = createTimestampElement(message.timestamp)

  messageHeader.appendChild(senderElement)
  messageHeader.appendChild(timestampElement)
  return messageHeader
}

function createSenderElement(message) {
  const senderElement = document.createElement('span')
  senderElement.classList.add('sender')
  senderElement.textContent = message.username + ' (' + message.status + ')'
  return senderElement
}

function createTimestampElement(timestamp) {
  const formattedTimestamp = new Date(timestamp).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  const timestampElement = document.createElement('span')
  timestampElement.classList.add('timestamp')
  timestampElement.textContent = formattedTimestamp
  return timestampElement
}

function createMessageBody(content) {
  const messageBody = document.createElement('div')
  messageBody.textContent = content
  return messageBody
}

function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight - container.clientHeight
}

function renderStatusHistory(message, mode, containerId) {
  let parentContainer = document.getElementById(containerId)
  let msgContainer

  if (mode === 'chat') {
    msgContainer = parentContainer.querySelector('.messages')
  } else if (mode === 'notification') {
    msgContainer = parentContainer.querySelector('.status-history')
    console.log('msgContainer', msgContainer)
  } else {
    console.error('Invalid mode or containerId provided')
    return
  }

  let messageElement = document.createElement('div')
  messageElement.classList.add('message')

  let formattedTimestamp = new Date(message.date).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  let messageHeader = document.createElement('div')
  messageHeader.classList.add('message-header')

  let senderElement = document.createElement('span')
  senderElement.classList.add('sender')
  senderElement.textContent = message.status + ' (' + formattedTimestamp + ')'

  messageHeader.appendChild(senderElement)

  messageElement.appendChild(messageHeader)

  msgContainer.appendChild(messageElement)

  if (msgContainer.scrollTop !== undefined) {
    msgContainer.scrollTop = msgContainer.scrollHeight - msgContainer.clientHeight
  }
}

function getUserStatus(username) {
  return new Promise((resolve, reject) => {
    fetchStatus(username).then(handleStatusResponse(resolve, reject)).catch(handleStatusError(reject))
  })
}

function fetchStatus(username) {
  return fetch(`/status/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json())
}

function handleStatusResponse(resolve, reject) {
  return (data) => {
    if (data && data.data && data.data.status) {
      console.log('Status got successfully:', data.data.status)
      resolve(data.data.status)
    } else {
      reject(new Error('Invalid data structure'))
    }
  }
}

function handleStatusError(reject) {
  return (error) => {
    console.error('Error getting status:', error)
    reject(error)
  }
}

const shareStatusButton = document.getElementById('share-status')
const statusModal = document.getElementById('status-modal')
const statusOptions = document.getElementsByClassName('status-option')

shareStatusButton.addEventListener('click', function () {
  statusModal.style.display = 'block'
})

for (let i = 0; i < statusOptions.length; i++) {
  statusOptions[i].addEventListener('click', function () {
    const selectedStatus = this.getAttribute('data-status')
    updateUserStatus(selectedStatus)
  })
}

// Add click event listener to close the modal when clicking outside of it
window.addEventListener('click', function (event) {
  if (event.target === statusModal) {
    statusModal.style.display = 'none'
  }
})

const trainExerciseButton = document.getElementById('train-exercise')
trainExerciseButton.addEventListener('click', function () {
  window.location.href = 'TrainExercise.html'
})
function logout() {
  const userId = getUserID()
  const logoutData = createLogoutData(userId)

  postLogoutRequest(logoutData).then(handleLogoutResponse).catch(handleLogoutError).finally(cleanupAfterLogout)
}

function getUserID() {
  return localStorage.getItem('userID')
}

function createLogoutData(userId) {
  return {
    id: userId,
    status: false,
  }
}

function postLogoutRequest(data) {
  return fetch('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((response) => response.json())
}

function handleLogoutResponse(data) {
  console.log('Success:', data)
}

function handleLogoutError(error) {
  console.error('Error:', error)
}

function cleanupAfterLogout() {
  localStorage.removeItem('token')
  window.location.href = '/'
}

function updateUserStatus(status) {
  const username = localStorage.getItem('username')
  fetch(`/status/${username}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: status, timestamp: new Date().toISOString() }),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log('Status updated successfully:', data)
      statusModal.style.display = 'none'
    })
    .catch((error) => {
      console.error('Error updating status:', error)
    })
}

async function updateChatStatus(activeUsername, passiveUsername, joinOrLeave) {
  try {
    // Construct the URL based on the parameters
    const url = `/alert/${activeUsername}/${passiveUsername}/${joinOrLeave}`

    // Make a PUT request to the server
    const response = await fetch(url, {
      method: 'PUT',
    })

    // Check if the request was successful
    if (response.ok) {
      console.log('User chatChecked update successful')
    } else {
      // Handle server errors or unsuccessful requests
      console.error('Failed to update chat status.')
    }
  } catch (error) {
    // Handle errors in the request or in the execution of the function
    console.error('Error updating chat status:', error)
  }
}

function registerNewPlayer(username) {
  fetch(`/players/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // No need to send a body if the username is in the URL
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

// Function to handle user inactivity
function handleUserInactivity(username) {
  // Example action: display a message or modify the UI
  console.log(username + ' is now inactive.');
  logout();
  // Additional logic can be added here, like updating the UI to show the user as inactive
}
