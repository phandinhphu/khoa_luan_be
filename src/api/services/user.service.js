const User = require('../models/users.model');
const ApiFeatures = require('../../utils/apiFeatures');
const { uploadImageFromBuffer, deleteImage } = require('./cloudinary.service');

/**
 * Lấy danh sách tất cả người dùng với phân trang, lọc, sắp xếp
 */
const getAllUsers = async (queryString) => {
    // Lấy danh sách người dùng với role user
    const features = new ApiFeatures(User.find({ role: 'user' }), queryString)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    
    const users = await features.query.select('-password -forgot_password_token');
    const total = await User.countDocuments({ role: 'user' });
    
    return { 
        users, 
        total,
        page: queryString.page * 1 || 1,
        limit: queryString.limit * 1 || 10
    };
};

/**
 * Lấy người dùng theo ID
 */
const getUserById = async (userId) => {
    const user = await User.findById(userId).select('-password -forgot_password_token');
    
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }
    
    return user;
};

/**
 * Tạo người dùng mới
 */
const createUser = async (userData, avatarBuffer = null) => {
    const { name, email, password, role } = userData;
    
    // Kiểm tra nếu email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email đã tồn tại trong hệ thống');
    }

    // Kiểm tra nếu tên người dùng đã tồn tại
    const existingName = await User.findOne({ name });
    if (existingName) {
        throw new Error('Tên người dùng đã được sử dụng');
    }
    
    // Upload avatar nếu có
    let avatarData = {};
    if (avatarBuffer) {
        try {
            const uploadResult = await uploadImageFromBuffer(avatarBuffer, 'user-avatars');
            avatarData = {
                avatar_url: uploadResult.url,
                public_id: uploadResult.public_id
            };
        } catch (error) {
            console.error('Lỗi khi upload avatar:', error);
            throw new Error('Lỗi khi upload avatar');
        }
    }
    
    // Tạo người dùng mới
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        ...avatarData
    });
    
    // Trả về người dùng không bao gồm mật khẩu
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.forgot_password_token;
    
    return userObject;
};

/**
 * Cập nhật người dùng theo ID
 */
const updateUser = async (userId, updateData, avatarBuffer = null) => {
    const { name, email, role } = updateData;
    
    // Kiểm tra nếu người dùng tồn tại
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }

    // Nếu name được cập nhật, kiểm tra xem nó đã được sử dụng chưa
    if (name && name !== user.name) {
        const existingUser = await User.findOne({ name });
        if (existingUser) {
            throw new Error('Tên người dùng đã được sử dụng bởi người dùng khác');
        }
    }
    
    // Nếu email được cập nhật, kiểm tra xem nó đã được sử dụng chưa
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('Email đã được sử dụng bởi người dùng khác');
        }
    }
    
    // Upload avatar mới nếu có
    if (avatarBuffer) {
        try {
            const oldPublicId = user.public_id;
            const uploadResult = await uploadImageFromBuffer(avatarBuffer, 'user-avatars', oldPublicId);
            user.avatar_url = uploadResult.url;
            user.public_id = uploadResult.public_id;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw new Error('Lỗi khi upload avatar');
        }
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    
    await user.save({ validateBeforeSave: false });
    
    // Trả về người dùng đã cập nhật không bao gồm mật khẩu
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.forgot_password_token;
    
    return userObject;
};

/**
 * Xóa người dùng theo ID
 */
const deleteUser = async (userId) => {
    const user = await User.findById(userId);
    
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }
    
    // Xóa avatar khỏi Cloudinary nếu tồn tại
    if (user.public_id) {
        await deleteImage(user.public_id);
    }
    
    await User.findByIdAndDelete(userId);
    
    return { message: 'Xóa người dùng thành công' };
};

/**
 * Đổi mật khẩu người dùng
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);
    
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }
    
    // Xác minh mật khẩu hiện tại
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        throw new Error('Mật khẩu hiện tại không đúng');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    return { message: 'Đổi mật khẩu thành công' };
};

/**
 * Cập nhật vai trò người dùng (Chỉ dành cho Admin)
 */
const updateUserRole = async (userId, newRole) => {
    const user = await User.findById(userId);
    
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }
    
    user.role = newRole;
    await user.save({ validateBeforeSave: false });
    
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.forgot_password_token;
    
    return userObject;
};

/**
 * Thống kê người dùng
 */
const getUserStats = async () => {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userCount = await User.countDocuments({ role: 'user' });
    
    return {
        total: totalUsers,
        admins: adminCount,
        users: userCount
    };
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    updateUserRole,
    getUserStats
};
