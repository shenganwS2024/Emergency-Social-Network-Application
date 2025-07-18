const abortController = new AbortController()
      const { signal } = abortController
      const socket = io('https://s24esnb2.onrender.com/', {
        query: {
          token: localStorage.getItem('token'),
        },
      })

      const resultsDiv = document.getElementById('testResults')
      const postResultP = document.getElementById('postResult')
      const getResultP = document.getElementById('getResult')
      const durationInput = document.getElementById('duration')
      const intervalInput = document.getElementById('interval')

      document.getElementById('startTest').addEventListener('click', function () {
        resultsDiv.style.display = 'block'
        postResultP.innerText = 'Speed Test Ongoing, Please Wait...'
        getResultP.innerText = '' // Clear this so it doesn't display an outdated status.
        const duration = parseInt(document.getElementById('duration').value, 10)
        const interval = parseInt(document.getElementById('interval').value, 10)

        if (isNaN(duration) || isNaN(interval) || duration <= 0 || interval < 0) {
          alert('Please enter valid duration and interval values.')
          return
        }

        resultsDiv.style.display = 'block'
        postResultP.innerText = 'Speed Test Ongoing, Please Wait...'
        getResultP.innerText = ''

        let postCount = 0
        let getCount = 0

        let isSpeedTestMode = true

        const body = {
          isSpeedTestMode: isSpeedTestMode,
          username: localStorage.getItem('username'),
        }
        let postInterval = null
        let getInterval = null

        const maxPostCount = 1000 // Set the maximum number of posts
        fetch(`speedTest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })
          .then((response) => response.json())
          .then((data) => {
            // This code runs only after the first fetch and all its related async operations are complete
            console.log('First fetch success:', data)

            parseInt(document.getElementById('duration').value, '')
            parseInt(document.getElementById('interval').value, '')
            const startTime = Date.now()
            const senderName = 'Admin' // Placeholder sender name
            const receiverName = 'public' // Use 'public' to denote public messages

            let endTime = startTime + duration * 1000

            // let postCount = 0
            let getCount = 0

            function updateResults() {
              postResultP.innerText = `POST Performance: ${postCount / duration} requests/second`
              getResultP.innerText = `GET Performance: ${getCount / duration} requests/second`
            }

            // Updated function to send POST requests
            function sendPostRequest() {
              const currentTime = Date.now()

              // Check if current time has exceeded endTime by more than 5 seconds
              if (currentTime > endTime + 5000) {
                alert('The test duration has exceeded the specified limit by 5 seconds. The test will now stop.')
                stopTest() // Assumes stopTest is a function that stops intervals and handles cleanup
                return // Exit the function to prevent further execution
              }

              if (postCount >= maxPostCount) {
                alert('Maximum post count reached. Stopping the test.')
                stopTest()
                document.getElementById('exitTest').click()
                return // Exit the function
              }
              const messageData = {
                username: senderName,
                content: 'Testmessage111111111',
                timestamp: new Date().toISOString(),
                status: 'sent', // Example status
              }
              const postUrl = `/messages/${senderName}/${receiverName}`

              fetch(postUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
              })
                .then((response) => response.json())
                .then((data) => {
                  console.log('Success:', data)
                  postCount++
                })
                .catch((error) => console.error('Error:', error))
            }

            // Updated function to send GET requests
            function sendGetRequest() {
              const currentTime = Date.now()

              // Check if current time has exceeded endTime by more than 5 seconds
              if (currentTime > endTime + 5000) {
                alert('The test duration has exceeded the specified limit by 5 seconds. The test will now stop.')
                stopTest() // Assumes stopTest is a function that stops intervals and handles cleanup
                return // Exit the function to prevent further execution
              }

              const getUrl = `/messages/${senderName}/${receiverName}`

              fetch(getUrl)
                .then((response) => response.json())
                .then((data) => {
                  console.log('Messages:', data.data.messages)
                  getCount++
                })
                .catch((error) => console.error('Error:', error))
            }

            postInterval = setInterval(() => {
              if (Date.now() >= endTime) {
                clearInterval(postInterval)
                // Start GET requests after POST requests are completed
                getInterval = setInterval(() => {
                  if (Date.now() >= endTime + duration * 1000) {
                    clearInterval(getInterval)
                    document.getElementById('testResults').style.display = 'block'
                    updateResults()
                  } else {
                    sendGetRequest()
                  }
                }, interval)
              } else {
                sendPostRequest()
              }
            }, interval)
          })
          .catch((error) => {
            console.error('Error:', error)
          })

        async function stopTest() {
          if (postInterval) clearInterval(postInterval)
          if (getInterval) clearInterval(getInterval)
          abortController.abort()
          resultsDiv.style.display = 'block' // Ensure the results div is visible
          postResultP.innerText = 'Test Stopped'
          getResultP.innerText = '' // Clear the GET result text

          let isSpeedTestMode = false

          const body = {
            isSpeedTestMode: isSpeedTestMode,
          }

          try {
            await fetch(`speedTest`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
            })
          } catch (error) {
            console.error('Error:', error)
          }
        }
        document.getElementById('stopTest').addEventListener('click', stopTest)
      })

      document.getElementById('exitTest').addEventListener('click', async function () {
        let isSpeedTestMode = false

        const body = {
          isSpeedTestMode: isSpeedTestMode,
        }

        try {
          await fetch(`speedTest`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })

          // Delay the redirection to give time for the socket to disconnect
          setTimeout(() => {
            window.location.href = 'ESN Directory.html'
          }, 500)
        } catch (error) {
          console.error('Error:', error)
        }
      })