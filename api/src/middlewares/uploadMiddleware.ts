import multer, { type StorageEngine } from 'multer';
import { UPLOAD_LIMITS } from '../config/upload';

const storage: StorageEngine = multer.memoryStorage();

export const uploadAvatar = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes: readonly string[] = UPLOAD_LIMITS.AVATAR_ALLOWED_TYPES;
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas para avatar'));
    }
  },
  limits: {
    fileSize: UPLOAD_LIMITS.AVATAR_MAX_SIZE,
  },
});

export const uploadCourseImage = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes: readonly string[] = UPLOAD_LIMITS.COURSE_ALLOWED_TYPES;
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas para cursos'));
    }
  },
  limits: {
    fileSize: UPLOAD_LIMITS.COURSE_IMAGE_MAX_SIZE,
  },
});

export const uploadVideo = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes: readonly string[] = UPLOAD_LIMITS.VIDEO_ALLOWED_TYPES;
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas vídeos são permitidos (MP4, WebM, OGG, MOV)'));
    }
  },
  limits: {
    fileSize: UPLOAD_LIMITS.VIDEO_MAX_SIZE,
  },
});
