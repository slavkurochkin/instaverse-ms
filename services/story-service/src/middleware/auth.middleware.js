import axios from 'axios';
import { createLogger } from '../../../shared/utils/logger.js';

const logger = createLogger('STORY-AUTH-MIDDLEWARE');

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Call Auth Service to validate token
    const response = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/auth/validate-token`,
      {
        headers: { Authorization: authHeader },
        timeout: 5000,
      }
    );

    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Authentication service unavailable' });
    }
    
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

