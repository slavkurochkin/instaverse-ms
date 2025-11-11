import express from 'express';
import axios from 'axios';
import { createLogger } from '../../../shared/utils/logger.js';

const router = express.Router();
const logger = createLogger('GATEWAY-SOCIAL-ROUTES');

const SOCIAL_SERVICE_URL = process.env.SOCIAL_SERVICE_URL || 'http://social-service:5003';

// Forward all social requests to social service
router.all('/*', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${SOCIAL_SERVICE_URL}${req.originalUrl}`,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined,
      },
      timeout: 10000,
      validateStatus: (status) => status < 500, // Accept all status codes < 500 as success
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    logger.error('Social service request failed', {
      error: error.message,
      url: req.originalUrl,
      method: req.method,
    });

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        message: 'Social service temporarily unavailable',
        service: 'social-service',
      });
    } else {
      res.status(500).json({
        message: 'Gateway error',
        error: error.message,
      });
    }
  }
});

export default router;

