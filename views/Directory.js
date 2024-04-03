
      let pageNumber = 1
      async function fetchMessages() {
        const searchInput = document.getElementById('search-input-private').value.trim()
        // Assuming the first page. Adjust as needed.
        ++pageNumber
        // Encoding URI components to ensure special characters in the searchInput do not break the URL
        const encodedSearchInput = encodeURIComponent(searchInput)

        const sender = localStorage.getItem('username') // Assuming sender's username is stored in localStorage
        const receiver = localStorage.getItem('receiver') // Adjust according to your application's logic
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
          messages.forEach((message) => {
            renderMSG(message)
          })
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
            if(result.data.results.length === 0) {
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
            if(messages.length === 0) {
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
                renderStatusHistory(message)
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
          window.location.href = 'SpeedTest.html'
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

        // Sort users first by online status (online users first), then alphabetically
        users.sort((a, b) => {
          if (a.onlineStatus === b.onlineStatus) {
            return a.username.localeCompare(b.username) // Sort alphabetically if online status is the same
          }
          return b.onlineStatus ? 1 : -1 // Sort by online status, online users first
        })

        users.forEach((user) => {
          const userElement = document.createElement('li')
          userElement.textContent = `${user.username} (${user.status})`
          userElement.classList.add('user', user.onlineStatus ? 'online' : 'offline')
          const roomName = [currentUser.username, user.username].sort().join('_')
          const alertIcon = document.createElement('span') // Use an appropriate icon or emoji

          if (
            currentUser.chatChecked &&
            currentUser.chatChecked[roomName] !== undefined &&
            !currentUser.chatChecked[roomName]
          ) {
            alertIcon.textContent = '🚨' // Example using an emoji
            alertIcon.style.color = 'red' // Style as needed
            alertIcon.style.marginLeft = '5px' // Add some space between the username and the alert icon
            userElement.appendChild(alertIcon)
          }

          // if(user.chatChecked && user.chatChecked.has(roomName) && !user.chatChecked.get(roomName)) {
          //   // This means there's an unchecked message for the current user from this user
          //   const alertIcon = document.createElement('span'); // Use an appropriate icon or emoji
          //   alertIcon.textContent = '🚨'; // Example using an emoji
          //   alertIcon.style.color = 'red'; // Style as needed
          //   alertIcon.style.marginLeft = '5px'; // Add some space between the username and the alert icon
          //   userElement.appendChild(alertIcon);
          // }

          // Add click event listener to each user for opening the chat modal
          userElement.addEventListener('click', function () {
            updateChatStatus(localStorage.getItem('username'), user.username, 'join')

            openChatModal(user.username)
          })

          userList.appendChild(userElement)
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

        // Placeholder for loading message history
        // Implement fetching message history here and display in #message-container

        document.getElementById('close-chat').addEventListener('click', function () {
          socket.off(roomName)
          updateChatStatus(localStorage.getItem('username'), receiver, 'leave')
          chatModal.style.display = 'none'
          const messagesContainer = chatModal.querySelector('.messages')
          messagesContainer.innerHTML = '' // This line clears the chat messages
        })

        // document.getElementById('send-message').addEventListener('click', function() {
        //     // Implement sending message functionality here
        // });
      }

      function renderMSG(message) {
        let chatModal = document.getElementById('chat-modal') // Ensure this ID matches your chat modal
        let msgContainer = chatModal.querySelector('.messages') // Select the messages container within the chat modal

        let messageElement = document.createElement('div')
        messageElement.classList.add('message')

        // Format the timestamp
        let formattedTimestamp = new Date(message.timestamp).toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })

        // Construct the message header
        let messageHeader = document.createElement('div')
        messageHeader.classList.add('message-header')

        let senderElement = document.createElement('span')
        senderElement.classList.add('sender')
        senderElement.textContent = message.username + ' (' + message.status + ')'

        let timestampElement = document.createElement('span')
        timestampElement.classList.add('timestamp')
        timestampElement.textContent = formattedTimestamp

        // Append sender and status to the header
        messageHeader.appendChild(senderElement)
        // messageHeader.appendChild(statusElement);
        messageHeader.appendChild(timestampElement)

        // Construct the message body
        let messageBody = document.createElement('div')
        messageBody.textContent = message.content

        // Append the header and body to the message element
        messageElement.appendChild(messageHeader)
        messageElement.appendChild(messageBody)

        // Append the message element to the container
        msgContainer.appendChild(messageElement)

        // Ensure the container scrolls to show the newest message
        msgContainer.scrollTop = msgContainer.scrollHeight - msgContainer.clientHeight
      }

      function renderStatusHistory(message) {
        let chatModal = document.getElementById('chat-modal') // Ensure this ID matches your chat modal
        let msgContainer = chatModal.querySelector('.messages') // Select the messages container within the chat modal

        let messageElement = document.createElement('div')
        messageElement.classList.add('message')

        // Format the timestamp
        let formattedTimestamp = new Date(message.date).toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })

        // Construct the message header
        let messageHeader = document.createElement('div')
        messageHeader.classList.add('message-header')

        let senderElement = document.createElement('span')
        senderElement.classList.add('sender')
        senderElement.textContent = message.status + ' (' + formattedTimestamp + ')'

        // Append sender and status to the header
        messageHeader.appendChild(senderElement)

        // Append the header and body to the message element
        messageElement.appendChild(messageHeader)

        // Append the message element to the container
        msgContainer.appendChild(messageElement)

        // Ensure the container scrolls to show the newest message
        msgContainer.scrollTop = msgContainer.scrollHeight - msgContainer.clientHeight
      }
      ;``

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
            localStorage.removeItem('token')

            // Optionally, redirect the user to the login page or home page
            window.location.href = '/'
          })
        //window.location.href = '/'
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

            // Depending on the action, emit the respective event
            // if (joinOrLeave === 'join') {
            //     socket.emit('joinPrivateRoom', { username: activeUsername, roomName: `${[activeUsername, passiveUsername].sort().join('_')}` });
            // } else if (joinOrLeave === 'leave') {
            //     socket.emit('leavePrivateRoom', { username: activeUsername, roomName: `${[activeUsername, passiveUsername].sort().join('_')}` });
            // }
          } else {
            // Handle server errors or unsuccessful requests
            console.error('Failed to update chat status.')
          }
        } catch (error) {
          // Handle errors in the request or in the execution of the function
          console.error('Error updating chat status:', error)
        }
      }
  