import { consumeEvents } from '../../../shared/events/rabbitmq.js';
import { EventTypes, ExchangeNames, QueueNames } from '../../../shared/events/eventTypes.js';
import { deleteStory } from '../services/story.service.js';
import { pool } from '../index.js';
import { createLogger } from '../../../shared/utils/logger.js';

const logger = createLogger('STORY-CONSUMER');

export const startEventConsumer = async () => {
  try {
    // Listen to user deletion events to delete user's posts
    await consumeEvents(
      QueueNames.POST_QUEUE,
      ExchangeNames.USER_EXCHANGE,
      [EventTypes.USER_DELETED],
      async (message, routingKey) => {
        logger.info(`Received event: ${routingKey}`, { message });

        try {
          if (routingKey === EventTypes.USER_DELETED && message.userId) {
            // Delete all posts by this user
            const result = await pool.query(
              'DELETE FROM posts WHERE user_id = $1 RETURNING id',
              [message.userId]
            );
            
            logger.info(`Deleted ${result.rowCount} posts for user ${message.userId}`);
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

