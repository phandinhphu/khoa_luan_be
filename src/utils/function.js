const sharp = require('sharp');

async function streamWithWatermark(filePath, watermarkText, res) {
    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        const width = metadata.width;
        const height = metadata.height;
        // Calculate fontsize based on image width (e.g. 1/20 of width)
        const fontSize = Math.floor(width / 20);

        const svg = `
    <svg width="${width}" height="${height}">
      <style>
        .wm {
          fill: rgba(0, 0, 0, 0.15);
          font-size: ${fontSize}px;
          font-weight: bold;
          font-family: Arial, sans-serif;
        }
      </style>
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        dominant-baseline="middle" 
        class="wm"
        transform="rotate(-45, ${width / 2}, ${height / 2})"
      >
        ${watermarkText}
      </text>
    </svg>
    `;

        const buffer = await image
            .composite([{ input: Buffer.from(svg), gravity: 'center' }])
            .png()
            .toBuffer();

        // Encode với XOR
        const encodedBuffer = xor(buffer);

        // Dùng octet-stream để tránh trình duyệt tự động hiển thị ảnh
        res.setHeader('Content-Type', 'application/octet-stream');

        // Chặn cache
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Set contentDisposition: inline
        res.setHeader('Content-Disposition', 'inline');

        res.end(encodedBuffer);
    } catch (error) {
        console.error('Error streaming watermark:', error);
        res.status(500).send('Error processing image');
    }
}

function xor(buffer, key = 23) {
    return Buffer.from(buffer.map((byte) => byte ^ key));
}

module.exports = {
    streamWithWatermark,
};
