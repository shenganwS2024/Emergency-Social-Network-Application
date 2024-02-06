let bannedUsernames = ""
fetch('./bannedUsernames.json')
  .then(response => response.json())
  .then(data => {
    bannedUsernames = data.reservedUsernames;
    // Use the bannedUsernames array as needed
  })
  .catch(error => console.error('Error loading JSON file:', error));
//console.log(bannedUsernames)

showPage('home-page')

document.getElementById('joinBtn').addEventListener('click', function() {
    showPage('registration-form');
});

document.getElementById('notConfirmBtn').addEventListener('click', function() {
  document.getElementById('username').value='';
  document.getElementById('password').value='';
  showPage('registration-form');
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let username = document.getElementById('username').value.trim();
    let password = document.getElementById('password').value.trim();


    // * Username Rule: Usernames are provided by users and should be at least 3 characters long. They should not be in the list of banned usernames. They should not already exist. Usernames are NOT case sensitive. 
    // * Password Rule: Passwords are provided by users and should be at least 4 characters long. Passwords ARE case sensitive.
    if(validateUserInfo(username, password)){

        fetch('/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          })
            .then(async (response) => {
              if (response.status === 200) {
                // if Both username and password is correct, do nothing
              }else if (response.status ===201){
                // if the username doesn't exist, creat new user and show confirmation page
                showPage('confirmation-page');

              }
              else if (response.status === 409) {
                alert('Conflict: Username already exists and password is incorrect. Please re-enter');
                document.getElementById('username').value='';
                document.getElementById('password').value='';
              }
              else {
                const errorText = await response.text()
                alert(errorText)
              }
            })
            .catch(error => {
        // send to server and check if exist
    })
  }
})


document.getElementById('confirmBtn').addEventListener('click', function() {
    // Save user data here
    showPage('welcome-page');
});

document.getElementById('acknowledgeBtn').addEventListener('click', function() {
    showPage('home-page');
});

function showPage(pageId) {
    document.querySelectorAll('section').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');
}

function validateUserInfo (username, password) {
    username = username.toLowerCase();
    if (username.length<3 || bannedUsernames.includes(username)){
        alert("Username should be at least 3 characters and not banned ")
        return false;

    }else if(password.length<4){
        alert("Password should be at least 4 characters long");
        return false;
        
    } else{
        return true;
    }
}
