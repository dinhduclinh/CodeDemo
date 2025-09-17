const express = require('express');
const borrowingController = require('../controller/borrowings.controller');
const router = express.Router();

router.get('/', borrowingController.getAllBorrowings);
router.get('/:id', borrowingController.getBorrowingById);
router.get('/user/:id', borrowingController.getBorrowingByUserId);
router.post('/', borrowingController.createBorrowing);
router.put('/:id', borrowingController.updateBorrowing);
router.delete('/:id', borrowingController.deleteBorrowing);

module.exports = router;