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
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
})

module.exports = mongoose.model('ForumPost', forumPostSchema);