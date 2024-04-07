import {Duels} from '../models/Duels.js';
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
        let isWin = accuracies[playerIndex] > accuracies[opponentIndex];
        let playerMistakes = mistakesList[playerIndex];

        res.status(200).json({ isWin: isWin, accuracy: accuracies[playerIndex], mistakes: playerMistakes });

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

        // Find the duel involving the player.
        let duel = await Duels.findOne({
            $or: [
                { challengerName: playerName },
                { challengedName: playerName }
            ]
        });

        if (!duel) {
            return res.status(404).send('Duel not found.');
        }

        // Determine the index for updating the correct submission.
        let playerIndex = duel.challengerName === playerName ? 0 : 1;

        // Update the duel in memory
        duel.submissions[playerIndex].questionDescriptions.push(questionInfo.questionDescription);
        duel.submissions[playerIndex].questionAnswers.push(questionInfo.correctAnswer);
        duel.submissions[playerIndex].studentAnswers.push(answer);

        // Save the updated duel
        await duel.save();

        res.status(200).send('Submission uploaded successfully');
    } catch (error) {
        console.error('Error updating submission:', error);
        res.status(500).send('Error updating submission');
    }
}



export {getQuestion, getResult, uploadSubmission};