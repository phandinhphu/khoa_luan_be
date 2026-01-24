const sharp = require('sharp')

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

    res.setHeader('Content-Type', 'image/png');

    // Chặn cache
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Set contentDisposition: inline
    res.setHeader('Content-Disposition', 'inline');

    image
      .composite([{ input: Buffer.from(svg) }])
      .png()
      .on('error', err => {
        console.error('Error processing image:', err);
        res.status(500).send('Error processing image');
      })
      .pipe(res);
  } catch (error) {
    console.error('Error streaming watermark:', error);
    res.status(500).send('Error processing image');
  }
}

module.exports = {
  streamWithWatermark,
}