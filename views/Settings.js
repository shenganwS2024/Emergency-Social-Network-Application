function handleButtonClick() {
    const popup = document.getElementById('popup');
    popup.style.display = 'block';
}

async function handleConfirmClick() {
    const contact1 = document.getElementById('contact1').value;
    const contact2 = document.getElementById('contact2').value;
    const address = document.getElementById('address').value;
    const username = localStorage.getItem('username');

    if (contact1 && contact2 && address) {
        // Perform the necessary actions with the submitted data
        console.log('Emergency contacts:', contact1, contact2);
        console.log('Address:', address);

        try {
            const response = await fetch(`/address/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address }),
            });

            data = await response.json();
            if (data.isValid) {
                // If the address is valid, you can display the first prediction or a success message
                alert('Address updated successfully');
                //window.location.href = 'Map.html'
                
            } else {
                alert('Address is invalid or not found');
            }
    
            if (!response.ok) {
                throw new Error('Failed to update address');
            }
    
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating address');
        }

        try {
            const response = await fetch(`/contacts/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contact1, contact2 }),
            });
    
            if (!response.ok) {
                // Handling a 404 response specifically
                if (response.status === 404) {
                    const errorText = await response.text(); // Assuming the server sends back a plain text error message
                    throw new Error(errorText);
                }else if(response.status === 400){
                    const errorText = await response.text(); // Assuming the server sends back a plain text error message
                    throw new Error(errorText);

                } else {
                    // For other types of errors, you might want to handle them differently
                    throw new Error('Failed to update contact');
                }
            }
    
            alert('Contact updated successfully');
        } catch (error) {
            console.error('Error:', error);
    alert(error.message); 
        }
        // Close the pop-up window
        const popup = document.getElementById('popup');
        popup.style.display = 'none';
    } else {
        // Display an error message if any field is empty
        alert('Please fill in all the fields');
    }
}

async function handleCancelButton(){

    document.getElementById('contact1').value = '';
    document.getElementById('contact2').value = '';
    document.getElementById('address').value = '';
    const username = localStorage.getItem('username');
    try {
        const response = await fetch(`/address/${username}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text(); // Assuming the server sends back a plain text error message
            throw new Error(errorText);
        }

        const message = await response.text();
        alert(message); // Display success message from server
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message); // Display error message
    }


    try {
        const response = await fetch(`/contacts/${username}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text(); // Assuming the server sends back a plain text error message
            throw new Error(errorText);
        }

        const message = await response.text();
        alert(message); // Display success message from server
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message); // Display error message
    }

}

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('addContact');
    button.addEventListener('click', handleButtonClick);

    const confirmButton = document.getElementById('confirmButton');
    confirmButton.addEventListener('click', handleConfirmClick);

    const cancelButton = document.getElementById('clearButton');
    cancelButton.addEventListener('click', handleCancelButton);
    });
