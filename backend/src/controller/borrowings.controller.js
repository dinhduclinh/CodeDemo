const mongoose = require('mongoose');
const Borrowing = require('../models/borrowings');
const Device = require('../models/devices');
const User = require('../models/users');

const formatBorrowingResponse = (borrowingDoc) => {
    const borrowing = borrowingDoc?.toObject ? borrowingDoc.toObject() : borrowingDoc;
    if (borrowing && borrowing.user && typeof borrowing.user === 'object') {
        borrowing.user = {
            name: borrowing.user.name,
            email: borrowing.user.email
        };
    }
    if (borrowing && borrowing.device && typeof borrowing.device === 'object') {
        borrowing.device = {
            name: borrowing.device.name,
            type: borrowing.device.type,
            status: borrowing.device.status
        };
    }
    return borrowing;
}

module.exports.getAllBorrowings = async (req, res) => {
    try {
        const borrowings = await Borrowing.find().populate('device').populate('user');
              
        const formatted = borrowings.map(formatBorrowingResponse);
        res.status(200).json({ code: 200, message: 'Borrowings fetched successfully', borrowings: formatted });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getBorrowingById = async (req, res) => {
    try {
        const { id } = req.params;

        const borrowing = await Borrowing.findById(id).populate('device').populate('user');
        if (!borrowing) {
            return res.status(404).json({ code: 404, message: 'Borrowing not found' });
        }
        const formatted = formatBorrowingResponse(borrowing);
        res.status(200).json({ code: 200, message: 'Borrowing fetched successfully', borrowing: formatted });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getBorrowingByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ code: 400, message: 'User ID is required' });
        }
        const borrowing = await Borrowing.find({ user: id }).populate('device').populate('user');
        const formatted = borrowing.map(formatBorrowingResponse);
        res.status(200).json({ code: 200, message: 'Borrowing fetched successfully', borrowing: formatted });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.createBorrowing = async (req, res) => {
    try {
        const { device, user } = req.body;
        if (!device || !user) {
            return res.status(400).json({ code: 400, message: 'Device ID and User ID are required' });
        }
        const deviceDoc = await Device.findById(device);
        const userDoc = await User.findById(user);

        if (!deviceDoc || !userDoc) {
            return res.status(404).json({ code: 404, message: 'Device or user not found' });
        }

        if (deviceDoc.status === 'borrowed') {
            return res.status(400).json({ code: 400, message: 'Device is already borrowed' });
        }
        deviceDoc.status = 'borrowed';
        await deviceDoc.save();
        const borrowing = await Borrowing.create({ device, user, borrowDate: new Date(), status: 'borrowed' });
        res.status(201).json({ code: 201, message: 'Borrowing created successfully', borrowing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.updateBorrowing = async (req, res) => {
    try {
        const { device, user } = req.body;
        if (!device || !user) {
            return res.status(400).json({ code: 400, message: 'Device ID and User ID are required' });
        }
        const deviceDoc = await Device.findById(device);
        const userDoc = await User.findById(user);
        if (!deviceDoc || !userDoc) {
            return res.status(400).json({ code: 400, message: 'Device or User not found' });
        }
        if (deviceDoc.status === 'borrowed') {
            return res.status(400).json({ code: 400, message: 'Device is already borrowed' });
        }
        deviceDoc.status = 'borrowed';
        await deviceDoc.save();
        const borrowing = await Borrowing.findByIdAndUpdate(req.params.id, { device, user, borrowDate: new Date(), status: 'borrowed' }, { new: true });
        res.status(200).json({ code: 200, message: 'Borrowing updated successfully', borrowing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.deleteBorrowing = async (req, res) => {
    try {
        const borrowing = await Borrowing.findById(req.params.id);
        if (!borrowing) {
            return res.status(400).json({ code: 400, message: 'Borrowing not found' });
        }
        const device = await Device.findById(borrowing.device);
        if (!device) {
            return res.status(400).json({ code: 400, message: 'Device not found' });
        }
        device.status = 'available';
        await device.save();
        await Borrowing.findByIdAndDelete(req.params.id);
        res.status(200).json({ code: 200, message: 'Borrowing deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}