const fs = require('fs');
const path = require('path');
const { exec } = require('../utils/exec');
const { RENDERED_DIR } = require('../config/path');
const DocumentRenderStrategy = require('./DocumentRenderStrategy');

class PdfRenderStrategy extends DocumentRenderStrategy {
    async prepare(docId, inputPath) {
        const outputDir = path.join(RENDERED_DIR, docId);
        fs.mkdirSync(outputDir, { recursive: true })

        const totalPages = await this.getTotalPages(inputPath)

        for (let i = 1; i <= totalPages; i++) {
            const cmd = `pdftoppm -f ${i} -l ${i} -png -singlefile "${inputPath}" "${outputDir}/page-${i}"`
            await exec(cmd)
        }

        return totalPages
    }

    async getTotalPages(pdfPath) {
        const { stdout } = await exec(`pdfinfo "${pdfPath}"`)
        const match = stdout.match(/Pages:\s+(\d+)/)
        return parseInt(match[1], 10)
    }
}

module.exports = PdfRenderStrategy;