const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true,
        ref: 'Event'
    },
    userEmail: {
        type: String,
        required: true,
        ref: 'User'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'cancelled'],
        default: 'active'
    }
});

module.exports = mongoose.model('Booking', bookingSchema); 