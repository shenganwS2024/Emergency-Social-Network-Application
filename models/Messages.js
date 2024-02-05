const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: String,
    content: String,
    timestamp: Date
});

module.exports = mongoose.model('Messages', messageSchema);