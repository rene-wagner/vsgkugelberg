import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@/errors/http-errors';

// Allowed MIME types for image uploads
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

// Max file size (default 10MB)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);

// Upload directory
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// File filter to validate file types
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException(
        `Invalid file type. Allowed types: ${ALLOWED_MIMETYPES.join(', ')}`,
      ),
    );
  }
};

// Multer upload middleware
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

export { UPLOAD_DIR, ALLOWED_MIMETYPES, MAX_FILE_SIZE };
