const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
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
    borrow_date: {
        type: Date,
        required: true,
    },
    due_date: {
        type: Date,
        required: true,
    },
    return_date: {
        type: Date,
        required: false,
    },
    status: {
        type: String,
        enum: ['borrowed', 'returned'],
        default: 'borrowed',
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
})

module.exports = mongoose.model('Borrow', borrowSchema);
