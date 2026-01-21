const express = require('express');
const multer = require('multer');
const { ORIGINAL_DIR } = require('../config/path');
const { uploadDocument, readPage } = require('../api/controllers/document.controller');

const router = express.Router();
const upload = multer({ dest: ORIGINAL_DIR });

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/:documentId/pages/:pageNumber', readPage);

module.exports = router;