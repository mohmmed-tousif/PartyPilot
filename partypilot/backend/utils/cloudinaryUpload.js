// backend/utils/cloudinaryUpload.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const DatauriParser = require('datauri/parser');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Upload single image
exports.uploadSingle = upload.single('image');

// Upload multiple images (max 5)
exports.uploadMultiple = upload.array('images', 5);

// Upload buffer to Cloudinary
const parser = new DatauriParser();

exports.uploadToCloudinary = async (file) => {
  const extName = path.extname(file.originalname).toString();
  const file64 = parser.format(extName, file.buffer);
  
  const result = await cloudinary.uploader.upload(file64.content, {
    folder: 'partypilot',
    transformation: [
      { width: 1200, height: 900, crop: 'limit', quality: 'auto' }
    ]
  });
  
  return result.secure_url;
};

// Delete image from Cloudinary
exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Extract public ID from Cloudinary URL
exports.getPublicId = (url) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename.split('.')[0];
};

module.exports.cloudinary = cloudinary;
