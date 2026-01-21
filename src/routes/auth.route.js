const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken } = require('../api/controllers/auth.controller');
const { loginLimiterMiddleware } = require('../middlewares/rateLimit.middleware');

// Routes
router.post('/register', register);
router.post('/login', loginLimiterMiddleware, login); // Apply rate limiter to login
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

module.exports = router;
