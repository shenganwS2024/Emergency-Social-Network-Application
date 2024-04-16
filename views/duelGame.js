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
        
        if (!challengerName || !challengedName) {
            console.error('Duel data is incomplete.');
            // Handle incomplete data error, maybe show a message or redirect.
            return;
        }
        const opponent = username === challengerName? challengedName : challengerName
        
        renderOpponentStatus(opponent)
        renderSystemMessage(0)


        const leaveDuelChannel1 = challengerName + "LeftDuel";
        // const leaveDuelChannel2 = challengedName + "LeftDuel";

        socket.on(leaveDuelChannel1, function leaveDuel() {
            alert("Someone forfeits, the duel ends");
            window.location.href = 'duelLobby.html';

            socket.off(leaveDuelChannel1, leaveDuel);
            
        });

        // socket.on(leaveDuelChannel2, function () {
        //     window.location.href = 'duelLobby.html';
        // });
        
        const checkReadiness1 = username + "ReadinessforQ1"
        socket.on(checkReadiness1, async function () {

            const bothReady = await checkBothReady(username,opponent)
            if (bothReady === 1) {
                //this means both parties are ready
                const firstQuestion = await getQuestionInfo(1)
                console.log("first question", firstQuestion)
                await updatePlayerReadiness(username,opponent,false)
                await updatePlayerReadiness(opponent,username,false)
                await timeout(200);
                renderSystemMessage(1,firstQuestion.questionDescription)
                await renderChoiceButtons("choice-buttons", 1, firstQuestion, username, opponent)
                await renderOpponentStatus(opponent)

            }
            else if (bothReady === 2) {
                //this means your opponent is ready but you're not
                await renderOpponentStatus(opponent)
            }
        });

        const checkReadiness2 = username + "ReadinessforQ2"

        socket.on(checkReadiness2, async function onCheckReadiness2() {
            const bothReady = await checkBothReady(username, opponent);
            if (bothReady === 1) {
                // This means both parties are ready
                const secondQuestion = await getQuestionInfo(2);
                console.log("second question", secondQuestion);
                await updatePlayerReadiness(username, opponent, false);
                await updatePlayerReadiness(opponent, username, false);
                await timeout(200);
                renderSystemMessage(2, secondQuestion.questionDescription);
                await renderChoiceButtons("choice-buttons", 2, secondQuestion, username, opponent);
                await renderOpponentStatus(opponent);
        
                // Remove this event listener since it's no longer needed
                await timeout(500);
                socket.off(checkReadiness2, onCheckReadiness2);
            } else if (bothReady === 2) {
                // This means your opponent is ready but you're not
                await renderOpponentStatus(opponent);
            }
        });

        const checkReadiness3 = username + "ReadinessforQ3"
        socket.on(checkReadiness3, async function onCheckReadiness3() {

            const bothReady = await checkBothReady(username,opponent)
            if (bothReady === 1) {
                //this means both parties are ready
                const thirdQuestion = await getQuestionInfo(3)
                console.log("third question", thirdQuestion)
                await updatePlayerReadiness(username,opponent,false)
                await updatePlayerReadiness(opponent,username,false)
                await timeout(200);
                renderSystemMessage(3,thirdQuestion.questionDescription)
                await renderChoiceButtons("choice-buttons", 3, thirdQuestion, username, opponent)
                await renderOpponentStatus(opponent)
                await timeout(500);
                socket.off(checkReadiness3, onCheckReadiness3);
            }
            else if (bothReady === 2) {
                //this means your opponent is ready but you're not
                await renderOpponentStatus(opponent)
            }
        });

        const checkReadiness4 = username + "ReadinessforQ4"
        socket.on(checkReadiness4, async function onCheckReadiness4() {

            const bothReady = await checkBothReady(username,opponent)
            if (bothReady === 1) {
                //this means both parties are ready
                
                //{ isWin: isWin, accuracy: accuracies[playerIndex], mistakes: playerMistakes }
                const result = await getGameResult(username)
                
                console.log("Announcing winner or loser", result)
                await updatePlayerReadiness(username,opponent,false)
                await updatePlayerReadiness(opponent,username,false)
                await timeout(200);
                console.log("show me the result", result)
                renderSystemMessage(4,result)
                await renderChoiceButtons("choice-buttons", 4, result, username, opponent)
                await renderOpponentStatus(opponent, result.isWin)
                //await deleteDuel(username);
                await timeout(500);
                socket.off(checkReadiness4, onCheckReadiness4);
            }
            else if (bothReady === 2) {
                //this means your opponent is ready but you're not
                await renderOpponentStatus(opponent)
            }
        });
        let timeLeft = 20; // 20 seconds countdown
        const countdownElement = document.getElementById('countdown');
        const updateCountdown = () => {
            countdownElement.textContent = `${timeLeft} seconds remaining`;
            if (timeLeft <= 0) {
                clearInterval(countdownTimer);
            } else {
                timeLeft -= 1;
            }
        };

        let countdownTimer = setInterval(updateCountdown, 1000);
        
        let autoDeclineTimer = setTimeout(() => {
            clearInterval(countdownTimer);
            leaveDuelGame(username, opponent);
        }, timeLeft*1000);

        document.getElementById('forfeitButton').addEventListener('click', async function() {
            clearTimeout(autoDeclineTimer);
            clearInterval(countdownTimer);
            leaveDuelGame(username, opponent)
        });

        document.getElementById('readyButton').addEventListener('click', async function() {
            clearTimeout(autoDeclineTimer);
            clearInterval(countdownTimer);
            console.log("Ready for the questions")
            disableChoiceButtons("choice-buttons")
            await updatePlayerReadiness(username,opponent,true,1)
            renderSystemMessage(-1)         //order might be a problem?

        });

    } catch (error) {
        console.error('An error occurred while setting up the duel game:', error);
        
    }
});

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function leaveDuelGame(username, opponent, inChallenge = false) {
    await deleteDuel(username);
    await updatePlayerReadiness(username, opponent,false)
    await updatePlayerReadiness(opponent,username, false)
    await updateChallengeStatuses(username, opponent, inChallenge);
    // alert("Someone forfeits, the duel ends");
    // window.location.href = 'duelLobby.html';
    
}


