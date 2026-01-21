const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.route');
const documentRoutes = require('./document.route');

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);

module.exports = router;