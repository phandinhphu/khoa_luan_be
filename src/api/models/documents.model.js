const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    file_name: {
        type: String,
        required: true,
    },
    file_type: {
        type: String,
        required: true,
    },
    file_path: {
        type: String,
        required: true,
    },
    total_pages: {
        type: Number,
        default: 0,
    },
    total_copies: {
        type: Number,
        default: 3,
    },
    copyright_status: {
        type: String,
        enum: [
            'PUBLIC_DOMAIN', // Tài liệu thuộc phạm vi công cộng
            'OPEN_LICENSE', // Tài liệu có giấy phép mở
            'INTERNAL_USE', // Tài liệu chỉ sử dụng nội bộ
            'AUTHOR_PERMISSION', // Tài liệu có sự cho phép của tác giả
            'UNKNOWN' // Tình trạng bản quyền không rõ ràng
        ],
        default: 'UNKNOWN'
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
})

module.exports = mongoose.model('Document', documentSchema);
