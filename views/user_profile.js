const socket = io('https://s24esnb2.onrender.com', {
  query: {
    token: localStorage.getItem('token'),
  },
});

document.querySelector('button[type="submit"]').style.display = 'none';
let bannedUsernames = [];
let users = JSON.parse(localStorage.getItem('users'));
let username;
let newUsername;
let password;
let privilege;
let activeness;

async function fetchBannedUsernames() {
  try {
    const response = await fetch('./bannedUsernames.json');
    const data = await response.json();
    bannedUsernames = data.reservedUsernames.map((username) => username.toLowerCase());
  } catch (error) {
    console.error('Error loading JSON file:', error);
    alert('Failed to load banned usernames. Update might not validate correctly.');
  }
}

function loadUserData() {
  const userJson = localStorage.getItem('selectedUser');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      updateDisplay(user);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  } else {
    console.log('No user data available.');
  }
}

function updateDisplay(user) {
  document.getElementById('username').textContent = user.username || 'No username';
  document.getElementById('privilege').textContent = user.privilege || 'No privilege';
  document.getElementById('activeness').textContent = user.activeness;
  document.getElementById('privilegeInput').value = user.privilege || 'Citizen';
  document.getElementById('activenessInput').value = user.activeness.toString() || 'Active';
}

document.querySelector('.validate-btn').addEventListener('click', async function (event) {
  // Event handling and user data validation logic
});

document.querySelector('.submit-btn').addEventListener('click', async function (event) {
  // Event handling and user data submission logic
});

window.onload = loadUserData; // Call loadUserData when the page is loaded to fill in the current user details
