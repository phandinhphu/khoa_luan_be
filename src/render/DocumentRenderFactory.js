const PdfRenderStrategy = require('./PdfRenderStrategy');
const DocxRenderStrategy = require('./DocxRenderStrategy');

class DocumentRenderFactory {
    static create(fileType) {
        switch (fileType) {
            case 'PDF':
                return new PdfRenderStrategy()
            case 'DOCX':
                return new DocxRenderStrategy()
            default:
                throw new Error('Unsupported document type')
        }
    }
}

module.exports = DocumentRenderFactory;