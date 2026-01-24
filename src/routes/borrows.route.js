const express = require('express');
const router = express.Router();
const borrowsController = require('../api/controllers/borrows.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/', protect, borrowsController.createBorrow);
router.post('/return/:borrowId', protect, borrowsController.returnBorrow);

module.exports = router;
