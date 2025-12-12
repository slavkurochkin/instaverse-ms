import express from 'express';
import axios from 'axios';
import { createLogger } from '../../../shared/utils/logger.js';

const router = express.Router();
const logger = createLogger('GATEWAY-LANGCHAIN-ROUTES');

const LANGCHAIN_SERVICE_URL = process.env.LANGCHAIN_SERVICE_URL || 'http://langchain-service:5006';

// Forward all langchain requests to langchain service
router.all('/*', async (req, res) => {
  try {
    // Remove /api/langchain prefix and forward the rest
    // req.originalUrl includes the full path like /api/langchain/api/generate-post
    // We need to remove /api/langchain to get /api/generate-post
    let servicePath = req.originalUrl;
    if (servicePath.startsWith('/api/langchain')) {
      servicePath = servicePath.replace('/api/langchain', '');
    }
    // Ensure path starts with /
    if (!servicePath.startsWith('/')) {
      servicePath = '/' + servicePath;
    }
    
    logger.info('Forwarding to langchain service', {
      originalUrl: req.originalUrl,
      servicePath: servicePath,
      fullUrl: `${LANGCHAIN_SERVICE_URL}${servicePath}`,
    });
    
    const response = await axios({
      method: req.method,
      url: `${LANGCHAIN_SERVICE_URL}${servicePath}`,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined,
      },
      timeout: 30000, // Longer timeout for AI generation
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    logger.error('LangChain service request failed', {
      error: error.message,
      url: req.originalUrl,
      method: req.method,
    });

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        message: 'LangChain service temporarily unavailable',
        service: 'langchain-service',
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

