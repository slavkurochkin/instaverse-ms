import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { startWebSocketServer } from './websocket/server.js';
import { connectRabbitMQ } from '../../shared/events/rabbitmq.js';
import { startEventConsumer } from './events/consumer.js';
import { createLogger } from '../../shared/utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;
const WS_PORT = process.env.WEBSOCKET_PORT || 8080;
const logger = createLogger('NOTIFICATION-SERVICE');

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Initialize service
const startServer = async () => {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ(process.env.RABBITMQ_URL);
    logger.info('✅ RabbitMQ connected');

    // Start WebSocket server
    await startWebSocketServer(WS_PORT);
    logger.info(`✅ WebSocket server running on port ${WS_PORT}`);

    // Start event consumer
    await startEventConsumer();
    logger.info('✅ Event consumer started');

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`🚀 Notification Service HTTP running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();

export default app;

