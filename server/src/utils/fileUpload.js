import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// Multer memory storage (keeps file in memory as Buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Uploads a buffer to Cloudinary via stream
 * @param {Buffer} buffer - File buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Cloudinary response
 */
export const uploadToCloudinary = (buffer, folder = 'shopsphere/products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary
 * @param {String} publicId - Cloudinary public_id
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Error deleting image from cloudinary: ${error}`);
  }
};
