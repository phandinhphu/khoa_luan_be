const express = require('express');
const multer = require('multer');
const { ORIGINAL_DIR } = require('../config/path');
const { uploadDocument, updateDocument, deleteDocument, readPage, getAllDocuments, getDocumentById, previewDocument } = require('../api/controllers/document.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer({ dest: ORIGINAL_DIR });

router.post('/upload', protect, admin, upload.single('file'), uploadDocument);
router.put('/:id', protect, admin, updateDocument);
router.delete('/:id', protect, admin, deleteDocument);
router.get('/', getAllDocuments);
router.get('/:id', protect, getDocumentById);
router.get('/:documentId/pages/:pageNumber', protect, readPage);
router.get('/:documentId/preview', previewDocument);

module.exports = router;