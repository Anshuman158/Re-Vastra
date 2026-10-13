import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cloudinary } from '../config/cloudinary.js';

// Ensure uploads directory exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disk storage for local file handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
    fileFilter
});

// Upload a local file to Cloudinary, with graceful fallback to local URL
export const uploadFileToCloudinary = async (filePath) => {
    try {
        if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_SECRET_KEY) {
            const result = await cloudinary.uploader.upload(filePath, {
                resource_type: 'image',
                folder: 'revastra'
            });
            // Remove local file after successful Cloudinary upload
            try {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (err) {
                console.error('Failed to unlink local file:', err);
            }
            return result.secure_url;
        }
    } catch (error) {
        console.error('Cloudinary upload failed, falling back to local file URL:', error);
    }

    // Fallback: return local URL relative to server
    const fileName = path.basename(filePath);
    return `/uploads/${fileName}`;
};

export default upload;
