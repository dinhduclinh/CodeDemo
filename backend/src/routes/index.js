const express = require('express');
const deviceRoutes = require('./device.router');
const borrowingRoutes = require('./borrowing.router');
const router = express.Router();


router.use('/api/devices', deviceRoutes);
router.use('/api/borrowings', borrowingRoutes);

module.exports = router;
