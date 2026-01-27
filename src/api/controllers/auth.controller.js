const User = require('../models/users.model');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt.util');
const redisClient = require('../../config/redis');
const { loginRateLimiter } = require('../../middlewares/rateLimit.middleware');
const bcrypt = require('bcryptjs');
const { JWT_REFRESH_EXPIRE } = require('../../utils/constants');
const ms = require('ms');

// Register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Tên, email và mật khẩu là bắt buộc' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                message: 'Đăng ký thành công',
            });
        } else {
            res.status(400).json({ message: 'Đăng ký thất bại' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
        }

        // Find user
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Clear rate limit on successful login
            await loginRateLimiter.delete(req.ip);

            // Generate tokens
            const accessToken = generateAccessToken({ id: user._id });
            const refreshToken = generateRefreshToken({ id: user._id });

            // Store refresh token in Redis (Override existing if any - single session per user implementation)
            const refreshTokenExpire = ms(JWT_REFRESH_EXPIRE) / 1000;
            await redisClient.set(`refreshToken:${user._id}`, refreshToken, 'EX', refreshTokenExpire);

            // Refresh token lưu ở cookie với flag httpOnly
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: refreshTokenExpire,
            });

            res.status(200).json({
                message: 'Đăng nhập thành công',
                data: {
                    user,
                    accessToken,
                }
            });
        } else {
            res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        // Lấy refresh token từ cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Cần cung cấp refresh token' });
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (decoded) {
            // Remove refresh token from Redis
            await redisClient.del(`refreshToken:${decoded.id}`);
        }

        // Xóa cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        });

        res.status(200).json({ message: 'Đăng xuất thành công' });
    } catch (error) {
        console.error(error);
        // Even if error (e.g. invalid token), we can consider logout successful or return 400
        res.status(200).json({ message: 'Logged out' });
    }
};

// Refresh Token
const refreshToken = async (req, res) => {
    try {
        // Lấy refresh token từ cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Cần cung cấp refresh token' });
        }

        // Verify signature
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(403).json({ message: 'Refresh Token không hợp lệ' });
        }

        // Check if token exists in Redis
        const storedToken = await redisClient.get(`refreshToken:${decoded.id}`);

        if (!storedToken) {
            // Token not found in Redis (expired or logged out)
            return res.status(403).json({ message: 'Refresh Token đã hết hạn hoặc không hợp lệ' });
        }

        // Token Rotation & Reuse Detection
        if (refreshToken !== storedToken) {
            // Token does not match the one in Redis
            // This implies someone is using an old token (possible theft/reuse)
            // SECURITY ACTION: Invalidate all tokens for this user
            await redisClient.del(`refreshToken:${decoded.id}`);
            return res.status(403).json({ message: 'Token cũ không hợp lệ. Vui lòng đăng nhập lại' });
        }

        // Generate NEW tokens
        const newAccessToken = generateAccessToken({ id: decoded.id });
        const newRefreshToken = generateRefreshToken({ id: decoded.id });

        // Rotate: Replace old token with new one in Redis
        const refreshTokenExpire = ms(JWT_REFRESH_EXPIRE) / 1000;
        await redisClient.set(`refreshToken:${decoded.id}`, newRefreshToken, 'EX', refreshTokenExpire);

        res.json({
            message: 'Refresh Token thành công',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.status(200).json({
            message: 'Lấy thông tin người dùng thành công',
            data: user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    getProfile,
};
