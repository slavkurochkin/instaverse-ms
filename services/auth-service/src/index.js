import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import { createPool, testConnection } from '../../shared/config/database.js';
import { connectRabbitMQ } from '../../shared/events/rabbitmq.js';
import { startEventConsumer } from './events/consumer.js';
import { errorHandler, notFoundHandler } from '../../shared/middleware/errorHandler.js';
import { createLogger } from '../../shared/utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const logger = createLogger('AUTH-SERVICE');

// Create database pool
export const pool = createPool(process.env.DATABASE_URL);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip,
    userAgent: req.get('user-agent') 
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Initialize service
const startServer = async () => {
  try {
    // Test database connection
    await testConnection(pool);
    logger.info('✅ Database connected');

    // Connect to RabbitMQ
    await connectRabbitMQ(process.env.RABBITMQ_URL);
    logger.info('✅ RabbitMQ connected');

    // Start event consumer
    await startEventConsumer();
    logger.info('✅ Event consumer started');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Auth Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

startServer();

export default app;