async function renderOpponentStatus(opponent, opponentResult = null) {
    const opponentDiv = document.getElementById('opponentStatus');

    opponentDiv.innerHTML = '';
    let spacedString = 'Opponent: ' + opponent;
    if (opponentResult === null) {
        const opponentInfo = await fetchPlayerData(opponent)
    
        const readinessIndicator = opponentInfo.ready ? '✅' : '❌';

        spacedString = spacedString 
            + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ready: ' + readinessIndicator;
    }
    else {
        let isOpponentWin = 'Win';
        if (opponentResult === "win") {
            isOpponentWin = 'Lose 💀';
        }
        else if (opponentResult === "tie") {
            isOpponentWin = 'Tie 🤝';
        }
        spacedString = spacedString 
            + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Opponent result: ' + isOpponentWin;
    }
    
    opponentDiv.innerHTML = spacedString;
}


async function renderSystemMessage(num, message) {
    const messageDiv = document.getElementById('systemMessage');
    // Clear any existing content
    messageDiv.innerHTML = '';

    // Create the message in HTML format
    let challengeHTML = `
        <div class="system-messages">
            <p>Start the duel by clicking "Ready" or flee with dishonor by clicking "Forfeit".</p>
            <p>Please read all the information here and make your decision in 20 seconds.</p>
            <p class="note-messages">Note that you will be redirected to lobby if someone clicks "Forfeit" or fails to respond in time.</p>
            <p class="note-messages">And do not refresh your page unless you find your question is not updating correctly</p>
        </div>
    `;

    if (num === -1) {
        challengeHTML = `
        <div class="system-messages">
            <p>Please patiently wait for your opponent. </p>
        </div>
    `;
    }
    else if (num === 1) {
        challengeHTML = `
        <div class="system-messages">
            <p>First Question: </p>
            <p>${message}</p>
        </div>
    `;
    }
    else if (num === 2) {
        challengeHTML = `
        <div class="system-messages">
            <p>Second Question: </p>
            <p>${message}</p>
        </div>
    `;
    }
    else if (num === 3) {
        challengeHTML = `
        <div class="system-messages">
            <p>Third Question: </p>
            <p>${message}</p>
        </div>
    `;
    }
    else if (num === 4) {
        //{ isWin: isWin, accuracy: accuracies[playerIndex], mistakes: playerMistakes }
        if (message.isWin === "win") {
            challengeHTML = `
                <div class="system-messages">
                    <p>Congratulations, you are the winner👑 of this duel! </p>
                    <p>You outperformed your opponent </p>
                    <p>by having an accuracy of ${message.accuracy}. </p>
                </div>
            `;
        }
        else if (message.isWin === "lose") {
            challengeHTML = `
                <div class="system-messages">
                    <p>Unfortunately, you lost the duel. </p>
                    <p>Turn your loss into a learning moment: enhance your disaster preparedness to come back stronger.</p>
                    <p>The accuracy of your answers: ${message.accuracy}. </p>
                </div>
            `;
        }
        else if (message.isWin === "tie") {
            challengeHTML = `
                <div class="system-messages">
                    <p>It looks like this duel has no winner nor loser. </p>
                    <p>Keep learning and improving—your next victory might just be around the corner!</p>
                    <p>You and your opponent have the same number of accuracy: ${message.accuracy}. </p>
                </div>
            `;
        }
        
    }
    else if (num === 5) {
        challengeHTML = `<div class="system-messages"><p>Questions you answered wrong:</p><p>---------------------------------------------------------------------</p>`;
    
        message.mistakes.forEach((mistake) => {
            challengeHTML += `
                <div class="mistake">
                    <p>Question: ${mistake.question}</p>
                    <p>Correct answer: ${mistake.correctAnswer}</p>
                    <p>Your answer: ${mistake.userAnswer}</p>
                    <p>---------------------------------------------------------------------</p>
                </div>
            `;
        });
    
        challengeHTML += `</div>`;
    }

    // Insert the challenge message into the div
    messageDiv.innerHTML = challengeHTML;
}

