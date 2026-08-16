import multer from 'multer';

// Use memory storage so we can upload it to R2 buffer directly
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
