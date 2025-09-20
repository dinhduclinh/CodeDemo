const mongoose = require('mongoose');
const Borrowing = require('../models/borrowings');
const Device = require('../models/devices');
const User = require('../models/users');

const formatBorrowingResponse = (borrowingDoc) => {
    const borrowing = borrowingDoc?.toObject ? borrowingDoc.toObject() : borrowingDoc;
    if (borrowing && borrowing.user && typeof borrowing.user === 'object') {
        borrowing.user = {
            _id: borrowing.user._id,
            name: borrowing.user.name,
            email: borrowing.user.email
        };
    }
    if (borrowing && borrowing.device && typeof borrowing.device === 'object') {
        borrowing.device = {
            _id: borrowing.device._id,
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

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ code: 400, message: 'Invalid User ID format' });
        }

        const borrowings = await Borrowing.find({ user: id }).populate('device').populate('user');
        const formatted = borrowings.map(formatBorrowingResponse);
        res.status(200).json({ code: 200, message: 'Borrowings fetched successfully', borrowings: formatted });
    } catch (error) {
        console.error('Error fetching borrowings by user ID:', error);
        res.status(500).json({ code: 500, message: 'Internal server error', error: error.message });
    }
}

module.exports.createBorrowing = async (req, res) => {
    try {
        const { deviceId, userId } = req.body;

        const deviceDoc = await Device.findById(deviceId);
        const userDoc = await User.findById(userId);

        if (deviceDoc.status === 'borrowed') {
            return res.status(400).json({ code: 400, message: 'Device is already borrowed' });
        }

        // Update device status to borrowed
        deviceDoc.status = 'borrowed';
        await deviceDoc.save();

        // Create borrowing record
        const borrowing = await Borrowing.create({
            device: deviceId,
            user: userId,
            borrowDate: new Date(),
            status: 'pending'
        });

        // Populate the response
        const populatedBorrowing = await Borrowing.findById(borrowing._id)
            .populate('device', 'name type status')
            .populate('user', 'name email');

        const formatted = formatBorrowingResponse(populatedBorrowing);

        res.status(201).json({
            code: 201,
            message: 'Borrowing created successfully',
            borrowing: formatted
        });
    } catch (error) {
        console.error('Error creating borrowing:', error);
        res.status(500).json({
            code: 500,
            message: 'Internal server error',
            error: error.message
        });
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

module.exports.acceptBorrowing = async (req, res) => {
    try {
        const borrowing = await Borrowing.findById(req.params.id);
        if (!borrowing) {
            return res.status(400).json({ code: 400, message: 'Borrowing not found' });
        }
        
        if (borrowing.status === 'pending') {
            borrowing.status = 'accept';
        } else if (borrowing.status === 'cancel-pending') {
            borrowing.status = 'cancel';
            const device = await Device.findByIdAndUpdate(borrowing.device, { status: 'available' }, { new: true });
        } else if (borrowing.status === 'return-pending') {
            borrowing.status = 'return';
            const device = await Device.findByIdAndUpdate(borrowing.device, { status: 'available' }, { new: true });
        } else {
            return res.status(400).json({ code: 400, message: 'Borrowing is not in a valid state for acceptance' });
        }
        
        await borrowing.save();
        
        res.status(200).json({ code: 200, message: 'Borrowing accepted successfully', borrowing }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.rejectBorrowing = async (req, res) => {
    try {
        const borrowing = await Borrowing.findById(req.params.id);
        if (!borrowing) {
            return res.status(400).json({ code: 400, message: 'Borrowing not found' });
        }
        
        if (borrowing.status === 'pending') {
            borrowing.status = 'reject';
        } else if (borrowing.status === 'cancel-pending') {
            borrowing.status = 'cancel';
            const device = await Device.findByIdAndUpdate(borrowing.device, { status: 'available' }, { new: true });
        } else if (borrowing.status === 'return-pending') {
            borrowing.status = 'return';
            const device = await Device.findByIdAndUpdate(borrowing.device, { status: 'available' }, { new: true });
        } else {
            return res.status(400).json({ code: 400, message: 'Borrowing is not in a valid state for rejection' });
        }
        
        await borrowing.save();
        res.status(200).json({ code: 200, message: 'Borrowing rejected successfully', borrowing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.cancelBorrowing = async (req, res) => {
    try {
        const borrowing = await Borrowing.findById(req.params.id);
        if (!borrowing) {
            return res.status(400).json({ code: 400, message: 'Borrowing not found' });
        }
        
        if (borrowing.status === 'pending' || borrowing.status === 'accept' || borrowing.status === 'accepted') {
            borrowing.status = 'cancel-pending';
            await borrowing.save();
            res.status(200).json({ code: 200, message: 'Borrowing cancellation requested successfully', borrowing });
        } else {
            return res.status(400).json({ code: 400, message: 'Borrowing cannot be cancelled in current state' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.returnBorrowing = async (req, res) => {
    try {
        const borrowing = await Borrowing.findById(req.params.id);
        if (!borrowing) {
            return res.status(400).json({ code: 400, message: 'Borrowing not found' });
        }
        
        if (borrowing.status === 'accept' || borrowing.status === 'accepted') {
            borrowing.status = 'return-pending';
            await borrowing.save();
            res.status(200).json({ code: 200, message: 'Borrowing return requested successfully', borrowing });
        } else {
            return res.status(400).json({ code: 400, message: 'Borrowing cannot be returned in current state' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}