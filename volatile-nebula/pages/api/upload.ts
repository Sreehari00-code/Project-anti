import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Disable Next.js body parser to let Multer handle it
export const config = {
    api: {
        bodyParser: false,
    },
};

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, uploadDir);
    },
    filename: function (req: any, file: any, cb: any) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
});

// Helper to run middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await runMiddleware(req, res, upload.single('file'));
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }

    // @ts-ignore - Multer adds 'file' to req
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the public URL
    const publicUrl = `/uploads/${file.filename}`;
    res.status(200).json({
        success: true,
        url: publicUrl,
        filename: file.filename,
    });
}
