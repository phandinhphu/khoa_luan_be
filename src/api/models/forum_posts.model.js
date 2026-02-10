const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    document_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        default: null, // Bài viết có thể không liên quan đến tài liệu nào
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
    },
    reviewed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    reviewed_at: {
        type: Date,
        default: null,
    },
    reject_reason: {
        type: String,
        default: null,
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
})

module.exports = mongoose.model('ForumPost', forumPostSchema);