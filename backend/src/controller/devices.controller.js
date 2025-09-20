const Device = require('../models/devices');
const Borrowing = require('../models/borrowings');
const User = require('../models/users');


module.exports.getAllDevices = async (req, res) => {
    try {
        const devices = await Device.find();
        res.status(200).json({ code: 200, message: 'Devices fetched successfully', devices });
    } catch (error) {
        res.status(500).json({ code: 500, message: 'Internal server error', error: error.message });
    }

}

module.exports.getDeviceById = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        res.status(200).json({ code: 200, message: 'Device fetched successfully', device });
    } catch (error) {
        res.status(500).json({ code: 500, message: 'Internal server error', error: error.message });
    }
}
module.exports.searchDevice = async (req, res) => {
    try {
        const { name, type, status, location } = req.query;
        const device = await Device.find({ name, type, status, location });
        res.status(200).json({ code: 200, message: 'Device fetched successfully', device });
    } catch (error) {
        res.status(500).json({ code: 500, message: 'Internal server error', error: error.message });
    }
}

module.exports.createDevice = async (req, res) => {
    try {
        const { name, type, status, location } = req.body;
        if (!name || !type || !status || !location) {
            return res.status(400).json({ code: 400, message: 'All fields are required' });
        }
        const device = await Device.create({ name, type, status, location });
        res.status(201).json({ code: 201, message: 'Device created successfully', device });
    } catch (error) {
        res.status(500).json({ code: 500, message: 'Internal server error', error: error.message });
    }
}

module.exports.updateDevice = async (req, res) => {
    try {
        const { name, type, location } = req.body;
        if (!name || !type || !location) {
            return res.status(400).json({ code: 400, message: 'All fields are required' });
        }
        const device = await Device.findByIdAndUpdate(req.params.id, { name, type, location }, { new: true });
        res.status(200).json({ code: 200, message: 'Device updated successfully', device });
    } catch (error) {
        res.status(500).json({ code: 500, message: 'Internal server error', error: error.message });
    }
}

module.exports.deleteDevice = async (req, res) => {
    try {
        const device = await Device.findByIdAndDelete(req.params.id);
        if (!device) {
            return res.status(400).json({ code: 400, message: 'Device not found' });
        }
        res.status(200).json({ code: 200, message: 'Device deleted successfully' });
    } catch (error) {
        res.status(500).json({ code: 500, message: 'Internal server error', error: error.message });
    }
}

module.exports.changeDeviceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const device = await Device.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ code: 200, message: 'Device status changed successfully', device });
    } catch (error) {
        res.status(500).json({ code: 500, message: 'Internal server error', error: error.message });
    }
}