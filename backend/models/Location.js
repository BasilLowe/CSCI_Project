const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const locationSchema = new mongoose.Schema({
    venueid: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    latitude: {
        type: String,
        required: true
    },
    longitude: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    comments: [commentSchema]
});

module.exports = mongoose.model('Location', locationSchema);