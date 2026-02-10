const ForumPost = require('../models/forum_posts.model');
const ForumComment = require('../models/forum_comments.model');
const APIFeatures = require('../../utils/apiFeatures');

class ForumService {
    // ===== POSTS =====

    // Tạo bài viết mới (User) - Status mặc định là PENDING
    async createPost(userId, postData) {
        const post = await ForumPost.create({
            user_id: userId,
            title: postData.title,
            content: postData.content,
            document_id: postData.document_id || null,
            status: 'PENDING',
        });

        return await post.populate('user_id', 'name email avatar_url');
    }

    // Lấy danh sách bài viết APPROVED (Public) - Có phân trang
    async getApprovedPosts(queryString) {
        // Thêm filter mặc định cho status APPROVED
        const modifiedQuery = { ...queryString, status: 'APPROVED' };

        const features = new APIFeatures(
            ForumPost.find()
                .populate('user_id', 'name email avatar_url')
                .populate('reviewed_by', 'name email')
                .populate('document_id', 'title'),
            modifiedQuery,
        )
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const posts = await features.query;
        const total = await ForumPost.countDocuments({ status: 'APPROVED' });

        return { posts, total };
    }

    // Lấy danh sách bài viết PENDING (Admin)
    async getPendingPosts(queryString) {
        const modifiedQuery = { ...queryString, status: 'PENDING' };

        const features = new APIFeatures(
            ForumPost.find()
                .populate('user_id', 'name email avatar_url')
                .populate('reviewed_by', 'name email')
                .populate('document_id', 'title'),
            modifiedQuery,
        )
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const posts = await features.query;
        const total = await ForumPost.countDocuments({ status: 'PENDING' });

        return { posts, total };
    }

    // Lấy danh sách bài viết REJECTED (Admin)
    async getRejectedPosts(queryString) {
        const modifiedQuery = { ...queryString, status: 'REJECTED' };

        const features = new APIFeatures(
            ForumPost.find()
                .populate('user_id', 'name email avatar_url')
                .populate('reviewed_by', 'name email')
                .populate('document_id', 'title'),
            modifiedQuery,
        )
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const posts = await features.query;
        const total = await ForumPost.countDocuments({ status: 'REJECTED' });

        return { posts, total };
    }

    // Lấy bài viết của user hiện tại
    async getMyPosts(userId, queryString) {
        const modifiedQuery = { ...queryString, user_id: userId };

        const features = new APIFeatures(ForumPost.find().populate('user_id', 'name email avatar_url'), modifiedQuery)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const posts = await features.query;
        const total = await ForumPost.countDocuments({ user_id: userId });

        return { posts, total };
    }

    // Lấy chi tiết bài viết (chỉ APPROVED cho public)
    async getPostById(postId, userId = null, isAdmin = false) {
        const post = await ForumPost.findById(postId)
            .populate('user_id', 'name email avatar_url')
            .populate('reviewed_by', 'name email')
            .populate('document_id', 'title');

        if (!post) {
            throw new Error('Bài viết không tồn tại');
        }

        // Nếu là admin hoặc chủ bài viết, có thể xem mọi status
        if (isAdmin || (userId && post.user_id._id.toString() === userId)) {
            return post;
        }

        return post;
    }

    // Cập nhật bài viết (User - chỉ khi PENDING hoặc REJECTED)
    async updatePost(postId, userId, updateData) {
        const post = await ForumPost.findById(postId);

        if (!post) {
            throw new Error('Bài viết không tồn tại');
        }

        // Kiểm tra quyền sở hữu
        if (post.user_id.toString() !== userId) {
            throw new Error('Bạn không có quyền chỉnh sửa bài viết này');
        }

        // Chỉ cho phép sửa khi status là PENDING hoặc REJECTED
        if (post.status !== 'PENDING' && post.status !== 'REJECTED') {
            throw new Error('Chỉ có thể chỉnh sửa bài viết đang chờ duyệt hoặc bị từ chối');
        }

        // Cập nhật và reset status về PENDING nếu đang là REJECTED
        post.title = updateData.title || post.title;
        post.content = updateData.content || post.content;
        post.document_id = updateData.document_id !== undefined ? updateData.document_id : post.document_id;

        if (post.status === 'REJECTED') {
            post.status = 'PENDING';
            post.reject_reason = null;
        }

        await post.save();
        return await post.populate('user_id', 'name email avatar_url');
    }

