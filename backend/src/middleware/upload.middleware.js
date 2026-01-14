import multer from 'multer';

  // Configure multer for memory storage
  const storage = multer.memoryStorage();

  // File filter (allow images, videos, audio, docs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/', 
    'video/', 
    'audio/', 
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Allowed: Images, Video, Audio, PDF, Docs'), false);
  }
};

export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});
