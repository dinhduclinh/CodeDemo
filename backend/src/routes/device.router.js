const express = require('express');
const devicesController = require('../controller/devices.controller');
const router = express.Router();

router.get('/', devicesController.getAllDevices);
router.get('/:id', devicesController.getDeviceById);
router.get('/search', devicesController.searchDevice);
router.post('/', devicesController.createDevice);
router.put('/:id', devicesController.updateDevice);
router.delete('/:id', devicesController.deleteDevice);

module.exports = router;