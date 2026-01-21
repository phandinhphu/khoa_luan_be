const path = require('path');
const fs = require('fs');
const { exec } = require('../utils/exec');
const { ORIGINAL_DIR } = require('../config/path');
const PdfRenderStrategy = require('./PdfRenderStrategy');
const DocumentRenderStrategy = require('./DocumentRenderStrategy');

class DocxRenderStrategy extends DocumentRenderStrategy {
    async prepare(docId, inputPath) {
        console.log('Converting DOCX to PDF:', inputPath);
        const cmd = `soffice --headless --convert-to pdf "${inputPath}" --outdir "${ORIGINAL_DIR}"`
        await exec(cmd)

        const generatedPdfPath = `${inputPath}.pdf`;
        const targetPdfPath = path.join(ORIGINAL_DIR, `${docId}.pdf`);

        if (fs.existsSync(generatedPdfPath)) {
            fs.renameSync(generatedPdfPath, targetPdfPath);
        }

        const pdfStrategy = new PdfRenderStrategy();
        return pdfStrategy.prepare(docId, targetPdfPath);
    }
}

module.exports = DocxRenderStrategy;