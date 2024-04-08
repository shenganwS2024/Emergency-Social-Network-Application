import {Duels} from '../models/Duels.js';
import {Players} from '../models/Players.js';
import { io } from '../server.js';
import getStrategy from '../questionFetchStrategies/questionFetchIndex.js'

async function getQuestion(req, res) {
    
    try {
        const number = req.params.number;
        const fetchResults = await getStrategy(number);
        res.status(200).json({question: fetchResults});   
        
    } catch (error) {
        console.error('Error getting the question:', error);
        res.status(500).send('Error getting the question');
    }
}

async function getResult(req, res) {

    try {
        let playerName = req.params.playerName;
        let duel = await Duels.findOne({
            $or: [
                { challengerName: playerName },
                { challengedName: playerName }
            ]
        });

        if (!duel || duel.submissions.length !== 2) {
            return res.status(404).send('Duel not found or invalid submissions.');
        }

        // Calculate accuracies and mistakes for both players
        const accuracies = [0, 0];
        const mistakesList = [[], []];  // Two lists to track mistakes for both players

        for (let i = 0; i < duel.submissions.length; i++) {
            let correctCount = 0;
            for (let j = 0; j < duel.submissions[i].questionAnswers.length; j++) {
                if (duel.submissions[i].questionAnswers[j] === duel.submissions[i].studentAnswers[j]) {
                    correctCount++;
                } else {
                    // Track the mistake
                    mistakesList[i].push({
                        question: duel.submissions[i].questionDescriptions[j],
                        correctAnswer: duel.submissions[i].questionAnswers[j],
                        userAnswer: duel.submissions[i].studentAnswers[j]
                    });
                }
            }
            accuracies[i] = correctCount / duel.submissions[i].questionAnswers.length;
        }

        // Determine if the player won and retrieve their mistakes
        let playerIndex = duel.challengerName === playerName ? 0 : 1;
        let opponentIndex = 1 - playerIndex;
        let isWin = "win"
        if (accuracies[playerIndex] === accuracies[opponentIndex]) {
            isWin = "tie"
        }
        else if (accuracies[playerIndex] < accuracies[opponentIndex]) {
            isWin = "lose"
        }
        
        let playerMistakes = mistakesList[playerIndex];

        res.status(200).json({ isWin: isWin, accuracy: accuracies[playerIndex].toFixed(2), mistakes: playerMistakes });

    } catch (error) {
        console.error('Error getting result:', error);
        res.status(500).send('Error getting result');
    }
}

async function uploadSubmission(req, res) {
    try {
        const answer = req.body.answer;
        const questionInfo = req.body.questionInfo;
        const playerName = req.params.playerName;

        const filter = {
            $or: [
                { challengerName: playerName },
                { challengedName: playerName }
            ]
        };

        // Fetch the duel and ensure the submission array structure
        let duel = await Duels.findOne(filter);
        if (!duel) {
            return res.status(404).send('Duel not found.');
        }

        let playerIndex = duel.challengerName === playerName ? 0 : 1;
        
        
        // Ensure the submission slot exists and is structured correctly
        if (!duel.submissions[playerIndex]) {
            duel.submissions[playerIndex] = { questionDescriptions: [], questionAnswers: [], studentAnswers: [] };
            await duel.save(); // Save if we had to initialize the structure
        }

        const existingDescription = duel.submissions[playerIndex].questionDescriptions.includes(questionInfo.questionDescription);
        if (existingDescription) {
            return res.status(400).send('Question description already exists.');
        }

        // Now prepare the atomic update
        const update = { $push: {} };
        const basePath = `submissions.${playerIndex}`;
        update.$push[`${basePath}.questionDescriptions`] = questionInfo.questionDescription;
        update.$push[`${basePath}.questionAnswers`] = questionInfo.correctAnswer;
        update.$push[`${basePath}.studentAnswers`] = answer;

        // Execute the atomic update
        const updatedDuel = await Duels.findOneAndUpdate(filter, update, {
            new: true,
            runValidators: true
        });

        if (!updatedDuel) {
            return res.status(404).send('Unable to update submission.');
        }

        res.status(200).send('Submission uploaded successfully');
    } catch (error) {
        console.error('Error updating submission:', error);
        res.status(500).send('Error updating submission');
    }
}



async function updateReadiness(req,res) {
    const opponent = req.body.opponent;
    const ready = req.body.ready;
    const number = req.body.number;
    const playerName = req.params.playerName;
    try {
        if (ready === undefined || typeof ready !== 'boolean') {
            return res.status(400).send('Invalid readiness provided');
        }

        const updatedPlayerName = await Players.findOneAndUpdate(
            { playerName: playerName },
            { ready: ready },
            { new: true }  // Returns the updated document
        );

        if (!updatedPlayerName) {
            return res.status(404).send('Player not found');
        }

        if (ready) {

            const checkReadiness1 = playerName + "ReadinessforQ" + number
            const checkReadiness2 = opponent + "ReadinessforQ"  + number
            io.emit(checkReadiness1);
            io.emit(checkReadiness2);
        }
        

        res.status(200).send('Player readiness updated successful');
    } catch (error) {
        console.error('Error updating player readiness:', error);
        res.status(500).send('Error updating player readiness');
    }
}

export {getQuestion, getResult, uploadSubmission, updateReadiness};