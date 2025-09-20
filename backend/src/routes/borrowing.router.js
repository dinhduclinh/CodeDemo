const express = require('express');
const borrowingController = require('../controller/borrowings.controller');
const router = express.Router();

router.get('/', borrowingController.getAllBorrowings);
router.get('/user/:id', borrowingController.getBorrowingByUserId);
router.get('/:id', borrowingController.getBorrowingById);
router.post('/', borrowingController.createBorrowing);
router.put('/:id', borrowingController.updateBorrowing);
router.delete('/:id', borrowingController.deleteBorrowing);
router.put('/accept/:id', borrowingController.acceptBorrowing);
router.put('/reject/:id', borrowingController.rejectBorrowing);
router.put('/cancel/:id', borrowingController.cancelBorrowing);
router.put('/return/:id', borrowingController.returnBorrowing);

module.exports = router;