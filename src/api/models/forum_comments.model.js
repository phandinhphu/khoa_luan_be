const mongoose = require('mongoose');

const forumCommentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumPost',
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

module.exports = mongoose.model('ForumComment', forumCommentSchema);