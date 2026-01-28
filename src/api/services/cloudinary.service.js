const cloudinary = require('../../config/cloudinary');
const fs = require('fs').promises;

/**
 * Upload image to Cloudinary
 * @param {String} filePath - Local file path
 * @param {String} folder - Cloudinary folder name
 * @param {String} oldPublicId - Old public_id to delete (optional)
 * @returns {Object} - Upload result with url and public_id
 */
const uploadImage = async (filePath, folder = 'avatars', oldPublicId = null) => {
    try {
        // Delete old image if exists
        if (oldPublicId) {
            await deleteImage(oldPublicId);
        }

        // Upload new image
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        // Delete local file after upload
        await fs.unlink(filePath);

        return {
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        // Try to delete local file even if upload fails
        try {
            await fs.unlink(filePath);
        } catch (unlinkError) {
            console.error('Error deleting local file:', unlinkError);
        }
        throw error;
    }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public_id
 */
const deleteImage = async (publicId) => {
    try {
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Don't throw error, just log it
    }
};

/**
 * Upload avatar with buffer (from multer memory storage)
 * @param {Buffer} buffer - File buffer
 * @param {String} folder - Cloudinary folder name
 * @param {String} oldPublicId - Old public_id to delete (optional)
 * @returns {Object} - Upload result with url and public_id
 */
const uploadImageFromBuffer = async (buffer, folder = 'avatars', oldPublicId = null) => {
    return new Promise((resolve, reject) => {
        // Delete old image if exists
        if (oldPublicId) {
            deleteImage(oldPublicId).catch(err => console.error('Error deleting old image:', err));
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                transformation: [
                    { width: 500, height: 500, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                }
            }
        );

        uploadStream.end(buffer);
    });
};

module.exports = {
    uploadImage,
    uploadImageFromBuffer,
    deleteImage
};
