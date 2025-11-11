import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import storyRoutes from './routes/story.routes.js';
import { createPool, testConnection } from '../../shared/config/database.js';
import { connectRabbitMQ } from '../../shared/events/rabbitmq.js';
import { startEventConsumer } from './events/consumer.js';
import { errorHandler, notFoundHandler } from '../../shared/middleware/errorHandler.js';
import { createLogger } from '../../shared/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const logger = createLogger('STORY-SERVICE');

// Create database pool
export const pool = createPool(process.env.DATABASE_URL);

// Middleware
app.use(cors());
app.use(express.json({ limit: '32mb' }));
app.use(express.urlencoded({ limit: '32mb', extended: true }));

// Serve static images
app.use('/images', express.static(path.join(__dirname, '../uploads')));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'story-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/stories', storyRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Initialize service
const startServer = async () => {
  try {
    await testConnection(pool);
    logger.info('✅ Database connected');

    await connectRabbitMQ(process.env.RABBITMQ_URL);
    logger.info('✅ RabbitMQ connected');

    await startEventConsumer();
    logger.info('✅ Event consumer started');

    app.listen(PORT, () => {
      logger.info(`🚀 Story Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server', { error: error.message });
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

startServer();

export default app;

