const path = require('path');
const { RENDERED_DIR } = require('../config/path');
const DocumentRenderFactory = require('../render/DocumentRenderFactory');
const Document = require('../api/models/documents.model');

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

    getRenderedPagePath(docId, pageNumber) {
        return path.join(RENDERED_DIR, `${docId}`, `page-${pageNumber}.png`);
    }
}

module.exports = new DocumentService();