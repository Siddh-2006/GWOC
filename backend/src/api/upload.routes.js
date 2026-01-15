import express from 'express';
import { uploadImage, uploadFile } from '../controllers/upload.controller.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected route - Upload image
// Uses 'image' as the field name for the file
// Protected route - Upload image/file
// Uses 'file' as the field name (or 'image' for backward compat check if needed, but lets standardize on 'file' or accept 'image' too?)
// Actually middleware.single('image') forces field name 'image'. 
// Let's add a new generic route.

router.post('/image', authenticateToken, uploadMiddleware.single('image'), uploadImage);
router.post('/file', authenticateToken, uploadMiddleware.single('file'), (req, res, next) => {
    // Default folder for this route
    if (!req.body.folder) req.body.folder = 'resources';
    uploadFile(req, res, next);
});

export default router;
