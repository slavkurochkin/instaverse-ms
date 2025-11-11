import express from 'express';
import cors from 'express';
import dotenv from 'dotenv';
import socialRoutes from './routes/social.routes.js';
import { createPool, testConnection } from '../../shared/config/database.js';
import { connectRabbitMQ } from '../../shared/events/rabbitmq.js';
import { startEventConsumer } from './events/consumer.js';
import { errorHandler, notFoundHandler } from '../../shared/middleware/errorHandler.js';
import { createLogger } from '../../shared/utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
const logger = createLogger('SOCIAL-SERVICE');

export const pool = createPool(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'social-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/social', socialRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection(pool);
    logger.info('✅ Database connected');

    await connectRabbitMQ(process.env.RABBITMQ_URL);
    logger.info('✅ RabbitMQ connected');

    await startEventConsumer();
    logger.info('✅ Event consumer started');

    app.listen(PORT, () => {
      logger.info(`🚀 Social Service running on port ${PORT}`);
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

