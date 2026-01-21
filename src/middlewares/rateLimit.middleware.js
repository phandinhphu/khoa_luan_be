const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('../config/redis');

// Rate limiter for login - max 5 consecutive fails by IP per 15 minutes
const loginRateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail_ip',
    points: 5, // Number of points
    duration: 60 * 15, // Per 15 minutes
    blockDuration: 60 * 15, // Block for 15 minutes
});

const loginLimiterMiddleware = (req, res, next) => {
    loginRateLimiter.consume(req.ip)
        .then(() => {
            next();
        })
        .catch((rejRes) => {
            res.status(429).json({ message: 'Too many login attempts, please try again after 15 minutes' });
        });
};

// General rate limiter - max 100 requests per minute per IP
const generalRateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'general_limit',
    points: 100, // 100 requests
    duration: 60, // Per 60 seconds
});

const generalLimiterMiddleware = (req, res, next) => {
    generalRateLimiter.consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).json({ message: 'Too many requests, please slow down' });
        });
};

module.exports = {
    loginLimiterMiddleware,
    generalLimiterMiddleware,
    loginRateLimiter, // Exported to be reused if needed (e.g. to delete key on success)
};
