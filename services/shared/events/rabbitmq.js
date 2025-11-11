import amqp from 'amqplib';

let connection = null;
let channel = null;

/**
 * Connect to RabbitMQ
 */
export const connectRabbitMQ = async (url) => {
  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    
    console.log('✅ Connected to RabbitMQ');
    
    // Handle connection close
    connection.on('close', () => {
      console.error('❌ RabbitMQ connection closed');
      setTimeout(() => connectRabbitMQ(url), 5000); // Reconnect after 5 seconds
    });
    
    connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err);
    });
    
    return { connection, channel };
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error);
    setTimeout(() => connectRabbitMQ(url), 5000); // Retry after 5 seconds
    throw error;
  }
};

/**
 * Publish an event to an exchange
 */
export const publishEvent = async (exchange, routingKey, message) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    
    await channel.assertExchange(exchange, 'topic', { durable: true });
    
    const messageBuffer = Buffer.from(JSON.stringify(message));
    const published = channel.publish(exchange, routingKey, messageBuffer, {
      persistent: true,
      timestamp: Date.now(),
      contentType: 'application/json',
    });
    
    if (published) {
      console.log(`📤 Published event: ${routingKey} to ${exchange}`);
    }
    
    return published;
  } catch (error) {
    console.error('❌ Failed to publish event:', error);
    throw error;
  }
};

/**
 * Consume events from a queue
 */
export const consumeEvents = async (queue, exchange, routingKeys, handler) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    
    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    
    // Bind routing keys to queue
    for (const routingKey of routingKeys) {
      await channel.bindQueue(queue, exchange, routingKey);
      console.log(`🔗 Bound ${routingKey} to ${queue}`);
    }
    
    // Set prefetch to process one message at a time
    channel.prefetch(1);
    
    channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey;
          
          console.log(`📥 Received event: ${routingKey} from ${queue}`);
          
          await handler(content, routingKey);
          channel.ack(msg);
        } catch (error) {
          console.error('❌ Error processing message:', error);
          // Don't requeue to avoid infinite loops
          channel.nack(msg, false, false);
        }
      }
    });
    
    console.log(`✅ Consuming events from queue: ${queue}`);
  } catch (error) {
    console.error('❌ Failed to consume events:', error);
    throw error;
  }
};

/**
 * Close RabbitMQ connection
 */
export const closeConnection = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('✅ Closed RabbitMQ connection');
  } catch (error) {
    console.error('❌ Error closing RabbitMQ connection:', error);
  }
};

/**
 * Get channel (for advanced use cases)
 */
export const getChannel = () => channel;

/**
 * Get connection (for advanced use cases)
 */
export const getConnection = () => connection;

