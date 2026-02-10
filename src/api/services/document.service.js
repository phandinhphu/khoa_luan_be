const path = require('path');
const fs = require('fs');
const { RENDERED_DIR, ORIGINAL_DIR } = require('../../config/path');
const DocumentRenderFactory = require('../../render/DocumentRenderFactory');
const Document = require('../models/documents.model');
const DocumentReview = require('../models/document_reviews.model');
const APIFeatures = require('../../utils/apiFeatures');

class DocumentService {
    async createDocument({ title, fileName, fileType, filePath, total_copies, copyright_status }) {
        const strategy = DocumentRenderFactory.create(fileType);

        // Lưu thông tin document vào database và lấy docId
        const document = await Document.create({
            title,
            file_name: fileName,
            file_type: fileType,
            file_path: filePath,
            total_copies,
            copyright_status,
        });
        const totalPages = await strategy.prepare(document._id.toString(), filePath);

        document.total_pages = totalPages;
        await document.save();

        return document;
    }

    async updateDocument(documentId, updateData) {
        const document = await Document.findByIdAndUpdate(documentId, updateData, { new: true });
        return document;
    }

    async deleteDocument(documentId) {
        const document = await Document.findByIdAndDelete(documentId);
        
        if (!document) {
            return null;
        }

        // Xóa file gốc (có thể là DOCX hoặc PDF)
        if (document.file_path && fs.existsSync(document.file_path)) {
            fs.unlinkSync(document.file_path);
        }

        // Xóa file PDF đã chuyển đổi trong thư mục original (nếu là DOCX)
        if (document.file_type === 'DOCX') {
            const convertedPdfPath = path.join(ORIGINAL_DIR, `${documentId}.pdf`);
            if (fs.existsSync(convertedPdfPath)) {
                fs.unlinkSync(convertedPdfPath);
            }
        }

        // Xóa thư mục rendered và tất cả các trang bên trong
        const renderedDir = path.join(RENDERED_DIR, documentId.toString());
        if (fs.existsSync(renderedDir)) {
            fs.rmSync(renderedDir, { recursive: true, force: true });
        }

        return document;
    }

    async getAllDocuments(queryString) {
        // Hide file_path
        const features = new APIFeatures(Document.find().select('-file_path'), queryString)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const documents = await features.query;
        const total = await Document.countDocuments(features.queryString); // Note: countDocuments might need filtering logic too, simplest is just total in DB or filtered count.
        // Better: count based on filter.
        // Re-creating query object for count
        const countFeatures = new APIFeatures(Document.find().select('-file_path'), queryString).filter();
        const totalDocuments = await countFeatures.query.countDocuments();

        return {
            documents,
            total: totalDocuments,
            page: queryString.page * 1 || 1,
            limit: queryString.limit * 1 || 10,
        };
    }

    async getDocumentById(id) {
        return await Document.findById(id).select('-file_path');
    }

    getRenderedPagePath(docId, pageNumber) {
        return path.join(RENDERED_DIR, `${docId}`, `page-${pageNumber}.png`);
    }

    async createReviewDocument(userId, documentId, data) {
        const document = await Document.findById(documentId);

        if (!document) {
            throw new Error('Document not found');
        }

        const review = await DocumentReview.create({
            user_id: userId,
            document_id: documentId,
            rating: data.rating,
            comment: data.comment || '',
        });

        return review;
    }

    async getReviewsByDocumentId(documentId, queryString) {
        const features = new APIFeatures(
            DocumentReview.find({ document_id: documentId }).populate('user_id', 'name email, avatar_url'),
            queryString
        )
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const reviews = await features.query;
        const total = await DocumentReview.countDocuments({ document_id: documentId });

        return {
            reviews,
            total,
            page: queryString.page * 1 || 1,
            limit: queryString.limit * 1 || 10,
        };
    }

    async checkReviewExists(userId, documentId) {
        const existingReview = await DocumentReview.findOne({
            user_id: userId,
            document_id: documentId,
        });

        return !!existingReview;
    }
}

module.exports = new DocumentService();
