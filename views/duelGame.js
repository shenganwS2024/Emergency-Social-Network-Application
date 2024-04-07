document.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem('username');

    const socket = io('http://localhost:3000', {
        query: {
            token: localStorage.getItem('token'),
        },
    });

    try {
        const duel = await fetchDuelData(username);

        if (!duel) {
            console.error('No duel data found.');
            // You might want to redirect the user or show an error message here.
            return;
        }

        const challengerName = duel.challengerName;
        const challengedName = duel.challengedName;
        console.log("duel info", duel)
        if (!challengerName || !challengedName) {
            console.error('Duel data is incomplete.');
            // Handle incomplete data error, maybe show a message or redirect.
            return;
        }

        const leaveDuelChannel1 = challengerName + "LeftDuel";
        const leaveDuelChannel2 = challengedName + "LeftDuel";

        socket.on(leaveDuelChannel1, function () {
            window.location.href = 'duelLobby.html';
        });

        socket.on(leaveDuelChannel2, function () {
            window.location.href = 'duelLobby.html';
        });

        let autoDeclineTimer = setTimeout(() => {
           leaveDuelGame(challengerName, challengedName)
         }, 10000);

        document.getElementById('forfeitButton').addEventListener('click', async function() {
            clearTimeout(autoDeclineTimer);
            leaveDuelGame(challengerName, challengedName)
        });

        document.getElementById('readyButton').addEventListener('click', async function() {
            clearTimeout(autoDeclineTimer);
            console.log("Ready for the questions")
        });
    } catch (error) {
        console.error('An error occurred while setting up the duel game:', error);
        
    }
});


async function leaveDuelGame(challengerName, challengedName, inChallenge = false) {
    await deleteDuel(challengerName);
    await updateChallengeStatuses(challengerName, challengedName, inChallenge);
    window.location.href = 'duelLobby.html';
}










///////////////////////////////////Repeating functions/////////////////////////////////////////
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