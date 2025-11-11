import express from 'express';
import { uploadImage, deleteImage } from '../controllers/image.controller.js';

const router = express.Router();

// Upload image (accepts base64)
router.post('/upload', uploadImage);

// Delete image
router.delete('/:filename', deleteImage);

export default router;

