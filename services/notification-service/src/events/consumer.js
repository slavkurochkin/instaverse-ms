import { consumeEvents } from '../../../shared/events/rabbitmq.js';
import { EventTypes, ExchangeNames, QueueNames } from '../../../shared/events/eventTypes.js';
import { sendToUser } from '../websocket/server.js';
import { createLogger } from '../../../shared/utils/logger.js';

const logger = createLogger('NOTIFICATION-CONSUMER');

export const startEventConsumer = async () => {
  try {
    // Listen to social events (likes, comments, shares)
    await consumeEvents(
      QueueNames.NOTIFICATION_QUEUE,
      ExchangeNames.SOCIAL_EXCHANGE,
      [
        EventTypes.POST_LIKED,
        EventTypes.POST_COMMENTED,
        EventTypes.POST_SHARED,
      ],
      async (message, routingKey) => {
        logger.info(`Received event: ${routingKey}`, { message });

        try {
          switch (routingKey) {
            case EventTypes.POST_LIKED:
              // Notify post owner about the like
              sendToUser(message.userId, {
                type: 'LIKE',
                postId: message.postId,
                username: message.likedBy, // Username of person who liked
                postTitle: message.postTitle || 'your post', // Post title
                message: `${message.likedBy} liked your post`,
                timestamp: message.timestamp,
              });
              break;

            case EventTypes.POST_COMMENTED:
              // Notify post owner about the comment
              sendToUser(message.userId, {
                type: 'COMMENT',
                postId: message.postId,
                commentId: message.commentId,
                username: message.username,
                text: message.text,
                message: `${message.username} commented on your post`,
                timestamp: message.timestamp,
              });
              break;

            case EventTypes.POST_SHARED:
              // Notify post owner about the share
              sendToUser(message.userId, {
                type: 'SHARE',
                postId: message.postId,
                platform: message.platform,
                message: `Your post was shared on ${message.platform}`,
                timestamp: message.timestamp,
              });
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

