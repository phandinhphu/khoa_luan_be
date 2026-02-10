const express = require('express');
const router = express.Router();
const forumController = require('../api/controllers/forum.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

// ===== ADMIN ROUTES (Đặt trước để tránh conflict với :id) =====

// Lấy danh sách bài viết PENDING
router.get('/posts/pending', protect, admin, forumController.getPendingPosts);
// Lấy danh sách bài viết REJECTED
router.get('/posts/rejected', protect, admin, forumController.getRejectedPosts);

// ===== USER ROUTES (Cần đăng nhập) =====

// Lấy danh sách bài viết của user hiện tại (Đặt trước :id)
router.get('/posts/me', protect, forumController.getMyPosts);

// Tạo bài viết mới (Status = PENDING)
router.post('/posts', protect, forumController.createPost);

// ===== PUBLIC ROUTES (Không cần đăng nhập) =====

// Lấy danh sách bài viết đã duyệt
router.get('/posts', forumController.getApprovedPosts);

// Lấy chi tiết bài viết (có thể không cần đăng nhập cho bài APPROVED)
router.get('/posts/:id', forumController.getPostById);

// Lấy danh sách comment của bài viết
router.get('/posts/:id/comments', forumController.getCommentsByPost);

// ===== USER/ADMIN ROUTES =====

// Cập nhật bài viết của user (chỉ khi PENDING hoặc REJECTED)
router.put('/posts/:id', protect, forumController.updatePost);

// Xóa bài viết của user hoặc admin
router.delete('/posts/:id', protect, forumController.deletePost);

// Duyệt bài viết (Admin)
router.put('/posts/:id/approve', protect, admin, forumController.approvePost);

// Từ chối bài viết (Admin)
router.put('/posts/:id/reject', protect, admin, forumController.rejectPost);

// Tạo comment vào bài viết
router.post('/posts/:id/comments', protect, forumController.createComment);

// Cập nhật comment của user
router.put('/comments/:id', protect, forumController.updateComment);

// Xóa comment của user hoặc admin
router.delete('/comments/:id', protect, forumController.deleteComment);

module.exports = router;
