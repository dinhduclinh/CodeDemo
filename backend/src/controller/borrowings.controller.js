const Borrowing = require('../models/borrowings');
const Device = require('../models/devices');
const User = require('../models/users');

module.exports.getAllBorrowings = async (req, res) => {
    try {
        const borrowings = await Borrowing.find();
        res.status(200).json({ code: 200, message: 'Borrowings fetched successfully', borrowings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getBorrowingById = async (req, res) => {
    try {
        const borrowing = await Borrowing.findById(req.params.id);
        res.status(200).json({ code: 200, message: 'Borrowing fetched successfully', borrowing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getBorrowingByUserId = async (req, res) => {
    try {
        const userId = req.params;
        if (!userId) {
            return res.status(400).json({ code: 400, message: 'User ID is required' });
        }
        const borrowing = await Borrowing.find({ userId });
        res.status(200).json({ code: 200, message: 'Borrowing fetched successfully', borrowing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.createBorrowing = async (req, res) => {
    try {
        const { deviceId, userId } = req.body;
        if (!deviceId || !userId) {
            return res.status(400).json({ code: 400, message: 'Device ID and User ID are required' });
        }
        const device = await Device.findById(deviceId);
        const user = await User.findById(userId);
        if (!device || !user) {
            return res.status(400).json({ code: 400, message: 'Device or User not found' });
        }
        if (device.status === 'borrowed') {
            return res.status(400).json({ code: 400, message: 'Device is already borrowed' });
        }
        device.status = 'borrowed';
        await device.save();
        const borrowing = await Borrowing.create({ deviceId, userId, borrowDate: new Date(), status: 'borrowed' });
        res.status(201).json({ code: 201, message: 'Borrowing created successfully', borrowing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.updateBorrowing = async (req, res) => {
    try {
        const { deviceId, userId } = req.body;
        if (!deviceId || !userId) {
            return res.status(400).json({ code: 400, message: 'Device ID and User ID are required' });
        }
        const device = await Device.findById(deviceId);
        const user = await User.findById(userId);
        if (!device || !user) {
            return res.status(400).json({ code: 400, message: 'Device or User not found' });
        }
        if (device.status === 'borrowed') {
            return res.status(400).json({ code: 400, message: 'Device is already borrowed' });
        }
        device.status = 'borrowed';
        await device.save();
        const borrowing = await Borrowing.findByIdAndUpdate(req.params.id, { deviceId, userId, borrowDate: new Date(), status: 'borrowed' }, { new: true });
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
        const device = await Device.findById(borrowing.deviceId);
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