import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  playerName: { type: String, required: true, unique: true },
  inChallenge: { type: Boolean, default: false },
  ready: { type: Boolean, default: false }
});

const Players = mongoose.model('Players', playerSchema);

export { Players };