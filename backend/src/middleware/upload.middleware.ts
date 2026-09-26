import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { AppError } from '../utils/appError.js';

const uploadsRoot = path.resolve(process.cwd(), 'uploads');
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function destination(kind: 'avatars' | 'events'): string {
  const dir = path.join(uploadsRoot, kind);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function uploader(kind: 'avatars' | 'events') {
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, done) => done(null, destination(kind)),
      filename: (_req, file, done) => {
        const extension = path.extname(file.originalname).toLowerCase();
        done(null, `${crypto.randomUUID()}${extension}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, done) => {
      if (!allowedMimeTypes.has(file.mimetype)) {
        done(new AppError(400, 'VALIDATION_ERROR', 'Only JPEG, PNG, WebP, and GIF images are allowed.'));
        return;
      }
      done(null, true);
    },
  });
}

export const uploadAvatar = uploader('avatars').single('avatar');
export const uploadEventPhotos = uploader('events').array('photos', 3);
