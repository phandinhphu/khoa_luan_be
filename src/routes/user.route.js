const express = require('express');
const router = express.Router();
const userController = require('../api/controllers/user.controller');
const { protect, admin } = require('../middlewares/auth.middleware');
const { uploadAvatar, handleMulterError } = require('../middlewares/upload.middleware');

// Public routes (none for user management)

// Protected routes - User
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, uploadAvatar, handleMulterError, userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);

// Protected routes - Admin only
router.get('/stats', protect, admin, userController.getUserStats);
router.get('/', protect, admin, userController.getAllUsers);
router.get('/:id', protect, admin, userController.getUserById);
router.post('/', protect, admin, uploadAvatar, handleMulterError, userController.createUser);
router.put('/:id', protect, admin, uploadAvatar, handleMulterError, userController.updateUser);
router.patch('/:id/role', protect, admin, userController.updateUserRole);
router.delete('/:id', protect, admin, userController.deleteUser);

module.exports = router;
