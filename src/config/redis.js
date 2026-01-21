const Redis = require('ioredis');
const { REDIS_HOST, REDIS_PORT } = require('../utils/constants');

const redis = new Redis({
    host: REDIS_HOST || 'localhost',
    port: REDIS_PORT || 6379,
    // password: REDIS_PASSWORD, // Config if needed
});

redis.on('connect', () => {
    console.log('Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = redis;
