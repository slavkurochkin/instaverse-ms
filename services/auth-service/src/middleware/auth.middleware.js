import { verifyToken } from '../../../shared/utils/jwt.js';
import { createLogger } from '../../../shared/utils/logger.js';

const logger = createLogger('AUTH-MIDDLEWARE');

/**
 * Middleware to verify JWT token
 */
export const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);
    
    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user is admin
 */
export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Admin access required' });
  }
};

