# Microservices Implementation Guide

## Project Structure

```
instaverse-automation/
├── frontend/                          # React frontend (existing)
├── backend/                           # Legacy monolithic backend (to be retired)
├── services/                          # New microservices directory
│   ├── api-gateway/
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── story.routes.js
│   │   │   │   ├── social.routes.js
│   │   │   │   └── notification.routes.js
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.js
│   │   │   │   ├── rateLimiter.js
│   │   │   │   └── errorHandler.js
│   │   │   └── config/
│   │   │       └── services.config.js
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/
│   │   │   │   └── auth.routes.js
│   │   │   ├── controllers/
│   │   │   │   └── auth.controller.js
│   │   │   ├── models/
│   │   │   │   └── user.model.js
│   │   │   ├── middleware/
│   │   │   │   └── auth.middleware.js
│   │   │   ├── services/
│   │   │   │   └── auth.service.js
│   │   │   ├── utils/
│   │   │   │   ├── jwt.js
│   │   │   │   └── hash.js
│   │   │   ├── config/
│   │   │   │   └── database.js
│   │   │   └── events/
│   │   │       ├── publisher.js
│   │   │       └── consumer.js
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── story-service/
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/
│   │   │   │   └── story.routes.js
│   │   │   ├── controllers/
│   │   │   │   └── story.controller.js
│   │   │   ├── models/
│   │   │   │   ├── post.model.js
│   │   │   │   └── postTag.model.js
│   │   │   ├── services/
│   │   │   │   ├── story.service.js
│   │   │   │   └── auth.client.js
│   │   │   ├── config/
│   │   │   │   └── database.js
│   │   │   └── events/
│   │   │       ├── publisher.js
│   │   │       └── consumer.js
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── social-service/
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/
│   │   │   │   ├── like.routes.js
│   │   │   │   ├── comment.routes.js
│   │   │   │   └── share.routes.js
│   │   │   ├── controllers/
│   │   │   │   ├── like.controller.js
│   │   │   │   ├── comment.controller.js
│   │   │   │   └── share.controller.js
│   │   │   ├── models/
│   │   │   │   ├── like.model.js
│   │   │   │   ├── comment.model.js
│   │   │   │   └── share.model.js
│   │   │   ├── services/
│   │   │   │   ├── like.service.js
│   │   │   │   ├── comment.service.js
│   │   │   │   └── story.client.js
│   │   │   ├── config/
│   │   │   │   └── database.js
│   │   │   └── events/
│   │   │       ├── publisher.js
│   │   │       └── consumer.js
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── notification-service/
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── websocket/
│   │   │   │   └── server.js
│   │   │   ├── events/
│   │   │   │   └── consumer.js
│   │   │   ├── services/
│   │   │   │   └── notification.service.js
│   │   │   └── config/
│   │   │       └── rabbitmq.js
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── shared/                        # Shared libraries
│       ├── middleware/
│       │   └── errorHandler.js
│       ├── utils/
│       │   ├── logger.js
│       │   └── validation.js
│       └── events/
│           ├── eventTypes.js
│           └── rabbitmq.js
│
├── docker-compose.microservices.yml   # New Docker Compose for microservices
├── docker-compose.yml                 # Legacy Docker Compose
├── MICROSERVICES_ARCHITECTURE.md      # Architecture documentation
├── IMPLEMENTATION_GUIDE.md            # This file
└── README.md                          # Updated README
```

## Step-by-Step Implementation

### Step 1: Create Shared Libraries

First, create shared utilities that will be used across all services.

#### Create shared event types
**File: `services/shared/events/eventTypes.js`**

```javascript
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
```

#### Create RabbitMQ connection utility
**File: `services/shared/events/rabbitmq.js`**

```javascript
import amqp from 'amqplib';

let connection = null;
let channel = null;

export const connectRabbitMQ = async (url) => {
  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
    return { connection, channel };
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
};

export const publishEvent = async (exchange, routingKey, message) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    
    await channel.assertExchange(exchange, 'topic', { durable: true });
    
    const messageBuffer = Buffer.from(JSON.stringify(message));
    channel.publish(exchange, routingKey, messageBuffer, {
      persistent: true,
      timestamp: Date.now(),
    });
    
    console.log(`Published event: ${routingKey}`, message);
  } catch (error) {
    console.error('Failed to publish event:', error);
    throw error;
  }
};

export const consumeEvents = async (queue, exchange, routingKeys, handler) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    
    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    
    // Bind routing keys
    for (const routingKey of routingKeys) {
      await channel.bindQueue(queue, exchange, routingKey);
    }
    
    channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content, msg.fields.routingKey);
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          channel.nack(msg, false, false); // Don't requeue
        }
      }
    });
    
    console.log(`Consuming events from queue: ${queue}`);
  } catch (error) {
    console.error('Failed to consume events:', error);
    throw error;
  }
};

export const closeConnection = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('Closed RabbitMQ connection');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error);
  }
};
```

