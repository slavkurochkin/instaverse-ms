import WebSocket, { WebSocketServer } from 'ws';
import { createLogger } from '../../../shared/utils/logger.js';

const logger = createLogger('WEBSOCKET-SERVER');

let wss = null;
const pendingMessages = new Map(); // Store messages for offline users

export const startWebSocketServer = (port) => {
  return new Promise((resolve) => {
    wss = new WebSocketServer({ port });

    wss.on('connection', (ws, req) => {
      try {
        // Parse userId from query parameters
        const urlParts = req.url.split('?');
        if (urlParts.length < 2) {
          logger.warn('Connection rejected: missing query parameters');
          ws.close();
          return;
        }

        const params = new URLSearchParams(urlParts[1]);
        const userId = params.get('userId');

        if (!userId) {
          logger.warn('Connection rejected: missing userId');
          ws.close();
          return;
        }

        ws.userId = userId;
        logger.info(`Client connected: userId=${userId}`);

        // Send pending messages if any
        if (pendingMessages.has(userId) && pendingMessages.get(userId).length > 0) {
          const messages = pendingMessages.get(userId);
          logger.info(`Sending ${messages.length} pending messages to user ${userId}`);
          
          messages.forEach((message) => {
            ws.send(JSON.stringify(message));
          });
          
          pendingMessages.delete(userId);
        } else {
          // Send welcome message
          ws.send(JSON.stringify({
            type: 'CONNECTED',
            message: 'Connected to notification service',
            timestamp: new Date().toISOString(),
          }));
        }

        ws.on('error', (error) => {
          logger.error(`WebSocket error for user ${ws.userId}`, { error: error.message });
        });

        ws.on('close', () => {
          logger.info(`Client disconnected: userId=${ws.userId}`);
        });
      } catch (error) {
        logger.error('Error processing WebSocket connection', { error: error.message });
        ws.close();
      }
    });

    logger.info(`WebSocket server listening on port ${port}`);
    resolve(wss);
  });
};

/**
 * Send notification to a specific user
 */
export const sendToUser = (userId, message) => {
  try {
    let messageSent = false;

    // Try to send to connected clients
    wss.clients.forEach((client) => {
      if (client.userId === userId.toString() && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        messageSent = true;
        logger.info(`Notification sent to user ${userId}`, { type: message.type });
      }
    });

    // If user is offline, store message for later
    if (!messageSent) {
      if (!pendingMessages.has(userId.toString())) {
        pendingMessages.set(userId.toString(), []);
      }
      pendingMessages.get(userId.toString()).push(message);
      logger.info(`User ${userId} offline, message queued`, { type: message.type });
    }

    return messageSent;
  } catch (error) {
    logger.error('Failed to send notification', { error: error.message, userId });
    throw error;
  }
};

/**
 * Broadcast message to all connected clients
 */
export const broadcast = (message) => {
  try {
    let count = 0;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        count++;
      }
    });
    logger.info(`Broadcast message to ${count} clients`, { type: message.type });
  } catch (error) {
    logger.error('Failed to broadcast message', { error: error.message });
  }
};

export const getWebSocketServer = () => wss;

