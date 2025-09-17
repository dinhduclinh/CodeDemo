const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    borrowDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    }
})

const Borrowing = mongoose.model('Borrowing', borrowingSchema, 'borrowings');
module.exports = Borrowing;