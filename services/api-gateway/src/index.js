import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import storyRoutes from './routes/story.routes.js';
import socialRoutes from './routes/social.routes.js';
import imageRoutes from './routes/image.routes.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from '../../shared/middleware/errorHandler.js';
import { createLogger } from '../../shared/utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const logger = createLogger('API-GATEWAY');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '32mb' }));
app.use(express.urlencoded({ limit: '32mb', extended: true }));

// Rate limiting
app.use(rateLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/images', imageRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Service URLs:', {
    auth: process.env.AUTH_SERVICE_URL,
    story: process.env.STORY_SERVICE_URL,
    social: process.env.SOCIAL_SERVICE_URL,
  });
});

export default app;

