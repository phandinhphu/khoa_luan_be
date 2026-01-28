const userService = require('../services/user.service');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
    try {
        const { users, total, page, limit } = await userService.getAllUsers(req.query);
        
        res.status(200).json({
            success: true,
            total,
            count: users.length,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách người dùng'
        });
    }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'Người dùng không tồn tại') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin người dùng'
        });
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user._id);
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin profile'
        });
    }
};

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin: tên, email và mật khẩu'
            });
        }
        
        // Get avatar buffer if file was uploaded
        const avatarBuffer = req.file ? req.file.buffer : null;
        
        const user = await userService.createUser({ name, email, password, role }, avatarBuffer);
        
        res.status(201).json({
            success: true,
            message: 'Tạo người dùng thành công',
            data: user
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'Email đã tồn tại trong hệ thống') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        if (error.message === 'Tên người dùng đã được sử dụng') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        if (error.message === 'Lỗi khi upload avatar') {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo người dùng'
        });
    }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        // Get avatar buffer if file was uploaded
        const avatarBuffer = req.file ? req.file.buffer : null;
        
        const user = await userService.updateUser(
            req.params.id,
            { name, email, role },
            avatarBuffer
        );
        
        res.status(200).json({
            success: true,
            message: 'Cập nhật người dùng thành công',
            data: user
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'Người dùng không tồn tại') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error.message === 'Email đã được sử dụng bởi người dùng khác') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        if (error.message === 'Tên người dùng đã được sử dụng bởi người dùng khác') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        if (error.message === 'Lỗi khi upload avatar') {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật người dùng'
        });
    }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        
        // Get avatar buffer if file was uploaded
        const avatarBuffer = req.file ? req.file.buffer : null;
        
        const user = await userService.updateUser(
            req.user._id,
            { name, email },
            avatarBuffer
        );
        
        res.status(200).json({
            success: true,
            message: 'Cập nhật profile thành công',
            data: user
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'Email đã được sử dụng bởi người dùng khác') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        if (error.message === 'Tên người dùng đã được sử dụng bởi người dùng khác') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        if (error.message === 'Lỗi khi upload avatar') {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật profile'
        });
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Xóa người dùng thành công'
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'Người dùng không tồn tại') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa người dùng'
        });
    }
};

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            });
        }
        
        await userService.changePassword(req.user._id, currentPassword, newPassword);
        
        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'Mật khẩu hiện tại không đúng') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đổi mật khẩu'
        });
    }
};

/**
 * @desc    Update user role
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role không hợp lệ. Chỉ chấp nhận: user hoặc admin'
            });
        }
        
        const user = await userService.updateUserRole(req.params.id, role);
        
        res.status(200).json({
            success: true,
            message: 'Cập nhật role thành công',
            data: user
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'Người dùng không tồn tại') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật role'
        });
    }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
const getUserStats = async (req, res) => {
    try {
        const stats = await userService.getUserStats();
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê người dùng'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    getProfile,
    createUser,
    updateUser,
    updateProfile,
    deleteUser,
    changePassword,
    updateUserRole,
    getUserStats
};
