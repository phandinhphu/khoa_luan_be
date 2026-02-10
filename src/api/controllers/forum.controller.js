const forumService = require('../services/forum.service');

class ForumController {
    // ===== POSTS =====

    // [POST] /api/forum/posts - Tạo bài viết mới (User)
    async createPost(req, res) {
        try {
            const { title, content, document_id } = req.body;

            if (!title || !content) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập đầy đủ tiêu đề và nội dung'
                });
            }

            const post = await forumService.createPost(req.user._id, {
                title,
                content,
                document_id
            });

            res.status(201).json({
                success: true,
                message: 'Bài viết đang chờ duyệt',
                data: post
            });
        } catch (error) {
            console.error('Create post error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi tạo bài viết'
            });
        }
    }

    // [GET] /api/forum/posts - Lấy danh sách bài viết APPROVED (Public)
    async getApprovedPosts(req, res) {
        try {
            const { posts, total } = await forumService.getApprovedPosts(req.query);

            const page = req.query.page * 1 || 1;
            const limit = req.query.limit * 1 || 10;

            res.status(200).json({
                success: true,
                data: posts,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get approved posts error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi lấy danh sách bài viết'
            });
        }
    }

    // [GET] /api/forum/posts/pending - Lấy danh sách bài viết PENDING (Admin)
    async getPendingPosts(req, res) {
        try {
            const { posts, total } = await forumService.getPendingPosts(req.query);

            const page = req.query.page * 1 || 1;
            const limit = req.query.limit * 1 || 10;

            res.status(200).json({
                success: true,
                data: posts,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get pending posts error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi lấy danh sách bài viết chờ duyệt'
            });
        }
    }

    // [GET] /api/forum/posts/rejected - Lấy danh sách bài viết REJECTED (Admin)
    async getRejectedPosts(req, res) {
        try {
            const { posts, total } = await forumService.getRejectedPosts(req.query);

            const page = req.query.page * 1 || 1;
            const limit = req.query.limit * 1 || 10;

            res.status(200).json({
                success: true,
                data: posts,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get rejected posts error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi lấy danh sách bài viết bị từ chối'
            });
        }
    }

    // [GET] /api/forum/posts/me - Lấy bài viết của user (User)
    async getMyPosts(req, res) {
        try {
            const { posts, total } = await forumService.getMyPosts(req.user._id, req.query);

            const page = req.query.page * 1 || 1;
            const limit = req.query.limit * 1 || 10;

            res.status(200).json({
                success: true,
                data: posts,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get my posts error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi lấy bài viết của bạn'
            });
        }
    }

    // [GET] /api/forum/posts/:id - Lấy chi tiết bài viết
    async getPostById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user ? req.user._id.toString() : null;
            const isAdmin = req.user && req.user.role === 'admin';

            const post = await forumService.getPostById(id, userId, isAdmin);

            res.status(200).json({
                success: true,
                data: post
            });
        } catch (error) {
            console.error('Get post by id error:', error);
            res.status(error.message.includes('không tồn tại') ? 404 : 500).json({
                success: false,
                message: error.message || 'Lỗi khi lấy chi tiết bài viết'
            });
        }
    }

    // [PUT] /api/forum/posts/:id - Cập nhật bài viết (User)
    async updatePost(req, res) {
        try {
            const { id } = req.params;
            const { title, content, document_id } = req.body;

            const post = await forumService.updatePost(id, req.user._id.toString(), {
                title,
                content,
                document_id
            });

            res.status(200).json({
                success: true,
                message: 'Cập nhật bài viết thành công',
                data: post
            });
        } catch (error) {
            console.error('Update post error:', error);
            res.status(error.message.includes('không có quyền') ? 403 : 500).json({
                success: false,
                message: error.message || 'Lỗi khi cập nhật bài viết'
            });
        }
    }

    // [DELETE] /api/forum/posts/:id - Xóa bài viết (User/Admin)
    async deletePost(req, res) {
        try {
            const { id } = req.params;
            const isAdmin = req.user.role === 'admin';

            const result = await forumService.deletePost(id, req.user._id.toString(), isAdmin);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Delete post error:', error);
            res.status(error.message.includes('không có quyền') ? 403 : 500).json({
                success: false,
                message: error.message || 'Lỗi khi xóa bài viết'
            });
        }
    }

    // [PUT] /api/forum/posts/:id/approve - Duyệt bài viết (Admin)
    async approvePost(req, res) {
        try {
            const { id } = req.params;

            const post = await forumService.approvePost(id, req.user._id);

            res.status(200).json({
                success: true,
                message: 'Duyệt bài viết thành công',
                data: post
            });
        } catch (error) {
            console.error('Approve post error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi duyệt bài viết'
            });
        }
    }

    // [PUT] /api/forum/posts/:id/reject - Từ chối bài viết (Admin)
    async rejectPost(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            if (!reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập lý do từ chối'
                });
            }

            const post = await forumService.rejectPost(id, req.user._id, reason);

            res.status(200).json({
                success: true,
                message: 'Từ chối bài viết thành công',
                data: post
            });
        } catch (error) {
            console.error('Reject post error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi từ chối bài viết'
            });
        }
    }

    // ===== COMMENTS =====

    // [POST] /api/forum/posts/:id/comments - Tạo comment (User)
    async createComment(req, res) {
        try {
            const { id } = req.params;
            const { content } = req.body;

            if (!content) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập nội dung comment'
                });
            }

            const comment = await forumService.createComment(id, req.user._id, content);

            res.status(201).json({
                success: true,
                message: 'Tạo comment thành công',
                data: comment
            });
        } catch (error) {
            console.error('Create comment error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi tạo comment'
            });
        }
    }

    // [GET] /api/forum/posts/:id/comments - Lấy danh sách comment của bài viết
    async getCommentsByPost(req, res) {
        try {
            const { id } = req.params;

            const { comments, total } = await forumService.getCommentsByPost(id, req.query);

            const page = req.query.page * 1 || 1;
            const limit = req.query.limit * 1 || 10;

            res.status(200).json({
                success: true,
                data: comments,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get comments error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi lấy danh sách comment'
            });
        }
    }

    // [PUT] /api/forum/comments/:id - Cập nhật comment (User)
    async updateComment(req, res) {
        try {
            const { id } = req.params;
            const { content } = req.body;

            if (!content) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập nội dung comment'
                });
            }

            const comment = await forumService.updateComment(id, req.user._id.toString(), content);

            res.status(200).json({
                success: true,
                message: 'Cập nhật comment thành công',
                data: comment
            });
        } catch (error) {
            console.error('Update comment error:', error);
            res.status(error.message.includes('không có quyền') ? 403 : 500).json({
                success: false,
                message: error.message || 'Lỗi khi cập nhật comment'
            });
        }
    }

    // [DELETE] /api/forum/comments/:id - Xóa comment (User/Admin)
    async deleteComment(req, res) {
        try {
            const { id } = req.params;
            const isAdmin = req.user.role === 'admin';

            const result = await forumService.deleteComment(id, req.user._id.toString(), isAdmin);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Delete comment error:', error);
            res.status(error.message.includes('không có quyền') ? 403 : 500).json({
                success: false,
                message: error.message || 'Lỗi khi xóa comment'
            });
        }
    }
}

module.exports = new ForumController();
