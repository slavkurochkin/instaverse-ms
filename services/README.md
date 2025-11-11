# 🎯 Microservices Directory

This directory contains all microservices for the Instaverse application.

## 📁 Structure

```
services/
├── shared/              # Shared utilities and libraries
│   ├── events/         # Event types and RabbitMQ utilities
│   ├── middleware/     # Shared middleware (error handling)
│   ├── utils/          # Utilities (logger, JWT)
│   └── config/         # Shared configurations
│
├── api-gateway/        # API Gateway (Port 8000)
├── auth-service/       # Authentication Service (Port 5001)
├── story-service/      # Story/Post Service (Port 5002)
├── social-service/     # Social Interactions Service (Port 5003)
└── notification-service/ # Notification Service (Port 5004 + WebSocket 8080)
```

## 🚀 Services Overview

### API Gateway (Port 8000)
**Purpose**: Single entry point for all client requests

**Features**:
- Route requests to appropriate microservices
- Rate limiting (100 req/15min per IP)
- CORS handling
- Request logging
- Error handling

**Routes**:
- `/api/auth/*` → Auth Service
- `/api/stories/*` → Story Service
- `/api/social/*` → Social Service

---

### Auth Service (Port 5001)
**Purpose**: User authentication and management

**Features**:
- User registration
- User login with JWT
- Profile management
- Token validation
- Event publishing (user.registered, user.updated, user.deleted)

**Database**: `auth_db` (PostgreSQL)
- users table

**Events Consumed**:
- `post.created` → Increment user's post count
- `post.deleted` → Decrement user's post count

**APIs**:
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/profile/:id`
- PUT `/api/auth/profile/:id`
- DELETE `/api/auth/profile/:id`
- GET `/api/auth/validate-token`

---

### Story Service (Port 5002)
**Purpose**: Manage posts/stories

**Features**:
- CRUD operations for posts
- Tag management
- Search and filter
- Image handling
- Event publishing (post.created, post.updated, post.deleted)

**Database**: `story_db` (PostgreSQL)
- posts table
- post_tags table

**Events Consumed**:
- `user.deleted` → Delete all posts by user

**APIs**:
- GET `/api/stories` - Get all stories (paginated)
- GET `/api/stories/:id` - Get single story
- GET `/api/stories/user/:userId` - Get user's stories
- GET `/api/stories/search?query=...` - Search stories
- POST `/api/stories` - Create story (auth required)
- PUT `/api/stories/:id` - Update story (auth required)
- DELETE `/api/stories/:id` - Delete story (auth required)

---

### Social Service (Port 5003)
**Purpose**: Handle social interactions (likes, comments, shares)

**Features**:
- Like/unlike posts
- Comment on posts
- Share posts to social media
- Event publishing (post.liked, post.commented, post.shared)

**Database**: `social_db` (PostgreSQL)
- post_likes table
- post_comments table
- post_social table

**Events Consumed**:
- `post.deleted` → Delete all likes, comments, shares for post

**APIs**:
- POST `/api/social/likes/:postId` - Like post (auth required)
- DELETE `/api/social/likes/:postId` - Unlike post (auth required)
- GET `/api/social/likes/:postId` - Get post likes
- POST `/api/social/comments/:postId` - Add comment (auth required)
- GET `/api/social/comments/:postId` - Get post comments
- DELETE `/api/social/comments/:commentId` - Delete comment (auth required)
- POST `/api/social/shares/:postId` - Share post (auth required)

---

### Notification Service (Port 5004, WebSocket 8080)
**Purpose**: Real-time notifications via WebSocket

**Features**:
- WebSocket connections
- Real-time push notifications
- Offline message queueing
- Event-driven notifications

**Events Consumed**:
- `post.liked` → Notify post owner
- `post.commented` → Notify post owner
- `post.shared` → Notify post owner

**WebSocket Connection**:
```javascript
const ws = new WebSocket('ws://localhost:8080?userId=123');
ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('Received notification:', notification);
};
```

**Notification Types**:
- `LIKE` - Someone liked your post
- `COMMENT` - Someone commented on your post
- `SHARE` - Your post was shared

---

## 🔄 Inter-Service Communication

### Synchronous (HTTP)
Services call each other directly via HTTP when immediate response is needed.

Example: Story Service validates user token with Auth Service

### Asynchronous (RabbitMQ Events)
Services publish and consume events for loosely coupled communication.

Example: Social Service publishes `post.liked` event, Notification Service consumes it

---

## 📊 Event Flow Examples

### Example 1: User Creates a Post

```
1. Client → API Gateway
2. API Gateway → Story Service
3. Story Service validates token with Auth Service
4. Story Service creates post in database
5. Story Service publishes POST_CREATED event to RabbitMQ
6. Auth Service consumes POST_CREATED event
7. Auth Service increments user's post count
```

### Example 2: User Likes a Post

```
1. Client → API Gateway
2. API Gateway → Social Service
3. Social Service creates like in database
4. Social Service publishes POST_LIKED event to RabbitMQ
5. Notification Service consumes POST_LIKED event
6. Notification Service sends WebSocket notification to post owner
7. Post owner receives real-time notification
```

---

## 🛠️ Development

### Adding a New Service

1. Create service directory:
   ```bash
   mkdir -p services/my-service/src/{routes,controllers,services,middleware}
   ```

2. Create `package.json`:
   ```json
   {
     "name": "my-service",
     "type": "module",
     "main": "src/index.js",
     "dependencies": {
       "express": "^4.18.2",
       "dotenv": "^16.0.3",
       ...
     }
   }
   ```

3. Create `Dockerfile`

4. Add to `docker-compose.microservices.yml`

5. Update API Gateway routing if needed

### Using Shared Libraries

```javascript
// Import shared utilities
import { createLogger } from '../../shared/utils/logger.js';
import { publishEvent } from '../../shared/events/rabbitmq.js';
import { EventTypes, ExchangeNames } from '../../shared/events/eventTypes.js';
import { errorHandler } from '../../shared/middleware/errorHandler.js';

