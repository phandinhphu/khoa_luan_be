const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.route');
const documentRoutes = require('./document.route');
const borrowRoutes = require('./borrows.route');
const userRoutes = require('./user.route');

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/borrows', borrowRoutes);
router.use('/users', userRoutes);

module.exports = router;