import {Duels} from '../models/Duels.js';
import {Players} from '../models/Players.js';
import { io } from '../server.js';

async function getPlayers(req, res) {
    
    try {
        let playerName = req.params.playerName;
        if (playerName === undefined) {
            let players = await Players.find({}).sort({playerName: 1});
            res.status(200).json({players: players});
        }
        else {
            let player = await Players.findOne({ playerName: playerName });
            res.status(200).json({player: player});
        }      
        
    } catch (error) {
        console.error('Error getting players:', error);
        res.status(500).send('Error getting players');
    }
}

async function getDuels(req, res) {
    
    try {
        let playerName = req.params.playerName;
        if (playerName === undefined) {
            let duels = await Duels.find({});
            res.status(200).json({duels: duels});
        }
        else {
            let duel = await Duels.findOne({
                $or: [
                    { challengerName: playerName },
                    { challengedName: playerName }
                ]
            });
            res.status(200).json({duel: duel});
        }      
        
    } catch (error) {
        console.error('Error getting duels:', error);
        res.status(500).send('Error getting duels');
    }
}

async function postNewPlayer(req,res) {
    let playerName = req.params.playerName;
    
    try {
        const newPlayer = new Players({
            playerName: playerName
        });
        await newPlayer.save();
        io.emit('onlinePlayersUpdated');
        res.status(201).send('New player registered sucessfully');
    } catch (error) {
        console.error('Error saving new player:', error);
        res.status(500).send('Error saving new player');
    }
}

async function postNewDuel(req,res) {
    let challenger = req.params.challenger;
    let challenged = req.params.challenged;
    try {
        const newDuel = new Duels({
            challengerName: challenger,
            challengedName: challenged
        });
        await newDuel.save();
        io.emit('ongoingDuelsUpdated');
        res.status(201).send('New duel created sucessfully');
    } catch (error) {
        console.error('Error saving new duel:', error);
        res.status(500).send('Error saving new duel');
    }
}

async function updateChallengeStatus(req,res) {
    const inChallenge = req.body.inChallenge;
    const accept = req.body.accept;
    const challenger = req.params.challenger;
    const challenged = req.params.challenged;
    try {
        if (inChallenge === undefined || typeof inChallenge !== 'boolean') {
            return res.status(400).send('Invalid inChallenge status provided');
        }

        const updatedChallenger = await Players.findOneAndUpdate(
            { playerName: challenger },
            { inChallenge: inChallenge },
            { new: true }  // Returns the updated document
        );

        if (!updatedChallenger) {
            return res.status(404).send('Challenger not found');
        }

        const updatedChallenged = await Players.findOneAndUpdate(
            { playerName: challenged },
            { inChallenge: inChallenge },
            { new: true }  // Returns the updated document
        );

        if (!updatedChallenged) {
            return res.status(404).send('Challenged not found');
        }
        const channelName = challenged + "receivesAChallenge"
        const decisionChannel = challenger + "ChallengeDecision"
        const leaveDuelChannel1 = challenger + "LeftDuel"
        const leaveDuelChannel2 = challenged + "LeftDuel"


        if (inChallenge) {
            if (accept) {
                io.emit(decisionChannel, { accept: accept });
            }
            else {
                io.emit(channelName, { challenger: challenger});
            }
            
        }
        else{
            if (accept === false) {
                io.emit(decisionChannel, { accept: accept });
            }

            if (accept === null) {
                io.emit(leaveDuelChannel1);
                io.emit(leaveDuelChannel2);
            }
        }

        
        io.emit('onlinePlayersUpdated');

        res.status(200).send('Players challenge statuses updated successful');
    } catch (error) {
        console.error('Error updating players challenge status:', error);
        res.status(500).send('Error updating players challenge status');
    }
}

async function removeAPlayer(req, res) {
    
    try {
        let playerName = req.params.playerName;
        if (playerName === undefined) {
            return res.status(400).send('Player name is required');
        }
        
        
        let result = await Players.deleteOne({ playerName: playerName });
        
        if (result.deletedCount === 0) {
            
            return res.status(404).send('No player found with that name');
        }
        io.emit('onlinePlayersUpdated');
        res.status(200).send('Player deleted successfully');
        
    } catch (error) {
        console.error('Error removing the player:', error);
        res.status(500).send('Error removing the player');
    }
}

async function removeADuel(req, res) {

    try {
        let playerName = req.params.playerName;
        if (playerName === undefined) {
            return res.status(400).send('Player name is required');
        }

        // Find and delete the duel where the given playerName is either a challenger or challenged player
        let result = await Duels.deleteOne({
            $or: [
                { challengerName: playerName },
                { challengedName: playerName }
            ]
        });

        if (result.deletedCount === 0) {

            return res.status(404).send('No duel found with that player name');
        }
        io.emit('ongoingDuelsUpdated');
    
        res.status(200).send('Duel deleted successfully');
        
    } catch (error) {
        console.error('Error removing the duel:', error);
        res.status(500).send('Error removing the duel');
    }
}

export { getPlayers, getDuels, postNewPlayer, postNewDuel, updateChallengeStatus, removeAPlayer, removeADuel };