    // Xóa bài viết (User - chỉ bài viết của mình)
    async deletePost(postId, userId, isAdmin = false) {
        const post = await ForumPost.findById(postId);

        if (!post) {
            throw new Error('Bài viết không tồn tại');
        }

        // Admin có thể xóa mọi bài viết, user chỉ xóa của mình
        if (!isAdmin && post.user_id.toString() !== userId) {
            throw new Error('Bạn không có quyền xóa bài viết này');
        }

        // Xóa tất cả comment của bài viết
        await ForumComment.deleteMany({ post_id: postId });

        await ForumPost.findByIdAndDelete(postId);
        return { message: 'Xóa bài viết thành công' };
    }

    // Duyệt bài viết (Admin)
    async approvePost(postId, adminId) {
        const post = await ForumPost.findById(postId);

        if (!post) {
            throw new Error('Bài viết không tồn tại');
        }

        if (post.status !== 'PENDING') {
            throw new Error('Chỉ có thể duyệt bài viết đang chờ duyệt');
        }

        post.status = 'APPROVED';
        post.reviewed_by = adminId;
        post.reviewed_at = new Date();
        post.reject_reason = null;

        await post.save();
        return await post.populate('user_id', 'name email avatar_url');
    }

    // Từ chối bài viết (Admin)
    async rejectPost(postId, adminId, reason) {
        const post = await ForumPost.findById(postId);

        if (!post) {
            throw new Error('Bài viết không tồn tại');
        }

        if (post.status !== 'PENDING') {
            throw new Error('Chỉ có thể từ chối bài viết đang chờ duyệt');
        }

        post.status = 'REJECTED';
        post.reviewed_by = adminId;
        post.reviewed_at = new Date();
        post.reject_reason = reason || 'Không có lý do cụ thể';

        await post.save();
        return await post.populate('user_id', 'name email avatar_url');
    }

    // ===== COMMENTS =====

    // Tạo comment (User)
    async createComment(postId, userId, content) {
        // Kiểm tra bài viết tồn tại và đã được duyệt
        const post = await ForumPost.findById(postId);

        if (!post) {
            throw new Error('Bài viết không tồn tại');
        }

        if (post.status !== 'APPROVED') {
            throw new Error('Không thể comment vào bài viết chưa được duyệt');
        }

        const comment = await ForumComment.create({
            post_id: postId,
            user_id: userId,
            content: content,
        });

        return await comment.populate('user_id', 'name email avatar_url');
    }

    // Lấy danh sách comment của bài viết
    async getCommentsByPost(postId, queryString) {
        // Kiểm tra bài viết tồn tại
        const post = await ForumPost.findById(postId);

        if (!post) {
            throw new Error('Bài viết không tồn tại');
        }

        const modifiedQuery = { ...queryString, post_id: postId };

        const features = new APIFeatures(
            ForumComment.find().populate('user_id', 'name email avatar_url'),
            modifiedQuery,
        )
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const comments = await features.query;
        const total = await ForumComment.countDocuments({ post_id: postId });

        return { comments, total };
    }

    // Cập nhật comment (User - chỉ comment của mình)
    async updateComment(commentId, userId, content) {
        const comment = await ForumComment.findById(commentId);

        if (!comment) {
            throw new Error('Comment không tồn tại');
        }

        // Kiểm tra quyền sở hữu
        if (comment.user_id.toString() !== userId) {
            throw new Error('Bạn không có quyền chỉnh sửa comment này');
        }

        comment.content = content;
        await comment.save();

        return await comment.populate('user_id', 'name email avatar_url');
    }

    // Xóa comment (User - chỉ comment của mình, Admin - mọi comment)
    async deleteComment(commentId, userId, isAdmin = false) {
        const comment = await ForumComment.findById(commentId);

        if (!comment) {
            throw new Error('Comment không tồn tại');
        }

        // Admin có thể xóa mọi comment, user chỉ xóa của mình
        if (!isAdmin && comment.user_id.toString() !== userId) {
            throw new Error('Bạn không có quyền xóa comment này');
        }

        await ForumComment.findByIdAndDelete(commentId);
        return { message: 'Xóa comment thành công' };
    }
}

module.exports = new ForumService();
