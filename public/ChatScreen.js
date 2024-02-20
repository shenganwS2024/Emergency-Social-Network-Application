const app = document.querySelector(".app");
//const socket = io();

document.getElementById('directory-button').addEventListener('click', function() {
    window.location.href = 'ESN%20Directory.html';
});

        // get the user and message data from the server
        //const users = JSON.parse(localStorage.getItem('users'));
        const messages = JSON.parse(localStorage.getItem('messages'));
        messages.forEach((message) => {
            // Render message based on whether its mine or others' 
            console.log("rendering messages");
            renderMSG(message);
        })
    
//         function toggleDirectory() {
//     const directory = document.getElementById('userDirectory');
//     if (directory.style.display === 'none' || directory.style.display === '') {
//         directory.style.display = 'block';
//         populateUsers(); // Populate user list when showing the directory
//     } else {
//         directory.style.display = 'none';
//     }
// }
    
        // function populateUsers() {
        //     const directory = document.getElementById('userDirectory');
        //     directory.innerHTML = ''; // Clear existing content
    
        //     // Sort users first by online status, then alphabetically
        //     users.sort((a, b) => {
        //         if (a.online === b.online) {
        //             return a.name.localeCompare(b.name); // Alphabetically
        //         }
        //         return a.online ? -1 : 1; // Online users first
        //     });
    
        //     users.forEach(user => {
        //         const userElement = document.createElement('div');
        //         userElement.classList.add('user');
        //         userElement.innerHTML = `${user.name} <span class="${user.online ? 'online' : 'offline'}">${user.online ? 'Online' : 'Offline'}</span>`;
        //         directory.appendChild(userElement);
        //     });
        // }
   
        // Handle user logout
document.getElementById("exit-chat").addEventListener("click", () => {
// URL of the server endpoint that handles the status change
const url = 'logout';

  // Assuming the user's ID or some form of identification is needed
  const userId = localStorage.getItem('userID') // Implement this function based on your app's logic

  // Data to be sent in the request
  const data = {
    id: userId,
    status: false
  };

  // Send a POST request to the server
  fetch(url, {
    method: 'POST', // or 'PUT' if updating the status
    headers: {
      'Content-Type': 'application/json',
      // Add any other headers your server requires, such as authentication tokens
    },
    body: JSON.stringify(data) // Convert the JavaScript object to a JSON string
  })
  .then(response => response.json()) // Parse the JSON response
  .then(data => {
    console.log('Success:', data);
    // Here you can also trigger any additional logout logic, like redirecting the user
  })
  .catch((error) => {
    console.error('Error:', error);
  })
  .finally(() => {
    socket.emit("exituser");
    // Remove the token from localStorage
    localStorage.removeItem('token');

    // Optionally, redirect the user to the login page or home page
    window.location.href = 'index.html';  
  });
       
        })


        function renderMSG(message) {
            console.log("before container");
            let msgContainer = app.querySelector(".chatroom .messages");
            let senderName = message.username;
            console.log("after container");
          
            let element = document.createElement("div")
            element.setAttribute("class", "message")
            // Adjust the format so the timestamp matches the demo
            element.innerHTML = `
                <div>
                <div class ="messageContainer">
                    <div class ="name">${senderName}</div>
                    <div id="time">${new Date(message.timestamp).toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).replace(/\//g, '.').replace(', ', ' ').replace(' AM', 'AM').replace(' PM', 'PM')
                }</div>
                    </div>
                    <div class = "text">${message.content}</div>
                </div>
                `;
                console.log("before appending");
            msgContainer.appendChild(element);
            console.log("after appending");
            // Ensures that the container scrolls to the bottom to show newest message 
            msgContainer.scrollTop = msgContainer.scrollHeight - msgContainer.clientHeight;
          }