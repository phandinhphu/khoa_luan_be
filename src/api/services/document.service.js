const path = require('path');
const { RENDERED_DIR } = require('../../config/path');
const DocumentRenderFactory = require('../../render/DocumentRenderFactory');
const Document = require('../models/documents.model');
const APIFeatures = require('../../utils/apiFeatures');

class DocumentService {
    async createDocument({ title, fileName, fileType, filePath }) {
        const strategy = DocumentRenderFactory.create(fileType);

        // Lưu thông tin document vào database và lấy docId
        const document = await Document.create({ title, file_name: fileName, file_type: fileType, file_path: filePath });

        const totalPages = await strategy.prepare(document._id.toString(), filePath);

        document.total_pages = totalPages;
        await document.save();

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
            limit: queryString.limit * 1 || 10
        };
    }

    async getDocumentById(id) {
        return await Document.findById(id).select('-file_path');
    }

    getRenderedPagePath(docId, pageNumber) {
        return path.join(RENDERED_DIR, `${docId}`, `page-${pageNumber}.png`);
    }
}

module.exports = new DocumentService();