const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Devices',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
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

const Borrowing = mongoose.model('Borrowings', borrowingSchema, 'borrowings');
module.exports = Borrowing;