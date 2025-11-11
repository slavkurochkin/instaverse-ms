import express from 'express';
import axios from 'axios';
import { createLogger } from '../../../shared/utils/logger.js';

const router = express.Router();
const logger = createLogger('API-GATEWAY-IMAGE');

const IMAGE_SERVICE_URL = process.env.IMAGE_SERVICE_URL || 'http://image-service:5005';

// Upload image
router.post('/upload', async (req, res) => {
  try {
    const response = await axios.post(
      `${IMAGE_SERVICE_URL}/api/images/upload`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    logger.error('Image upload failed', {
      error: error.message,
      url: req.originalUrl,
    });

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        message: 'Failed to upload image',
        error: error.message,
      });
    }
  }
});

// Delete image
router.delete('/:filename', async (req, res) => {
  try {
    const response = await axios.delete(
      `${IMAGE_SERVICE_URL}/api/images/${req.params.filename}`,
      {
        timeout: 10000,
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    logger.error('Image delete failed', {
      error: error.message,
      filename: req.params.filename,
    });

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        message: 'Failed to delete image',
        error: error.message,
      });
    }
  }
});

export default router;

