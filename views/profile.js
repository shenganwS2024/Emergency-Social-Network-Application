const socket = io('http://localhost:3000', {
        query: {
          token: localStorage.getItem('token'),
        },
      })
      document.querySelector('button[type="submit"]').style.display = 'none'
      let bannedUsernames = []
      let users = JSON.parse(localStorage.getItem('users'))
      let username
      let newUsername
      let password
      let privilege
      let activeness

      async function fetchBannedUsernames() {
        try {
          const response = await fetch('./bannedUsernames.json')
          const data = await response.json()
          bannedUsernames = data.reservedUsernames.map((username) => username.toLowerCase())
        } catch (error) {
          console.error('Error loading JSON file:', error)
          alert('Failed to load banned usernames. Update might not validate correctly.')
        }
      }

      function loadUserData() {
        const userJson = localStorage.getItem('selectedUser')
        if (userJson) {
          try {
            const user = JSON.parse(userJson)
            updateDisplay(user)
          } catch (e) {
            console.error('Error parsing user data:', e)
          }
        } else {
          console.log('No user data available.')
        }
      }

      function updateDisplay(user) {
        document.getElementById('username').textContent = user.username || 'No username'
        document.getElementById('privilege').textContent = user.privilege || 'No privilege'
        document.getElementById('activeness').textContent = user.activeness
        document.getElementById('privilegeInput').value = user.privilege || 'Citizen'
        document.getElementById('activenessInput').value = user.activeness.toString() || 'Active'
      }

      document.querySelector('.validate-btn').addEventListener('click', async function (event) {
        username = document.getElementById('username').textContent
        newUsername = document.getElementById('newUsernameInput').value.trim()
        password = document.getElementById('passwordInput').value
        privilege = document.getElementById('privilegeInput').value
        activeness = document.getElementById('activenessInput').value
        activeness = activeness === 'true' // Convert to boolean
        event.preventDefault() // Prevent form from submitting normally
        await fetchBannedUsernames() // Ensure the latest banned list is loaded
        console.log('Validating user profile changes...')

        let errors = []
        if ((newUsername.length < 3 || bannedUsernames.includes(newUsername.toLowerCase())) && newUsername) {
          errors.push('Invalid username. It must be at least 3 characters long and not a banned username.')
        } else if (users.some((user) => user.username.toLowerCase() === newUsername.toLowerCase())) {
          errors.push('This username is already in use. Please choose a different username.')
        }
        if (password.length < 4 && password) {
          errors.push('Password must be at least 4 characters long.')
        }
        if (errors.length > 0) {
          errors.push('Please re-enter and try again.')
          alert(errors.join('\n'))
          document.getElementById('newUsernameInput').value = ''
          document.getElementById('passwordInput').value = ''
        } else {
          const confirmation = confirm('Validation successful. Click submit to confirm changes.')
          if (confirmation) {
            document.querySelector('button[type="submit"]').style.display = 'block' // Show the submit button
            document.querySelector('.validate-btn').style.display = 'none' // Hide the validate button
          }
        }
      })

      document.querySelector('.submit-btn').addEventListener('click', async function (event) {
        event.preventDefault();
        const data = {
          new_username: newUsername || undefined,
          password: password || undefined,
          activeness: activeness,
          privilege: privilege || undefined,
        }

        try {
          const response = await fetch(`/users/profile/${username}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
          if (response.ok) {
            const user = {
              username: newUsername || username, // Fallback to old username if not changed
              privilege: privilege,
              activeness: activeness,
            }
            localStorage.setItem('selectedUser', JSON.stringify(user)) // Update local storage
            //rename the updated user in the users variable
            users = users.map((user) => {
              if (user.username === username) {
                return {
                  username: newUsername || username,
                  privilege: privilege,
                  activeness: activeness,
                }
              }
              return user
            })
            localStorage.setItem('users', JSON.stringify(users)) // Update local storage
            updateDisplay(user) // Update display without reloading
            alert('User profile update successful')
            document.querySelector('.submit-btn').style.display = 'none' 
            document.querySelector('.validate-btn').style.display = 'block' 
          } else {
            const result = await response.text()
            alert(result) // Display error message
          }
        } catch (error) {
          console.error('Error updating user profile:', error)
          alert('Failed to update user profile.', error)
        }
      })

      window.onload = loadUserData // Call loadUserData when the page is loaded to fill in the current user details