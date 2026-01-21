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
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
})

module.exports = mongoose.model('Document', documentSchema);
