const fs = require('fs');
const DocumentService = require('../services/document.service');
const BorrowsService = require('../services/borrows.service');
const { streamWithWatermark } = require('../../utils/function');

/**
 * 
 * @desc Upload a document
 * @route POST /api/documents/upload
 * @access Private (Admin only)
 */
const uploadDocument = async (req, res) => {
    try {
        const file = req.file;
        const { title, total_copies, copyright_status } = req.body;

        if (!title) {
            // Xoá tệp đã tải lên nếu có
            if (file) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({ message: 'Tiêu đề là bắt buộc' });
        }

        if (!total_copies) {
            // Xoá tệp đã tải lên nếu có
            if (file) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({ message: 'Số lượng bản sao là bắt buộc' });
        }

        if (!copyright_status) {
            // Xoá tệp đã tải lên nếu có
            if (file) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({ message: 'Tình trạng bản quyền là bắt buộc' });
        }

        if (!file) {
            return res.status(400).json({ message: 'Không có tệp nào được tải lên' });
        }

        const ext = file.originalname.split('.').pop().toLowerCase();
        const fileType = ext === 'pdf' ? 'PDF' : 'DOCX';

        console.log('File path:', file.path);

        const result = await DocumentService.createDocument({
            title: title,
            total_copies: total_copies,
            copyright_status: copyright_status,
            fileName: file.filename,
            fileType: fileType,
            filePath: file.path,
        })

        res.status(201).json({ message: 'Tải lên thành công', document: result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' + error.message });
    }
}

/**
 * @desc Update a document
 * @route PUT /api/documents/:id
 * @access Private (Admin only)
 */
const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, total_copies, copyright_status } = req.body;

        const updatedDocument = await DocumentService.updateDocument(id, {
            title,
            total_copies,
            copyright_status
        });

        if (!updatedDocument) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        res.status(200).json({ message: 'Cập nhật thành công', document: updatedDocument });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' + error.message });
    }
}

/**
 * @desc Delete a document
 * @route DELETE /api/documents/:id
 * @access Private (Admin only)
 */
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDocument = await DocumentService.deleteDocument(id);

        if (!deletedDocument) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        res.status(200).json({ message: 'Xóa tài liệu thành công' });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' + error.message });
    }
}

/**
 * @desc Read a specific page of a document with watermark
 * @route GET /api/documents/:documentId/pages/:pageNumber
 * @access Private (Authenticated users with access)
 */
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

        const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const watermarkText = `${req.user._id} | ${req.user.name} | ${clientIp} | ${new Date().toISOString().slice(0, 10)}`;

        await streamWithWatermark(pagePath, watermarkText, res);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' + error.message });
    }
}

/**
 * @desc Get all documents with pagination and filtering
 * @route GET /api/documents
 * @access Public
 */
const getAllDocuments = async (req, res) => {
    try {
        const result = await DocumentService.getAllDocuments(req.query);
        res.status(200).json({
            status: 'success',
            results: result.documents.length,
            total: result.total,
            currentPage: result.page,
            totalPages: Math.ceil(result.total / result.limit),
            data: {
                documents: result.documents
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
}

/**
 * @desc Get a document by ID with access information
 * @route GET /api/documents/:id
 * @access Public (Access information depends on authentication)
 */
const getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user._id : null;

        const document = await DocumentService.getDocumentById(id);

        if (!document) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        const hasAccess = userId ? await BorrowsService.checkAccess(userId, id) : false;

        res.status(200).json({
            status: 'success',
            data: {
                document,
                hasAccess
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
}

/**
 * @desc Preview the first page of a document with watermark
 * @route GET /api/documents/:documentId/preview
 * @access Public
 */
const previewDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await DocumentService.getDocumentById(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        const pagePath = DocumentService.getRenderedPagePath(documentId, 1);

        if (!fs.existsSync(pagePath)) {
            return res.status(404).json({ message: 'Trang không tồn tại' });
        }

        const watermarkText = `${new Date().toISOString().slice(0, 10)}`;

        await streamWithWatermark(pagePath, watermarkText, res);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' + error.message });
    }
}

module.exports = {
    uploadDocument,
    updateDocument,
    deleteDocument,
    readPage,
    getAllDocuments,
    getDocumentById,
    previewDocument
};