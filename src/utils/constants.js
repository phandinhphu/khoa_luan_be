const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET
    ? process.env.JWT_SECRET
    : (() => {
        throw new Error('JWT_SECRET chưa được định nghĩa trong file .env');
    })();
const JWT_EXPIRES = process.env.JWT_EXPIRES
    ? process.env.JWT_EXPIRES
    : (() => {
        throw new Error('JWT_EXPIRES chưa được định nghĩa trong file .env');
    })();
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
    ? process.env.JWT_REFRESH_SECRET
    : (() => {
        throw new Error('JWT_REFRESH_SECRET chưa được định nghĩa trong file .env');
    })();
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE
    ? process.env.JWT_REFRESH_EXPIRE
    : (() => {
        throw new Error('JWT_REFRESH_EXPIRE chưa được định nghĩa trong file .env');
    })();

const FRONTEND_URL = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL
    : (() => {
        throw new Error('FRONTEND_URL chưa được định nghĩa trong file .env');
    })();
const PORT = process.env.PORT
    ? process.env.PORT
    : (() => {
        throw new Error('PORT chưa được định nghĩa trong file .env');
    })();

const MONGO_URI = process.env.MONGO_URI
    ? process.env.MONGO_URI
    : (() => {
        throw new Error('MONGO_URI chưa được định nghĩa trong file .env');
    })();

// Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
    ? process.env.CLOUDINARY_CLOUD_NAME
    : (() => {
        throw new Error('CLOUDINARY_CLOUD_NAME chưa được định nghĩa trong file .env');
    })();
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
    ? process.env.CLOUDINARY_API_KEY
    : (() => {
        throw new Error('CLOUDINARY_API_KEY chưa được định nghĩa trong file .env');
    })();
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET
    ? process.env.CLOUDINARY_API_SECRET
    : (() => {
        throw new Error('CLOUDINARY_API_SECRET chưa được định nghĩa trong file .env');
    })();

// Google Auth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    ? process.env.GOOGLE_CLIENT_ID
    : (() => {
        throw new Error('GOOGLE_CLIENT_ID chưa được định nghĩa trong file .env');
    })();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
    ? process.env.GOOGLE_CLIENT_SECRET
    : (() => {
        throw new Error('GOOGLE_CLIENT_SECRET chưa được định nghĩa trong file .env');
    })();
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL
    ? process.env.GOOGLE_CALLBACK_URL
    : (() => {
        throw new Error('GOOGLE_CALLBACK_URL chưa được định nghĩa trong file .env');
    })();

// Redis
const REDIS_HOST = process.env.REDIS_HOST
    ? process.env.REDIS_HOST
    : (() => {
        throw new Error('REDIS_HOST chưa được định nghĩa trong file .env');
    })();
const REDIS_PORT = process.env.REDIS_PORT
    ? process.env.REDIS_PORT
    : (() => {
        throw new Error('REDIS_PORT chưa được định nghĩa trong file .env');
    })();
const REDIS_PASSWORD = process.env.REDIS_PASSWORD
    ? process.env.REDIS_PASSWORD
    : (() => {
        throw new Error('REDIS_PASSWORD chưa được định nghĩa trong file .env');
    })();

// Rate Limit
const RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW
    ? process.env.RATE_LIMIT_WINDOW
    : (() => {
        throw new Error('RATE_LIMIT_WINDOW chưa được định nghĩa trong file .env');
    })();
const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX
    ? process.env.RATE_LIMIT_MAX
    : (() => {
        throw new Error('RATE_LIMIT_MAX chưa được định nghĩa trong file .env');
    })();

// Email
const EMAIL_USER = process.env.EMAIL_USER
    ? process.env.EMAIL_USER
    : (() => {
        throw new Error('EMAIL_USER chưa được định nghĩa trong file .env');
    })();
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD
    ? process.env.EMAIL_PASSWORD
    : (() => {
        throw new Error('EMAIL_PASSWORD chưa được định nghĩa trong file .env');
    })();

module.exports = {
    JWT_SECRET,
    JWT_EXPIRES,
    JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRE,
    FRONTEND_URL,
    PORT,
    MONGO_URI,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASSWORD,
    RATE_LIMIT_WINDOW,
    RATE_LIMIT_MAX,
    EMAIL_USER,
    EMAIL_PASSWORD,
};