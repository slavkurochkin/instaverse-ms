/**
 * Event Types for Microservices Communication
 * These define all events that can be published/consumed across services
 */

export const EventTypes = {
  // User Events
  USER_REGISTERED: 'user.registered',
  USER_DELETED: 'user.deleted',
  USER_UPDATED: 'user.updated',

  // Post Events
  POST_CREATED: 'post.created',
  POST_UPDATED: 'post.updated',
  POST_DELETED: 'post.deleted',

  // Social Events
  POST_LIKED: 'post.liked',
  POST_UNLIKED: 'post.unliked',
  POST_COMMENTED: 'post.commented',
  COMMENT_DELETED: 'comment.deleted',
  POST_SHARED: 'post.shared',

  // Notification Events
  NOTIFICATION_SEND: 'notification.send',
};

export const ExchangeNames = {
  USER_EXCHANGE: 'user_exchange',
  POST_EXCHANGE: 'post_exchange',
  SOCIAL_EXCHANGE: 'social_exchange',
  NOTIFICATION_EXCHANGE: 'notification_exchange',
};

export const QueueNames = {
  USER_QUEUE: 'user_queue',
  POST_QUEUE: 'post_queue',
  SOCIAL_QUEUE: 'social_queue',
  NOTIFICATION_QUEUE: 'notification_queue',
};

// Routing keys for topic exchanges
export const RoutingKeys = {
  USER_ALL: 'user.*',
  POST_ALL: 'post.*',
  SOCIAL_ALL: 'social.*',
  NOTIFICATION_ALL: 'notification.*',
};

