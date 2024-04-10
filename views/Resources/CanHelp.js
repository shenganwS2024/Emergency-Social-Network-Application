const socket = io('http://localhost:3000/', {
    query: {
        token: localStorage.getItem('token'),
    },
});

socket.on('newNeed', () => {
    location.reload();
    document.addEventListener('DOMContentLoaded', fetchNeeds);
});

function goBack() {
    window.history.back();
}

function toggleOfferInput(buttonElement) {
    const offerSection = buttonElement.nextElementSibling;
    offerSection.style.display = offerSection.style.display === 'none' ? 'block' : 'none';
}

function validateOfferedQuantity(offeredQuantity, needItemElement) {
    const quantityErrorElement = needItemElement.querySelector('.quantity-error'); // Use class selector

    if (offeredQuantity < 1 
        || isNaN(offeredQuantity) 
        || offeredQuantity > parseInt(needItemElement.querySelector('.quantity').textContent, 10)) {
        quantityErrorElement.textContent = 'Quantity must >= 0 or <= the quantity needed';
        quantityErrorElement.style.display = 'block';
        return false;
    } else {
        quantityErrorElement.style.display = 'none'; // Hide the error message if validation passes
        return true;
    }
}


async function offerResource(buttonElement) {
    const offerSection = buttonElement.parentElement;
    const needItemElement = offerSection.closest('.need-item');
    const needId = needItemElement.getAttribute('data-need-id');
    const quantityInput = offerSection.querySelector('.offer-quantity');
    const offeredQuantity = parseInt(quantityInput.value, 10);
    const sender = localStorage.getItem('username');

    if (!validateOfferedQuantity(offeredQuantity, needItemElement)) {
        return;
    }

    try {
        const response = await fetch(`/resourceNeeds/${needId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ offeredQuantity, sender }),
        });

        if (!response.ok) throw new Error('Failed to submit offer');

        const result = await response.json();
        console.log('Offer submitted and quantity updated', result);

        offerSection.style.display = 'none';

        const progressElement = needItemElement.querySelector('.progress');
        const newProgress = result.resourceNeed.progress;
        progressElement.style.width = `${newProgress}%`;

        const quantityRemaining = result.resourceNeed.totalQuantityNeeded - result.resourceNeed.quantityFulfilled;
        needItemElement.querySelector('.quantity').textContent = quantityRemaining;
    } catch (error) {
        console.error('Error submitting offer:', error);
    }
}

function disableOfferButton(newNeedCard) {
    const offerButton = newNeedCard.querySelector('.offer-button');
    offerButton.disabled = true;
    offerButton.style.backgroundColor = 'grey';
    offerButton.textContent = 'Thanks! This need has been fulfilled.';
}

function createAndAppendNeedCard(needData) {
    if (document.querySelector(`[data-need-id="${needData._id}"]`)) {
        return;
    }

    let template = document.getElementById('needCardTemplate');
    let newNeedCard = template.content.cloneNode(true);

    newNeedCard.querySelector('.need-item').setAttribute('data-need-id', needData._id);
    newNeedCard.querySelector('.initiator').textContent = needData.username;
    newNeedCard.querySelector('.type').textContent = needData.resourceType === 'Other' ? needData.otherResourceType : needData.resourceType; 
    newNeedCard.querySelector('.quantity').textContent = needData.quantity;
    newNeedCard.querySelector('.emergency-level').textContent = needData.urgencyLevel;

    let progressPercentage = needData.quantityFulfilled / needData.totalQuantityNeeded * 100;
    newNeedCard.querySelector('.progress').style.width = `${progressPercentage}%`;

    if (progressPercentage === 100) {
        disableOfferButton(newNeedCard);
    }

    document.querySelector('.needs-list-container').appendChild(newNeedCard);
}

function sortNeedsByUrgency(needsList) {
    const urgencyToNumber = (urgencyLevel) => {
        switch (urgencyLevel) {
            case 'High': return 3;
            case 'Medium': return 2;
            case 'Low': return 1;
            default: return 0;
        }
    };

    return needsList.sort((a, b) => {
        // Check if either or both have 100% progress and sort 
        if (a.progress === 100 && b.progress !== 100) {
            return 1; // a is 100%, so it goes to the end
        } else if (b.progress === 100 && a.progress !== 100) {
            return -1; // b is 100%, so a comes first
        }

        // If both or neither are 100%, we sort by urgency first
        if (urgencyToNumber(a.urgencyLevel) === urgencyToNumber(b.urgencyLevel)) {
            // If urgency levels are equal, sort by progress ascending
            return a.progress - b.progress;
        } else {
            // Sort by urgency level descending (High > Medium > Low)
            return urgencyToNumber(b.urgencyLevel) - urgencyToNumber(a.urgencyLevel);
        }
    });
}

async function fetchNeeds() {
    try {
        const response = await fetch('/resourceNeeds', {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const needs = await response.json();
        let needsList = Array.from(needs.data.resourceNeeds);

        needsList = sortNeedsByUrgency(needsList);

        if (Array.isArray(needsList)) {
            needsList.forEach(need => {
                createAndAppendNeedCard(need);
            });
        } else {
            console.error("Needs is not an array");
        }
    } catch (error) {
        console.error("Could not fetch needs:", error);
    }
}

document.addEventListener('DOMContentLoaded', fetchNeeds);