### Step 2: Create Auth Service

#### Auth Service Package.json
**File: `services/auth-service/package.json`**

```json
{
  "name": "auth-service",
  "version": "1.0.0",
  "description": "Authentication and User Management Service",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.1",
    "pg": "^8.13.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "amqplib": "^0.10.5",
    "joi": "^17.9.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}
```

#### Auth Service Main Entry
**File: `services/auth-service/src/index.js`**

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import { connectDatabase } from './config/database.js';
import { connectRabbitMQ } from '../../shared/events/rabbitmq.js';
import { startEventConsumer } from './events/consumer.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth-service' });
});

// Error handling
app.use(errorHandler);

// Initialize
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected');

    // Connect to RabbitMQ
    await connectRabbitMQ(process.env.RABBITMQ_URL);
    console.log('✅ RabbitMQ connected');

    // Start event consumer
    await startEventConsumer();
    console.log('✅ Event consumer started');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Auth Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
```

#### Auth Routes
**File: `services/auth-service/src/routes/auth.routes.js`**

```javascript
import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  validateToken,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile/:id', authMiddleware, getProfile);
router.put('/profile/:id', authMiddleware, updateProfile);
router.get('/validate-token', authMiddleware, validateToken);

export default router;
```

#### Auth Controller
**File: `services/auth-service/src/controllers/auth.controller.js`**

```javascript
import * as authService from '../services/auth.service.js';
import { publishEvent } from '../../../shared/events/rabbitmq.js';
import { EventTypes, ExchangeNames } from '../../../shared/events/eventTypes.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password, role, age, gender, bio, favorite_style } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create user
    const user = await authService.registerUser({
      username,
      email,
      password,
      role: role || 'user',
      age,
      gender,
      bio,
      favorite_style,
    });

    // Publish event
    await publishEvent(ExchangeNames.USER_EXCHANGE, EventTypes.USER_REGISTERED, {
      userId: user._id,
      username: user.username,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await authService.loginUser(email, password);

    res.json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await authService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Ensure user can only update their own profile
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const user = await authService.updateUser(id, updates);

    // Publish event
    await publishEvent(ExchangeNames.USER_EXCHANGE, EventTypes.USER_UPDATED, {
      userId: user._id,
      username: user.username,
      updates,
      timestamp: new Date().toISOString(),
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

export const validateToken = async (req, res) => {
  // If middleware passes, token is valid
  res.json({
    valid: true,
    user: req.user,
  });
};
```

#### Auth Service Business Logic
**File: `services/auth-service/src/services/auth.service.js`**

```javascript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const registerUser = async (userData) => {
  const { username, email, password, role, age, gender, bio, favorite_style } = userData;

  // Check if user already exists
  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const result = await pool.query(
    `INSERT INTO users (username, email, password, role, age, gender, bio, favorite_style, total_posts)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
     RETURNING _id, username, email, role, age, gender, bio, favorite_style, total_posts`,
    [username, email, hashedPassword, role, age, gender, bio, favorite_style]
  );

  return result.rows[0];
};

export const loginUser = async (email, password) => {
  // Find user
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Remove password from response
  delete user.password;

  return { token, user };
};

export const getUserById = async (userId) => {
  const result = await pool.query(
    'SELECT _id, username, email, role, age, gender, bio, favorite_style, total_posts FROM users WHERE _id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

export const updateUser = async (userId, updates) => {
  const allowedFields = ['username', 'age', 'gender', 'bio', 'favorite_style'];
  const updateFields = [];
  const updateValues = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = $${paramIndex}`);
      updateValues.push(updates[field]);
      paramIndex++;
    }
  }

  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }

  updateValues.push(userId);
  const query = `
    UPDATE users
    SET ${updateFields.join(', ')}
    WHERE _id = $${paramIndex}
    RETURNING _id, username, email, role, age, gender, bio, favorite_style, total_posts
  `;

  const result = await pool.query(query, updateValues);
  return result.rows[0];
};

export const incrementPostCount = async (userId) => {
  await pool.query(
    'UPDATE users SET total_posts = total_posts + 1 WHERE _id = $1',
    [userId]
  );
};

export const decrementPostCount = async (userId) => {
  await pool.query(
    'UPDATE users SET total_posts = GREATEST(total_posts - 1, 0) WHERE _id = $1',
    [userId]
  );
};
```

#### Database Configuration
**File: `services/auth-service/src/config/database.js`**

```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const connectDatabase = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export default pool;
```

#### Event Consumer
**File: `services/auth-service/src/events/consumer.js`**

```javascript
import { consumeEvents } from '../../../shared/events/rabbitmq.js';
import { EventTypes, ExchangeNames, QueueNames } from '../../../shared/events/eventTypes.js';
import { incrementPostCount, decrementPostCount } from '../services/auth.service.js';

export const startEventConsumer = async () => {
  await consumeEvents(
    QueueNames.USER_QUEUE,
    ExchangeNames.POST_EXCHANGE,
    [EventTypes.POST_CREATED, EventTypes.POST_DELETED],
    async (message, routingKey) => {
      console.log(`Received event: ${routingKey}`, message);

      try {
        switch (routingKey) {
          case EventTypes.POST_CREATED:
            await incrementPostCount(message.userId);
            console.log(`Incremented post count for user ${message.userId}`);
            break;

          case EventTypes.POST_DELETED:
            await decrementPostCount(message.userId);
            console.log(`Decremented post count for user ${message.userId}`);
            break;

          default:
            console.log(`Unhandled event type: ${routingKey}`);
        }
      } catch (error) {
        console.error('Error handling event:', error);
        throw error;
      }
    }
  );
};
```

#### Auth Middleware
**File: `services/auth-service/src/middleware/auth.middleware.js`**

```javascript
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

#### Error Handler Middleware
**File: `services/auth-service/src/middleware/errorHandler.js`**

```javascript
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
```

#### Dockerfile
**File: `services/auth-service/Dockerfile`**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy shared dependencies
COPY services/shared /app/shared

# Copy service files
COPY services/auth-service/package*.json ./
RUN npm install

COPY services/auth-service/ .

EXPOSE 5001

CMD ["npm", "start"]
```

#### Environment Variables
**File: `services/auth-service/.env.example`**

```env
# Server
PORT=5001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://admin:password@auth-db:5432/auth_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# RabbitMQ
RABBITMQ_URL=amqp://rabbitmq:5672
```

### Step 3: Create API Gateway

#### API Gateway Main Entry
**File: `services/api-gateway/src/index.js`**

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import storyRoutes from './routes/story.routes.js';
import socialRoutes from './routes/social.routes.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import { SERVICES } from './config/services.config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-gateway' });
});

// Routes - Auth Service
app.use('/api/auth', authRoutes);

// Routes - Story Service
app.use('/api/stories', authMiddleware, storyRoutes);

// Routes - Social Service
app.use('/api/social', authMiddleware, socialRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});

export default app;
```

#### Service Configuration
**File: `services/api-gateway/src/config/services.config.js`**

```javascript
export const SERVICES = {
  AUTH_SERVICE: process.env.AUTH_SERVICE_URL || 'http://auth-service:5001',
  STORY_SERVICE: process.env.STORY_SERVICE_URL || 'http://story-service:5002',
  SOCIAL_SERVICE: process.env.SOCIAL_SERVICE_URL || 'http://social-service:5003',
  NOTIFICATION_SERVICE: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5004',
};
```

#### API Gateway Auth Routes
**File: `services/api-gateway/src/routes/auth.routes.js`**

```javascript
import express from 'express';
import axios from 'axios';
import { SERVICES } from '../config/services.config.js';

const router = express.Router();

// Forward all auth requests to auth service
router.post('/register', async (req, res, next) => {
  try {
    const response = await axios.post(`${SERVICES.AUTH_SERVICE}/api/auth/register`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const response = await axios.post(`${SERVICES.AUTH_SERVICE}/api/auth/login`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get('/profile/:id', async (req, res, next) => {
  try {
    const response = await axios.get(
      `${SERVICES.AUTH_SERVICE}/api/auth/profile/${req.params.id}`,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

router.put('/profile/:id', async (req, res, next) => {
  try {
    const response = await axios.put(
      `${SERVICES.AUTH_SERVICE}/api/auth/profile/${req.params.id}`,
      req.body,
      {
        headers: { Authorization: req.headers.authorization },
      }
    );
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

export default router;
```

### Step 4: Docker Compose Configuration

**File: `docker-compose.microservices.yml`**

```yaml
version: '3.8'

services:
  # Databases
  auth-db:
    image: postgres:15
    environment:
      POSTGRES_DB: auth_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - auth-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  story-db:
    image: postgres:15
    environment:
      POSTGRES_DB: story_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"
    volumes:
      - story-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  social-db:
    image: postgres:15
    environment:
      POSTGRES_DB: social_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5434:5432"
    volumes:
      - social-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: password
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Microservices
  auth-service:
    build:
      context: .
      dockerfile: services/auth-service/Dockerfile
    ports:
      - "5001:5001"
    environment:
      - PORT=5001
      - NODE_ENV=development
      - DATABASE_URL=postgresql://admin:password@auth-db:5432/auth_db
      - RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
      - JWT_SECRET=your-super-secret-jwt-key
      - JWT_EXPIRES_IN=7d
    depends_on:
      auth-db:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    restart: unless-stopped

  story-service:
    build:
      context: .
      dockerfile: services/story-service/Dockerfile
    ports:
      - "5002:5002"
    environment:
      - PORT=5002
      - NODE_ENV=development
      - DATABASE_URL=postgresql://admin:password@story-db:5432/story_db
      - RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
      - AUTH_SERVICE_URL=http://auth-service:5001
    depends_on:
      story-db:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      auth-service:
        condition: service_started
    restart: unless-stopped

  social-service:
    build:
      context: .
      dockerfile: services/social-service/Dockerfile
    ports:
      - "5003:5003"
    environment:
      - PORT=5003
      - NODE_ENV=development
      - DATABASE_URL=postgresql://admin:password@social-db:5432/social_db
      - RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
      - STORY_SERVICE_URL=http://story-service:5002
      - AUTH_SERVICE_URL=http://auth-service:5001
    depends_on:
      social-db:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      story-service:
        condition: service_started
    restart: unless-stopped

  notification-service:
    build:
      context: .
      dockerfile: services/notification-service/Dockerfile
    ports:
      - "5004:5004"
      - "8080:8080"
    environment:
      - PORT=5004
      - WEBSOCKET_PORT=8080
      - NODE_ENV=development
      - RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
    depends_on:
      rabbitmq:
        condition: service_healthy
    restart: unless-stopped

  api-gateway:
    build:
      context: .
      dockerfile: services/api-gateway/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - NODE_ENV=development
      - AUTH_SERVICE_URL=http://auth-service:5001
      - STORY_SERVICE_URL=http://story-service:5002
      - SOCIAL_SERVICE_URL=http://social-service:5003
      - NOTIFICATION_SERVICE_URL=http://notification-service:5004
      - JWT_SECRET=your-super-secret-jwt-key
    depends_on:
      - auth-service
      - story-service
      - social-service
      - notification-service
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - api-gateway
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    restart: unless-stopped

volumes:
  auth-db-data:
  story-db-data:
  social-db-data:
  rabbitmq-data:
```

## Running the Microservices

### Development Mode

```bash
# Start all services
docker-compose -f docker-compose.microservices.yml up --build

# Start specific service
docker-compose -f docker-compose.microservices.yml up auth-service

# View logs
docker-compose -f docker-compose.microservices.yml logs -f auth-service

# Stop all services
docker-compose -f docker-compose.microservices.yml down

# Remove volumes (reset databases)
docker-compose -f docker-compose.microservices.yml down -v
```

### Testing Individual Services

```bash
# Test Auth Service
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'

# Test via API Gateway
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'
```

## Database Migrations

Create migration scripts for each service's database.

**File: `services/auth-service/database/migrations/001_create_users_table.sql`**

```sql
CREATE TABLE IF NOT EXISTS users (
    _id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    age TIMESTAMP,
    gender VARCHAR(10),
    bio TEXT,
    favorite_style VARCHAR(50),
    total_posts INT DEFAULT 0 CHECK (total_posts >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

## Next Steps

1. ✅ **Created Architecture Documentation**
2. ✅ **Created Implementation Guide with Code Examples**
3. **Create remaining services** (Story, Social, Notification)
4. **Test inter-service communication**
5. **Update frontend to use API Gateway**
6. **Add monitoring and logging**
7. **Deploy to production**

Would you like me to:
1. Create the complete code for all remaining services (Story, Social, Notification)?
2. Set up the actual folder structure and files?
3. Create database migration scripts?
4. Build and test the services locally?

