
document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');

    const socket = io('http://localhost:3000', {
      query: {
        token: localStorage.getItem('token'),
      },
    })
    
    document.getElementById('exitButton').addEventListener('click', async function() {
        await deletePlayer(username);
        // Assuming deletePlayer resolves after completion and handles its own errors
        window.location.href = 'ESN Directory.html';
    });
    

    renderOnlinePlayers()
    renderOngoingDuels()

    socket.on('onlinePlayersUpdated', function () {
        renderOnlinePlayers()
    })

    socket.on('ongoingDuelsUpdated', function () {
        renderOngoingDuels()
    })

    const channelName = username + "receivesAChallenge"

    socket.on(channelName, function (challenger) {
        
        renderChallengeLetter(challenger.challenger, username)
        const exitButton = document.getElementById('exitButton');
        exitButton.style.backgroundColor = 'gray';    
        exitButton.disabled = true;

    })

    const decisionChannel = username + "ChallengeDecision"
    socket.on(decisionChannel, function (data) {
      const exitButton = document.getElementById('exitButton');
      exitButton.style.backgroundColor = 'red';    
      exitButton.disabled = false
      if (data.accept) {
        console.log("Duel starts!")  
        window.location.href = 'duelGame.html';
      }
      else{
        renderRejection()
      }

  })

});


// playerName is optional; if not provided, the function fetches all players
async function fetchPlayerData(playerName) {
    let url = '/players';
  
    if (playerName) {
        url += `/${encodeURIComponent(playerName)}`;
    }
  
    // Return the promise chain here
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.player) {
                console.log('Fetched data for a player:', data.player);
                return data.player;  // This value will be wrapped in a Promise
            } else if (data.players) {
                console.log('Fetched data for all players:', data.players);
                return data.players;  // This value will be wrapped in a Promise
            }
        })
        .catch(error => {
            console.error('There has been a problem with your player fetch operation:', error);
            // It's important to re-throw the error if you want the caller to be able to handle it
            throw error;
        });
}

