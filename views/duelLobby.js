
document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');

    const socket = io('http://localhost:3000', {
      query: {
        token: localStorage.getItem('token'),
      },
    })
    
    document.getElementById('directory').addEventListener('click', async function() {
        await deletePlayer(username);
        // Assuming deletePlayer resolves after completion and handles its own errors
        window.location.href = 'ESN Directory.html';
    });

    document.getElementById('chatroom').addEventListener('click', async function() {
      await deletePlayer(username);
      // Assuming deletePlayer resolves after completion and handles its own errors
      window.location.href = 'chatroom.html';
    });

    document.getElementById('announcements').addEventListener('click', async function() {
      await deletePlayer(username);
      // Assuming deletePlayer resolves after completion and handles its own errors
      window.location.href = 'Announcement.html';
    });

    document.getElementById('settings').addEventListener('click', async function() {
      await deletePlayer(username);
      // Assuming deletePlayer resolves after completion and handles its own errors
      window.location.href = 'Settings.html';
    });

    document.getElementById('resources').addEventListener('click', async function() {
      await deletePlayer(username);
      // Assuming deletePlayer resolves after completion and handles its own errors
      window.location.href = 'Resources/Resources.html';
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

    })

    const decisionChannel = username + "ChallengeDecision"
    socket.on(decisionChannel, function (data) {
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



function clearElementContents(element) {
  while (element.firstChild) {
      element.removeChild(element.firstChild);
  }
}

function createPlayerDiv(player, username) {
  const playerDiv = document.createElement('div');
  playerDiv.className = 'player';
  playerDiv.appendChild(createPlayerNameSpan(player.playerName));

  if (username !== player.playerName) {
      playerDiv.appendChild(createChallengeButton(username, player));
  }

  return playerDiv;
}

function createPlayerNameSpan(playerName) {
  const playerNameSpan = document.createElement('span');
  playerNameSpan.textContent = playerName;
  return playerNameSpan;
}

function createChallengeButton(username, player) {
  const button = document.createElement('button');
  button.textContent = 'Challenge';
  button.className = 'challenge-button';
  button.style.marginLeft = '4px';
  button.onclick = () => challengeClicked(username, player.playerName);
  button.disabled = player.inChallenge;
  button.style.backgroundColor = player.inChallenge ? 'gray' : '';
  button.style.color = player.inChallenge ? 'white' : '';
  return button;
}

function populatePlayerList(players) {
  const playerListDiv = document.getElementById('onlinePlayers');
  clearElementContents(playerListDiv);

  const username = localStorage.getItem('username');
  const currentUserInChallenge = players.find(player => player.playerName === username)?.inChallenge || false;

  players.forEach(player => {
      playerListDiv.appendChild(createPlayerDiv(player, username));
  });
}


function createDuelDiv(duel) {
  const duelDiv = document.createElement('div');
  duelDiv.className = 'duel';
  duelDiv.textContent = `${duel.challengerName} ⚔️ ${duel.challengedName}`;
  return duelDiv;
}

function populateDuels(duels) {
  const ongoingDuelsDiv = document.getElementById("ongoingDuels");
  clearElementContents(ongoingDuelsDiv);

  duels.forEach(duel => ongoingDuelsDiv.appendChild(createDuelDiv(duel)));
}


function createChallengeHTML(challenger, challenged) {
  return `
      <div class="challenge-letter">
          <p>Dear ${challenged},</p>
          <p>Prepare thy blade, we shall settle our differences under the watchful eye of honor.</p>
          <p>Yours in anticipation,</p>
          <p>${challenger}</p>
          <div class="response-buttons">
              <button id="acceptButton" class="accept">Accept</button>
              <button id="declineButton" class="decline">Decline</button>
          </div>
      </div>
  `;
}

function setupChallengeResponseHandlers(challenger, challenged, messageDiv, autoDeclineTimer) {
  document.getElementById('acceptButton').onclick = async () => {
      clearTimeout(autoDeclineTimer);
      await updateChallengeStatuses(challenger, challenged, true, true);
      window.location.href = 'duelGame.html';
  };

  document.getElementById('declineButton').onclick = async () => {
      clearTimeout(autoDeclineTimer);
      declineChallenge(challenger, challenged, messageDiv);
  };
}

function renderChallengeLetter(challenger, challenged) {
  const messageDiv = document.getElementById('challengeMessage');
  clearElementContents(messageDiv);
  messageDiv.innerHTML = createChallengeHTML(challenger, challenged);
  let autoDeclineTimer = setTimeout(() => declineChallenge(challenger, challenged, messageDiv), 15000);

  setupChallengeResponseHandlers(challenger, challenged, messageDiv, autoDeclineTimer);
}


function renderRejection() {
  const messageDiv = document.getElementById('challengeMessage');
  clearElementContents(messageDiv);
  messageDiv.innerHTML = `
      <div class="challenge-letter">
          <p>Your challenge invitation was either rejected or has timed out.</p>
          <button id="gotItButton">Got it</button>
      </div>
  `;

  document.getElementById('gotItButton').onclick = () => clearElementContents(messageDiv);
}


async function declineChallenge(challenger, challenged, messageDiv) {
    await deleteDuel(challenger);
    const accept = false;
    await updateChallengeStatuses(challenger,challenged,false, accept)
    while (messageDiv.firstChild) {
        messageDiv.removeChild(messageDiv.firstChild);
    }

}


async function renderOnlinePlayers() {

    const players = await fetchPlayerData()

    populatePlayerList(players);
}

async function renderOngoingDuels() {
    const duels = await fetchDuelData()
    populateDuels(duels);
}