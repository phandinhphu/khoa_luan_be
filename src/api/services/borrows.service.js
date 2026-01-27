const Borrow = require('../models/borrows.model');
const Document = require('../models/documents.model');

const borrowDocument = async (userId, documentId) => {
    // 1. Check document existence and total copies
    const document = await Document.findById(documentId);
    if (!document) {
        throw new Error('Tài liệu không tồn tại');
    }

    // 2. Count current active borrows for this document
    const activeBorrowsCount = await Borrow.countDocuments({
        document_id: documentId,
        status: 'borrowed'
    });

    // 3. Compare with total_copies
    if (activeBorrowsCount >= document.total_copies) {
        throw new Error('Tài liệu này đã được mượn hết. Vui lòng quay lại sau.');
    }

    // 4. Create new Borrow record
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(borrowDate.getDate() + 14); // 14 days loan period

    const newBorrow = await Borrow.create({
        user_id: userId,
        document_id: documentId,
        borrow_date: borrowDate,
        due_date: dueDate,
        status: 'borrowed'
    });

    return newBorrow;
};

const returnDocument = async (documentId, userId) => {
    const borrow = await Borrow.findOne({
        document_id: documentId,
        user_id: userId,
        status: 'borrowed'
    });

    if (!borrow) {
        throw new Error('Record mượn không tồn tại');
    }

    borrow.return_date = new Date();

    if (borrow.status === 'borrowed') {
        borrow.status = 'returned';
    }

    await borrow.save();

    return borrow;
};

const checkAccess = async (userId, documentId) => {
    const borrow = await Borrow.findOne({
        user_id: userId,
        document_id: documentId,
        status: 'borrowed'
    });

    if (!borrow) {
        return false;
    }

    const now = new Date();
    if (now > borrow.due_date) {
        // Update status to 'overdue' or handle expiry
        await Borrow.updateOne(
            { _id: borrow._id },
            { $set: { status: 'overdue' } }
        );
        return false;
    }

    return true;
};

module.exports = {
    borrowDocument,
    returnDocument,
    checkAccess
};