//router.get('/duels/:playerName?', getDuels);
async function fetchDuelData(playerName) {
    let url = '/duels';
  
    if (playerName) {
        url += `/${encodeURIComponent(playerName)}`;
    }
  
    // Return the promise chain here
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.duel) {
                console.log('Fetched data for a duel:', data.duel);
                return data.duel;  // This value will be wrapped in a Promise
            } else if (data.duels) {
                console.log('Fetched data for all duels:', data.duels);
                return data.duels;  // This value will be wrapped in a Promise
            }
        })
        .catch(error => {
            console.error('There has been a problem with your duel fetch operation:', error);
            // It's important to re-throw the error if you want the caller to be able to handle it
            throw error;
        });
}


  async function deletePlayer(playerName) {
    fetch(`/players/${encodeURIComponent(playerName)}`, {
      method: 'DELETE'
    })
    .then(response => {
    
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(data => {
      console.log('Delete successful:', data);
      // You can update the UI here to reflect the removal of the duel
    })
    .catch(error => {
      console.error('Error during deletion:', error);
    });
  }

  async function deleteDuel(playerName) {
    fetch(`/duels/${encodeURIComponent(playerName)}`, {
        method: 'DELETE'
      })
      .then(response => {
      
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => {
        console.log('Delete duel successful:', data);
        // You can update the UI here to reflect the removal of the duel
      })
      .catch(error => {
        console.error('Error during duel deletion:', error);
      });
  }

async function updateChallengeStatuses(challenger,challenged,inChallenge,accept = null) {

    fetch(`/challengeStatuses/${encodeURIComponent(challenger)}/${encodeURIComponent(challenged)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inChallenge: inChallenge, accept: accept})
      })
      .then(response => {
      
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => {
        console.log('Challenge statuses updated successfully:', data);
        // You can update the UI here to reflect the removal of the duel
      })
      .catch(error => {
        console.error('Error during challenge statuses update:', error);
      });
}

async function registerNewDuel(challenger,challenged) {
    fetch(`/duels/${encodeURIComponent(challenger)}/${encodeURIComponent(challenged)}`, {
        method: 'POST'
      })
      .then(response => {
      
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => {
        console.log('New duel posted successfully:', data);
        // You can update the UI here to reflect the removal of the duel
      })
      .catch(error => {
        console.error('Error during posting new duel:', error);
      });
}

async function challengeClicked (challenger, challenged) {
    await updateChallengeStatuses(challenger,challenged,true)   //controller also emits an message to the challenged for the challenge letter
    await registerNewDuel(challenger,challenged)        //form new duel

    // renderOnlinePlayers()
    // renderOngoingDuels()
    
}



// Function to create the player divs and buttons
function populatePlayerList(players) {
    const playerListDiv = document.getElementById('onlinePlayers');
    while (playerListDiv.firstChild) {
        playerListDiv.removeChild(playerListDiv.firstChild);
    }
    const username = localStorage.getItem('username')
    const currentUserInChallenge = players.find(player => player.playerName === username)?.inChallenge || false;

    players.forEach(player => {
        // Create a new div for each player
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';

        // Create and set up the span for the player's name
        const playerNameSpan = document.createElement('span');
        playerNameSpan.textContent = player.playerName;
        playerDiv.appendChild(playerNameSpan);

        console.log("current player", player.playerName)
        if (username !== player.playerName) {
            // Create and set up the button
            const detailsButton = document.createElement('button');
            detailsButton.textContent = 'Challenge';
            detailsButton.className = 'challenge-button';
            detailsButton.style.marginLeft = '4px';
            detailsButton.onclick = async function() { 
              const exitButton = document.getElementById('exitButton');
              exitButton.style.backgroundColor = 'gray';    
              exitButton.disabled = true;
              await challengeClicked (username, player.playerName); 
            };

            if (player.inChallenge|| currentUserInChallenge) {
                detailsButton.style.backgroundColor = 'gray';  
                detailsButton.style.color = 'white';  
                detailsButton.disabled = true;
            }
            
            playerDiv.appendChild(detailsButton);
        }
        

        // Append the player div to the main playerList div
        playerListDiv.appendChild(playerDiv);
    });
}

function populateDuels(duels) {
    const ongoingDuelsDiv = document.getElementById("ongoingDuels");
    while (ongoingDuelsDiv.firstChild) {
        ongoingDuelsDiv.removeChild(ongoingDuelsDiv.firstChild);
    }
    // Clear existing content
    ongoingDuelsDiv.innerHTML = '';

    duels.forEach(duel => {
        // Create a new div for each duel
        const duelDiv = document.createElement('div');
        duelDiv.className = 'player'; // Assuming you want to reuse the 'player' class for styling

        // Set the text content to show challenger and challenged names
        duelDiv.textContent = `${duel.challengerName} ⚔️ ${duel.challengedName}`;

        // Append the duel div to the ongoingDuels div
        ongoingDuelsDiv.appendChild(duelDiv);
    });
}

function renderChallengeLetter(challenger, challenged) {
    // Get the element where you want to display the challenge message
    const messageDiv = document.getElementById('challengeMessage');

    // Clear any existing content
    messageDiv.innerHTML = '';

    // Create the message in HTML format
    const challengeHTML = `
        <div class="challenge-letter">
            <p>Dear ${challenged},</p>
            <p>Prepare thy blade, we shall settle our differences of </p>
            <p>disaster knowledge under the watchful eye of honor.</p>
            <p>Yours in anticipation,</p>
            <p>${challenger}</p>
            <div class="response-buttons">
                <button id="acceptButton" class="accept">Accept</button>
                <button id="declineButton" class="decline">Decline</button>
            </div>
        </div>
    `;

    // Insert the challenge message into the div
    messageDiv.innerHTML = challengeHTML;
    let autoDeclineTimer = setTimeout(() => {
       declineChallenge(challenger, challenged, messageDiv)
    }, 5000);

    document.getElementById('acceptButton').addEventListener('click', async function() {
        // Handle the accept action
        clearTimeout(autoDeclineTimer);
        const accept = true;
        await updateChallengeStatuses(challenger,challenged,true, accept)
        window.location.href = 'duelGame.html';
    });

    //router.delete('/duels/:playerName', removeADuel);
    document.getElementById('declineButton').addEventListener('click', async function()  {
        // Handle the decline action
        clearTimeout(autoDeclineTimer);
        declineChallenge(challenger, challenged, messageDiv)
    });
}

function renderRejection() {
    const messageDiv = document.getElementById('challengeMessage');
    while (messageDiv.firstChild) {
      messageDiv.removeChild(messageDiv.firstChild);
    }
    // Clear any existing content
    messageDiv.innerHTML = '';

    // Create the message in HTML format
    const challengeHTML = `
        <div class="challenge-letter">
            <p>Your challenge invitation was either rejected </p>
            <p>or has timed out.</p>
        </div>
        <div class="response-buttons">
          <button id="gotItButton" >Got it</button>
        </div>
    `;

    // Insert the challenge message into the div
    messageDiv.innerHTML = challengeHTML;

    document.getElementById('gotItButton').addEventListener('click', function() {
      while (messageDiv.firstChild) {
        messageDiv.removeChild(messageDiv.firstChild);
      }
  });
}

async function declineChallenge(challenger, challenged, messageDiv) {
    await deleteDuel(challenger);
    const accept = false;
    await updateChallengeStatuses(challenger,challenged,false, accept)
    while (messageDiv.firstChild) {
        messageDiv.removeChild(messageDiv.firstChild);
    }
    const exitButton = document.getElementById('exitButton');
    exitButton.style.backgroundColor = 'red';    
    exitButton.disabled = false;
}


async function renderOnlinePlayers() {

    const players = await fetchPlayerData()

    populatePlayerList(players);
}

async function renderOngoingDuels() {
    const duels = await fetchDuelData()
    populateDuels(duels);
}