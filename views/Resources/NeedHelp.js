const socket = io('https://s24esnb2.onrender.com', {
  query: {
    token: localStorage.getItem('token'),
  },
});

function validateType() {
  const resourceTypeRadios = document.querySelectorAll('input[name="resourceType"]');
  const isTypeSelected = Array.from(resourceTypeRadios).some(radio => radio.checked);
  
  if (!isTypeSelected) {
    document.getElementById('type-error').textContent = 'Please select a resource type';
    document.getElementById('type-error').style.display = 'block';
    return false;
  } else {
    document.getElementById('type-error').style.display = 'none';
  }
  return true;
}

function validateQuantity(quantity) {
  if (quantity <= 0 || isNaN(quantity)) {
    document.getElementById('quantity-error').textContent = 'Quantity must be greater than 0';
    document.getElementById('quantity-error').style.display = 'block';
    return false;
  } else {
    document.getElementById('quantity-error').style.display = 'none';
  }
  return true;
}

function validateUrgency() {
  if (!selectedUrgencyLevel) {
    document.getElementById('urgency-error').textContent = 'Please select an urgency level';
    document.getElementById('urgency-error').style.display = 'block';
    return false;
  } else {
    document.getElementById('urgency-error').style.display = 'none'; 
  }
  return true;
}

function appendOfferHistory(notification) {
  const template = document.getElementById('offer-history-item-template').content.cloneNode(true);

  // Update the text content correctly
  const offerHistoryItem = template.querySelector('.offer-history-item');
    offerHistoryItem.textContent = `You received ${notification.offeredQuantity} of ${notification.resourceType} resource from ${notification.senderUsername} `;
    offerHistoryItem.style.paddingLeft = '10px';
    
    // Set the notification ID as an attribute
    offerHistoryItem.setAttribute('notification-id', notification._id);

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-btn';
  deleteButton.innerHTML = '<span class="text">Delete</span><span class="icon">' +
                           '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' +
                           '<path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path>' +
                           '</svg></span>';
  deleteButton.onclick = () => userDeleteNotification(notification._id, offerHistoryItem);

    offerHistoryItem.appendChild(deleteButton);
  
  document.querySelector('.offer-history').appendChild(template);
}


async function fetchNotifications() {
  try {
    const username = localStorage.getItem('username');
    const response = await fetch(`/notifications/${username}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    const notifications = await response.json();

    notifications.forEach(notification => appendOfferHistory(notification));
  }
  catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
}

document.addEventListener('DOMContentLoaded', fetchNotifications);

socket.on('resourceOfferNotification', (notification) => {
  appendOfferHistory(notification);
});

function goBack() {
  window.history.back();
}

function toggleForm() {
  var form = document.getElementById('reportForm');
  form.classList.toggle('active');
}

let selectedUrgencyLevel = '';

document.addEventListener('DOMContentLoaded', () => {
  initializeForm();
  document.getElementById('submit-btn').addEventListener('click', submitResourceNeed);
  setupOtherResourceInput();
});

function initializeForm() {
  setupUrgencyButtons();
}

function setupUrgencyButtons() {
  const urgencyButtons = document.querySelectorAll('.button.urgency');

  urgencyButtons.forEach(button => {
    button.addEventListener('click', function() {
      urgencyButtons.forEach(btn => btn.classList.remove('greyed-out'));
      urgencyButtons.forEach(btn => {
        if (btn !== this) {
          btn.classList.add('greyed-out');
        } else {
          selectedUrgencyLevel = btn.textContent;
        }
      });
    });
  });
}

function setupOtherResourceInput() {
  const resourceTypeRadios = document.querySelectorAll('input[name="resourceType"]');
  const otherResourceInput = document.getElementById('otherResource');

  hideOrShowOtherInput(resourceTypeRadios, otherResourceInput);

  resourceTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => hideOrShowOtherInput(resourceTypeRadios, otherResourceInput));
  });
}

function hideOrShowOtherInput(radios, otherInput) {
  const isOtherSelected = Array.from(radios).some(radio => radio.value === "Other" && radio.checked);

  if (isOtherSelected) {
    otherInput.style.display = 'block';
  } else {
    otherInput.style.display = 'none';
  }
}

async function submitResourceNeed() {
  const form = document.getElementById('resourceForm');
  const formData = new FormData(form);
  formData.append('urgencyLevel', selectedUrgencyLevel);

  if (!validateType() 
    || !validateQuantity(parseInt(formData.get('quantity'), 10)) 
    || !validateUrgency()) {
      return;
  }

  const formObject = Object.fromEntries(formData.entries());
  formObject.urgencyLevel = selectedUrgencyLevel;
  console.log('Form data:', formObject);
  const userId = localStorage.getItem('userID');
  formObject.userId = userId;
  const isOtherSelected = Array.from(document.querySelectorAll('input[name="resourceType"]')).some(radio => radio.value === "Other" && radio.checked);
  if (isOtherSelected) {
    formObject.otherResourceType = document.getElementById('otherResource').value;
  }

  try {
    const response = await fetch('/resourceNeeds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formObject),
    });

    if (response.ok) {
      alert('Resource need submitted successfully');
      clearForm(); 
      toggleForm();
    } else {
      const data = await response.json();
      alert('Error submitting form: ' + data.errors.join(', '));
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
}

async function userDeleteNotification(notificationId, offerHistoryItem) {
  try {
    const response = await fetch(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
    // Remove the specific notification item from the DOM
    offerHistoryItem.remove();
  } catch (error) {
    console.error('Failed to delete notification:', error);
  }
}

function clearForm() {
  document.getElementById('resourceForm').reset();
  selectedUrgencyLevel = '';
  document.querySelectorAll('.button.urgency').forEach(btn => btn.classList.remove('greyed-out'));
}
