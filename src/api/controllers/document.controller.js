const fs = require('fs');
const DocumentService = require('../services/document.service');
const BorrowsService = require('../services/borrows.service');
const { streamWithWatermark } = require('../../utils/function');

const uploadDocument = async (req, res) => {
    try {
        const file = req.file;
        const { title } = req.body;

        if (!title) {
            // Xoá tệp đã tải lên nếu có
            if (file) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({ message: 'Tiêu đề là bắt buộc' });
        }

        if (!file) {
            return res.status(400).json({ message: 'Không có tệp nào được tải lên' });
        }

        const ext = file.originalname.split('.').pop().toLowerCase();
        const fileType = ext === 'pdf' ? 'PDF' : 'DOCX';

        console.log('File path:', file.path);

        const result = await DocumentService.createDocument({
            title: req.body.title,
            fileName: file.filename,
            fileType: fileType,
            filePath: file.path,
        })

        res.status(201).json({ message: 'Tải lên thành công', document: result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' + error.message });
    }
}

const readPage = async (req, res) => {
    try {
        const { documentId, pageNumber } = req.params;
        const userId = req.user._id;

        const hasAccess = await BorrowsService.checkAccess(userId, documentId);

        if (!hasAccess) {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập tài liệu này hoặc đã hết hạn mượn.' });
        }

        const pagePath = DocumentService.getRenderedPagePath(documentId, pageNumber);

        if (!fs.existsSync(pagePath)) {
            return res.status(404).json({ message: 'Trang không tồn tại' });
        }

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-store');

        const watermarkText = `${req.user._id} | ${new Date().toISOString().slice(0,10)}`;

        await streamWithWatermark(pagePath, watermarkText, res);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' + error.message });
    }
}

module.exports = {
    uploadDocument,
    readPage,
};