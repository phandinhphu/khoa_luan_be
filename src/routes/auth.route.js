const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken, getProfile } = require('../api/controllers/auth.controller');
const { loginLimiterMiddleware } = require('../middlewares/rateLimit.middleware');
const { protect } = require('../middlewares/auth.middleware');

// Routes
router.post('/register', register);
router.post('/login', loginLimiterMiddleware, login); // Apply rate limiter to login
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/profile', protect, getProfile);

module.exports = router;
