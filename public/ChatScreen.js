
const socket = io();
const app = document.querySelector(".app");


socket.on('chat message', function(msg) {

    renderMSG(msg);
})

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

// Handle user logout
document.getElementById("exit-chat").addEventListener("click", () => {
    // URL of the server endpoint that handles the status change
    logout();
    // Assuming the user's ID or some form of identification is needed
});

document.addEventListener('DOMContentLoaded', function() {
    // Assuming you have a way to get the current user's username
    const username = localStorage.getItem('username'); 

    document.getElementById('send-msg').addEventListener('click', function() {
        const messageInput = document.getElementById('message-input');
        const messageText = messageInput.value.trim();
        const currentTime = new Date().toISOString();

        if (messageText) {
            // Create the payload
            const data = {
                content: messageText,
                username: username,
                timestamp: currentTime,
                status:"placeholder"
            };
            console.log(data);

            // Send the data to the server
            fetch('/messages', {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                messageInput.value = ''; // Clear the input after sending
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        } else {
            alert("Please enter a message before posting.");
        }
    });
});


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

function logout() {
    const userId = localStorage.getItem('userID'); // Implement this function based on your app's logic

    // Data to be sent in the request
    const data = {
        id: userId,
        status: false
    };

    // Send a POST request to the server
    fetch("/logout", {
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
            //socket.emit("exituser");
            // Remove the token from localStorage
            localStorage.removeItem('token');

            // Optionally, redirect the user to the login page or home page
            window.location.href = 'index.html';
        });
}