async function renderChoiceButtons(divName, num, questionInfo, username, opponent) {
    const choiceButtonDiv = document.getElementById(divName);
    let countdownTimer, autoDeclineTimer;
    choiceButtonDiv.innerHTML = '';
    // while (choiceButtonDiv.firstChild) {
    //     choiceButtonDiv.removeChild(choiceButtonDiv.firstChild);
    // }
    let timeLeft = 20;
    const countdownElement = document.createElement('div');
    countdownElement.id = 'countdown';
    countdownElement.className = 'countdown';


    const updateCountdown = () => {
        countdownElement.textContent = `${timeLeft} seconds remaining`;
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            clearTimeout(autoDeclineTimer);
        } else {
            timeLeft -= 1;
        }
    };

    if (num < 3) {
        if (num === 1) {
            timeLeft = 25;
        }
        else if (num === 2) {
            timeLeft = 15;
        }

        countdownElement.textContent = `You have ${timeLeft} seconds to make your decision.`
        choiceButtonDiv.appendChild(countdownElement)

        const choices = questionInfo.choices
        // Iterate over the choices to create buttons
        choices.forEach((choice, index) => {
            
            // Create a new button element
            const button = document.createElement('button');
            // Set the button's text to the current choice
            button.textContent = '⚔️' + choice;
            // Assign an ID based on the index
            button.id = `choice-${index}`;
            // Add the 'choice-button' class to each button
            button.className = 'choice-button';
            // Append the button to the div
            button.addEventListener('click', async function() {
                clearTimeout(autoDeclineTimer);
                clearInterval(countdownTimer);
                await uploadSubmission(username, questionInfo, choice)
                await timeout(200);
                disableChoiceButtons("choice-buttons")
                await updatePlayerReadiness(username,opponent,true,num+1)
                renderSystemMessage(-1)
            });

            choiceButtonDiv.appendChild(button);
        });
        countdownTimer = setInterval(updateCountdown, 1000);
        autoDeclineTimer = setTimeout(async() => {
            clearInterval(countdownTimer);
            await uploadSubmission(username, questionInfo, " ")
            await timeout(100);
            await updatePlayerReadiness(username,opponent,true,num+1)
        }, timeLeft*1000);
    }
    else if (num === 3) {
        timeLeft = 20;
        countdownElement.textContent = `You have ${timeLeft} seconds to make your decision.`
        choiceButtonDiv.appendChild(countdownElement)
        var br = document.createElement("br");
        choiceButtonDiv.appendChild(br);

        // Create an input field
        const inputField = document.createElement('input');
        inputField.type = 'text'; // Setting the type of input field
        inputField.id = 'userInput'; // Assigning an ID to the input field
        inputField.placeholder = 'Enter your answer'; // Placeholder for the input field
    
        // Create a submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit ⚔️'; // Setting the button text
        submitButton.id = 'submitButton'; // Assigning an ID to the submit button
        submitButton.className = 'choice-button'; // Reusing the 'choice-button' class for styling
    
        // Append the input field and the submit button to the div
        
    
        // Add an event listener to the submit button
        submitButton.addEventListener('click', async function() {
            clearTimeout(autoDeclineTimer);
            clearInterval(countdownTimer);
            const userAnswer = document.getElementById('userInput').value; // Retrieving user input
            if (userAnswer.trim() !== '') {
                console.log("submit1")
                await uploadSubmission(username, questionInfo, userAnswer);
                await timeout(200);
                disableChoiceButtons("choice-buttons");
                await updatePlayerReadiness(username, opponent, true, num + 1);
                renderSystemMessage(-1);
            }
        });
        choiceButtonDiv.appendChild(inputField);

        choiceButtonDiv.appendChild(submitButton);
        var br1 = document.createElement("br");
        choiceButtonDiv.appendChild(br1);

        countdownTimer = setInterval(updateCountdown, 1000);
        autoDeclineTimer = setTimeout(async() => {
            clearInterval(countdownTimer);
            console.log("submit2")
            await uploadSubmission(username, questionInfo, " ")
            await timeout(100);
            await updatePlayerReadiness(username,opponent,true,4)

        }, timeLeft*1000);
    }
    else if (num === 4) {
        const exitButton = document.createElement('button');
        exitButton.innerHTML = 'Exit';
        exitButton.className = 'choice-button';
        exitButton.id = 'exitButton';
        

        exitButton.addEventListener('click', async function() {
            // clearTimeout(autoDeclineTimer);
            await updateChallengeStatuses(username, null, false);
            await deleteDuel(username);
            window.location.href = 'duelLobby.html';
        }); 

        const detailButton = document.createElement('button');
        detailButton.innerHTML = 'Details';
        detailButton.className = 'choice-button';
        detailButton.id = 'detailButton';
        choiceButtonDiv.appendChild(detailButton);
        var br = document.createElement("br");
        choiceButtonDiv.appendChild(br);
        choiceButtonDiv.appendChild(exitButton);

        detailButton.addEventListener('click', async function() {
            // clearTimeout(autoDeclineTimer);
            let result = questionInfo
            renderSystemMessage(5,result)
            await renderChoiceButtons("choice-buttons", 5, result, username, opponent)
            
        }); 
    }
    else if (num === 5) {
        const exitButton = document.createElement('button');
        exitButton.innerHTML = 'Exit';
        exitButton.className = 'choice-button';
        exitButton.id = 'exitButton';

        exitButton.addEventListener('click', async function() {
            // clearTimeout(autoDeclineTimer);
            await updateChallengeStatuses(username, null, false);
            await deleteDuel(username);
            window.location.href = 'duelLobby.html';
        }); 

        const resultButton = document.createElement('button');
        resultButton.innerHTML = 'Result';
        resultButton.className = 'choice-button';
        resultButton.id = 'resultButton';
        choiceButtonDiv.appendChild(resultButton);
        var br = document.createElement("br");
        choiceButtonDiv.appendChild(br);
        choiceButtonDiv.appendChild(exitButton);

        resultButton.addEventListener('click', async function() {
            // clearTimeout(autoDeclineTimer);
            let result = questionInfo
            renderSystemMessage(4,result)
            await renderChoiceButtons("choice-buttons", 4, result, username, opponent)
            
        }); 
    }

    if (num < 4) {
       // Create and append the forfeit button
        const forfeitButton = document.createElement('button');
        forfeitButton.innerHTML = '🏳️ Forfeit';
        forfeitButton.className = 'choice-button';
        forfeitButton.id = 'forfeitButton';
        choiceButtonDiv.appendChild(forfeitButton);

        forfeitButton.addEventListener('click', async function() {
            // clearTimeout(autoDeclineTimer);
            leaveDuelGame(username, opponent)
        }); 
    }
    
}

