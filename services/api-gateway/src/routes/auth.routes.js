import express from 'express';
import axios from 'axios';
import { createLogger } from '../../../shared/utils/logger.js';

const router = express.Router();
const logger = createLogger('GATEWAY-AUTH-ROUTES');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';

// Forward all auth requests to auth service
router.all('/*', async (req, res) => {
  try {
    const config = {
      method: req.method,
      url: `${AUTH_SERVICE_URL}${req.originalUrl}`,
      headers: {
        'Content-Type': req.get('Content-Type') || 'application/json',
        'Authorization': req.get('Authorization'),
      },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    };

    // Only add data for methods that support body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      config.data = req.body;
    }

    const response = await axios(config);

    res.status(response.status).json(response.data);
  } catch (error) {
    logger.error('Auth service request failed', {
      error: error.message,
      url: req.originalUrl,
      method: req.method,
    });

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        message: 'Auth service temporarily unavailable',
        service: 'auth-service',
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

