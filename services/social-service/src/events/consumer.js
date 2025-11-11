import { consumeEvents } from '../../../shared/events/rabbitmq.js';
import { EventTypes, ExchangeNames, QueueNames } from '../../../shared/events/eventTypes.js';
import { pool } from '../index.js';
import { createLogger } from '../../../shared/utils/logger.js';

const logger = createLogger('SOCIAL-CONSUMER');

export const startEventConsumer = async () => {
  try {
    // Listen to post deletion events
    await consumeEvents(
      QueueNames.SOCIAL_QUEUE,
      ExchangeNames.POST_EXCHANGE,
      [EventTypes.POST_DELETED],
      async (message, routingKey) => {
        logger.info(`Received event: ${routingKey}`, { message });

        try {
          if (routingKey === EventTypes.POST_DELETED && message.postId) {
            // Delete all likes and comments for this post (CASCADE should handle this, but being explicit)
            await pool.query('DELETE FROM post_likes WHERE post_id = $1', [message.postId]);
            await pool.query('DELETE FROM post_comments WHERE post_id = $1', [message.postId]);
            await pool.query('DELETE FROM post_social WHERE post_id = $1', [message.postId]);
            
            logger.info(`Deleted social interactions for post ${message.postId}`);
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

