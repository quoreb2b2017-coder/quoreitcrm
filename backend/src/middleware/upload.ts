import type { Request } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { AppError } from '../utils/AppError.js';
import type { UploadType } from '../services/uploadService.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for intro videos

const MIME_RESUME = ['application/pdf'];
const MIME_DOCUMENTS = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MIME_PROFILE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MIME_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

const ACCEPT_BY_TYPE: Record<UploadType, string[]> = {
  resume: MIME_RESUME,
  document: MIME_DOCUMENTS,
  profile: MIME_PROFILE,
  video: MIME_VIDEO,
};

const memoryStorage = multer.memoryStorage();

/** Directory for candidate resume uploads (disk). Path stored in Mongo. */
export const RESUMES_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'resumes');

const resumeDiskStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    if (!fs.existsSync(RESUMES_UPLOAD_DIR)) {
      fs.mkdirSync(RESUMES_UPLOAD_DIR, { recursive: true });
    }
    cb(null, RESUMES_UPLOAD_DIR);
  },
  filename(req, _file, cb) {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) {
      cb(new AppError(401, 'Authentication required'), '');
      return;
    }
    cb(null, `${userId}-${Date.now()}.pdf`);
  },
});

function fileFilter(type: UploadType) {
  const allowed = ACCEPT_BY_TYPE[type];
  return (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!file.mimetype || !allowed.includes(file.mimetype)) {
      const allowedStr =
        type === 'resume'
          ? 'PDF'
          : type === 'profile'
            ? 'images (JPEG, PNG, WebP, GIF)'
            : type === 'video'
              ? 'video (MP4, WebM, MOV, AVI)'
              : 'PDF or images';
      cb(new AppError(400, `Invalid file type. Allowed: ${allowedStr}`));
      return;
    }
    cb(null, true);
  };
}

export function multerUpload(type: UploadType) {
  const fileSizeLimit = type === 'video' ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
  return multer({
    storage: memoryStorage,
    limits: { fileSize: fileSizeLimit },
    fileFilter: fileFilter(type),
  }).single('file');
}

/** Multer disk upload for candidate resume (PDF). Use after auth + requireCandidate. Stores file in uploads/resumes/. */
export const multerResumeDisk = multer({
  storage: resumeDiskStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter('resume'),
}).single('file');
