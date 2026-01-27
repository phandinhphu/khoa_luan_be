const borrowService = require('../services/borrows.service');

const createBorrow = async (req, res) => {
    try {
        const userId = req.user._id; // Req.user is populated by auth middleware
        const { document_id } = req.body;

        if (!document_id) {
            return res.status(400).json({ message: 'Document ID is required' });
        }

        const borrowRecord = await borrowService.borrowDocument(userId, document_id);

        res.status(201).json({
            message: 'Mượn thành công!',
            data: borrowRecord
        });
    } catch (error) {
        if (error.message === 'Tài liệu không tồn tại' || error.message.includes('Mượn hết')) {
            return res.status(400).json({ message: error.message });
        }
        console.error('Error creating borrow:', error); // Log internal errors
        res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
};

const returnBorrow = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user._id;

        const returnedRecord = await borrowService.returnDocument(documentId, userId);

        res.status(200).json({
            message: 'Trả tài liệu thành công!',
            data: returnedRecord
        });
    } catch (error) {
        if (error.message === 'Record mượn không tồn tại' || error.message === 'Tài liệu này không thể trả vì không ở trạng thái mượn') {
            return res.status(400).json({ message: error.message });
        }
        console.error('Error returning borrow:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
};

module.exports = {
    createBorrow,
    returnBorrow
};
