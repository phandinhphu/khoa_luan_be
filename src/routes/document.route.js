const express = require('express');
const multer = require('multer');
const { ORIGINAL_DIR } = require('../config/path');
const { uploadDocument, readPage } = require('../api/controllers/document.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer({ dest: ORIGINAL_DIR });

router.post('/upload', protect, admin, upload.single('file'), uploadDocument);
router.get('/:documentId/pages/:pageNumber', protect, readPage);

module.exports = router;