function disableChoiceButtons(divName) {
    const choiceButtonDiv = document.getElementById(divName);
    
    // Get all button elements within the specified div
    const buttons = choiceButtonDiv.getElementsByTagName('button');
    
    // Iterate over the NodeList and disable each button
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }
}

async function checkBothReady(username,opponent) {
    const p1 = await fetchPlayerData(username)
    const p2 = await fetchPlayerData(opponent)
    const ready1 = p1.ready
    const ready2 = p2.ready

    if (ready1 === true && ready2 === true) {
        return 1;
    }
    else if (ready2 === true) {
        return 2;
    }

    return 0;
}

async function updatePlayerReadiness(username,opponent,ready,number) {
    fetch(`/readyStatuses/${encodeURIComponent(username)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ready: ready, opponent: opponent, number: number })
      })
      .then(response => {
      
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => {
        console.log('Ready statuses updated successfully:', data);
        // You can update the UI here to reflect the removal of the duel
      })
      .catch(error => {
        console.error('Error during ready statuses update:', error);
      });
}

async function uploadSubmission(playerName, questionInfo, answer) {
    fetch(`/submissions/${encodeURIComponent(playerName)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionInfo: questionInfo, answer: answer })
      })
      .then(response => {
      
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => {
        console.log('Submission uploaded successfully:', data);
        // You can update the UI here to reflect the removal of the duel
      })
      .catch(error => {
        console.error('Error during submission:', error);
      });
}

async function getQuestionInfo(num) {
    let url = '/questions';

    url += `/${encodeURIComponent(num)}`;
  
    // Return the promise chain here
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched data for a question:', data.question);
            return data.question;  // This value will be wrapped in a Promise
        })
        .catch(error => {
            console.error('There has been a problem with your question fetch operation:', error);
            // It's important to re-throw the error if you want the caller to be able to handle it
            throw error;
        });
}


//router.get('/results/:playerName', getResult);
async function getGameResult(playerName) {
    let url = '/results';

    url += `/${encodeURIComponent(playerName)}`;
  
    // Return the promise chain here
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched data for game result:', data);
            return data;  // This value will be wrapped in a Promise
        })
        .catch(error => {
            console.error('There has been a problem with your game result fetch operation:', error);
            // It's important to re-throw the error if you want the caller to be able to handle it
            throw error;
        });
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
    let url = `/challengeStatuses/${encodeURIComponent(challenger)}`

    if (challenged !== null) {
        url = url + `/${encodeURIComponent(challenged)}`
    }
    fetch(url, {
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