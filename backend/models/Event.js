const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventid: { type: String, required: true },
    title: { type: String, required: true },
    venue: { type: String, required: true },
    date: { type: String, required: true },
    duration: { type: String, required: true },
    descre: { type: String, required: true },
    pre: { type: String, required: true },
    eventID: { type: String, required: false, default: null }
});

module.exports = mongoose.model('Event', eventSchema);