import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for seed source files
const seedSourceStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create specific subdirectory for seed source files
        const subDir = path.join(uploadsDir, 'seed-sources');
        if (!fs.existsSync(subDir)) {
            fs.mkdirSync(subDir, { recursive: true });
        }
        cb(null, subDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = path.parse(file.originalname).name;
        const extension = path.extname(file.originalname);
        cb(null, `seedsource-${uniqueSuffix}${extension}`);
    }
});

// File filter for seed source documents
const seedSourceFileFilter = (req: any, file: any, cb: any) => {
    // Allow document formats only for seed source penetapan files
    const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed for seed source documents.'), false);
    }
};

// Configure multer for seed source uploads
const seedSourceUpload = multer({
    storage: seedSourceStorage,
    fileFilter: seedSourceFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    }
});

export default seedSourceUpload;