// Use them
const logger = createLogger('MY-SERVICE');
logger.info('Service started');

await publishEvent(ExchangeNames.POST_EXCHANGE, EventTypes.POST_CREATED, {
  postId: 123,
  userId: 456,
});
```

---

## 🧪 Testing Services

### Test Locally (Without Docker)

1. Start individual service:
   ```bash
   cd services/auth-service
   npm install
   npm run dev
   ```

2. Ensure dependencies are running (PostgreSQL, RabbitMQ)

### Test with Docker

```bash
# Build and start all services
docker-compose -f docker-compose.microservices.yml up --build

# Test specific service
docker-compose -f docker-compose.microservices.yml up auth-service
```

---

## 📦 Deployment

### Development
Use `docker-compose.microservices.yml`

### Production
Consider:
- Kubernetes for orchestration
- Managed databases (AWS RDS, Google Cloud SQL)
- Managed message queue (CloudAMQP, AWS MQ)
- Container registry (Docker Hub, AWS ECR, Google GCR)
- Load balancers
- Auto-scaling policies
- Health checks and monitoring

---

## 🔍 Monitoring

Each service exposes a `/health` endpoint:

```bash
curl http://localhost:5001/health
curl http://localhost:5002/health
curl http://localhost:5003/health
curl http://localhost:5004/health
curl http://localhost:8000/health
```

---

## 📝 Logging

All services use the shared logger:

```javascript
import { createLogger } from '../../shared/utils/logger.js';
const logger = createLogger('SERVICE-NAME');

logger.info('Info message', { key: 'value' });
logger.error('Error message', { error: error.message });
logger.warn('Warning message');
logger.debug('Debug message'); // Only in development
```

Logs include:
- Timestamp
- Service name
- Log level
- Message
- Metadata

---

## 🎓 Best Practices

1. **Service Independence**: Each service should be deployable independently
2. **Database Per Service**: No shared databases between services
3. **Event-Driven**: Use events for async communication
4. **API Contracts**: Document APIs clearly
5. **Health Checks**: Implement health endpoints
6. **Error Handling**: Use shared error handling middleware
7. **Logging**: Use structured logging
8. **Security**: Validate all inputs, use HTTPS, secure secrets
9. **Testing**: Unit tests, integration tests, contract tests
10. **Monitoring**: Track metrics, set up alerts

---

## 🔗 Related Documentation

- [Main README](../README.md)
- [Microservices Architecture](../MICROSERVICES_ARCHITECTURE.md)
- [Implementation Guide](../IMPLEMENTATION_GUIDE.md)
- [Setup Guide](../MICROSERVICES_SETUP.md)

---

**Built with ❤️ for scalability and team collaboration**

