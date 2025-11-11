import express from 'express';
import axios from 'axios';
import { createLogger } from '../../../shared/utils/logger.js';

const router = express.Router();
const logger = createLogger('GATEWAY-STORY-ROUTES');

const STORY_SERVICE_URL = process.env.STORY_SERVICE_URL || 'http://story-service:5002';

// Forward all story requests to story service
router.all('/*', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${STORY_SERVICE_URL}${req.originalUrl}`,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined,
      },
      timeout: 10000,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    logger.error('Story service request failed', {
      error: error.message,
      url: req.originalUrl,
      method: req.method,
    });

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        message: 'Story service temporarily unavailable',
        service: 'story-service',
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

