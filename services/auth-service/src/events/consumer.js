import { consumeEvents } from '../../../shared/events/rabbitmq.js';
import { EventTypes, ExchangeNames, QueueNames } from '../../../shared/events/eventTypes.js';
import { incrementPostCount, decrementPostCount } from '../services/auth.service.js';
import { createLogger } from '../../../shared/utils/logger.js';

const logger = createLogger('AUTH-CONSUMER');

/**
 * Start consuming events from RabbitMQ
 */
export const startEventConsumer = async () => {
  try {
    // Listen to post events to update user's post count
    await consumeEvents(
      QueueNames.USER_QUEUE,
      ExchangeNames.POST_EXCHANGE,
      [EventTypes.POST_CREATED, EventTypes.POST_DELETED],
      async (message, routingKey) => {
        logger.info(`Received event: ${routingKey}`, { message });

        try {
          switch (routingKey) {
            case EventTypes.POST_CREATED:
              if (message.userId) {
                await incrementPostCount(message.userId);
                logger.info(`Incremented post count for user ${message.userId}`);
              }
              break;

            case EventTypes.POST_DELETED:
              if (message.userId) {
                await decrementPostCount(message.userId);
                logger.info(`Decremented post count for user ${message.userId}`);
              }
              break;

            default:
              logger.warn(`Unhandled event type: ${routingKey}`);
          }
        } catch (error) {
          logger.error('Error handling event', { error: error.message, routingKey });
          throw error;
        }
      }
    );

    logger.info('✅ Event consumer started successfully');
  } catch (error) {
    logger.error('❌ Failed to start event consumer', { error: error.message });
    throw error;
  }
};

