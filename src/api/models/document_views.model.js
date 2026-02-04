/**
 * Model dùng để lưu trữ thông tin về việc người dùng xem tài liệu
 */
const mongoose = require('mongoose');

const documentViewSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    document_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },
    viewed_at: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
})

module.exports = mongoose.model('DocumentView', documentViewSchema);