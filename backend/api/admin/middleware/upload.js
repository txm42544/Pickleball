import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = 'uploads';

// Ensure the base uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(uploadsDir, 'products');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const categoryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(uploadsDir, 'categories');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `category-${Date.now()}${path.extname(file.originalname)}`);
    },
});

export const productUpload = multer({ storage: productStorage });
export const categoryUpload = multer({ storage: categoryStorage });