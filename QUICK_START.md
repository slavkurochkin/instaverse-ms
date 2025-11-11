# Quick Start: Migrating to Microservices

## Current vs. Proposed Architecture

### What You Have Now (Monolith)
```
Frontend (3000) → Backend (5001) → PostgreSQL
                    ↓
                 RabbitMQ → WebSocket (8080)
```
**Problem**: Everything is tightly coupled. Scaling one feature means scaling everything.

### What You'll Have (Microservices)
```
Frontend (3000) → API Gateway (8000) → Auth Service (5001) → Auth DB
                                     → Story Service (5002) → Story DB
                                     → Social Service (5003) → Social DB
                                     → Notification Service (5004)
                                          ↓
                                      RabbitMQ (Event Bus)
```
**Benefit**: Each service can scale independently, deploy independently, and fail independently.

## Why This Matters for Your Application

### 1. **Scalability**
- Your story feed gets 10x more traffic than user registration
- **Before**: Scale entire backend (expensive, wasteful)
- **After**: Scale only Story Service (cost-effective)

### 2. **Development Speed**
- Team A works on social features
- Team B works on story features
- **Before**: Merge conflicts, coordination needed
- **After**: Independent development and deployment

### 3. **Resilience**
- Social Service crashes
- **Before**: Entire app down
- **After**: Only likes/comments affected, stories still work

### 4. **Technology Freedom**
- Want to use Python for ML recommendations?
- **Before**: Rewrite entire backend
- **After**: Add new Python service, integrate via events

## Decision: Should You Do This?

### ✅ Migrate to Microservices If:
- [ ] You have 3+ developers working on backend
- [ ] Different features have different scaling needs
- [ ] You deploy multiple times per week
- [ ] Your app is growing significantly
- [ ] You want to experiment with new technologies
- [ ] You need independent team ownership

### ❌ Stick with Monolith If:
- [ ] You're a solo developer or small team (2 people)
- [ ] Your app is simple and stable
- [ ] You deploy once a month
- [ ] Operational complexity is a concern
- [ ] You don't have containerization experience

## Implementation Options

### Option 1: Big Bang Migration (2-3 months)
Build all microservices at once, switch over completely.
- **Pros**: Clean architecture, no hybrid complexity
- **Cons**: High risk, long time before value

### Option 2: Strangler Pattern (Recommended, 6-12 months)
Gradually extract services one at a time while keeping monolith running.

```
Phase 1 (Month 1-2): API Gateway + Auth Service
├── Keep existing backend
├── Add API Gateway
├── Extract Auth Service
└── Frontend calls Gateway → Gateway routes to Auth Service or Old Backend

Phase 2 (Month 3-4): Story Service
├── Extract Story Service
├── Setup inter-service communication
└── Stories now handled by Story Service

Phase 3 (Month 5-6): Social Service
├── Extract Likes/Comments
├── Implement event-driven architecture
└── Social interactions via Social Service

Phase 4 (Month 7-8): Notification Service
├── Extract WebSocket server
├── Integrate with RabbitMQ events
└── Real-time notifications via Notification Service

Phase 5 (Month 9): Retire Monolith
├── Ensure all traffic goes through microservices
├── Shutdown old backend
└── Celebrate! 🎉
```

### Option 3: Hybrid Approach (Start Small)
Keep monolith, add ONE new microservice for a new feature.
- **Pros**: Learn gradually, low risk
- **Cons**: Maintains technical debt

## Recommended: Start with Option 2

## Step-by-Step Migration (Strangler Pattern)

### Week 1-2: Setup Infrastructure

**Tasks:**
1. Set up RabbitMQ (already have it)
2. Set up separate PostgreSQL databases
3. Create shared libraries
4. Set up Docker Compose for microservices

**Commands:**
```bash
# Create new folder structure
mkdir -p services/{auth-service,story-service,social-service,notification-service,api-gateway,shared}

# Copy existing code to reference
cp -r backend backend-legacy

# Start RabbitMQ
docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management

# Create databases
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password --name auth-db postgres:15
docker run -d -p 5433:5432 -e POSTGRES_PASSWORD=password --name story-db postgres:15
docker run -d -p 5434:5432 -e POSTGRES_PASSWORD=password --name social-db postgres:15
```

### Week 3-4: Extract Auth Service

**What to Extract:**
- User registration
- User login
- Profile management
- JWT generation

**Migration Steps:**

1. **Create Auth Service**
```bash
cd services/auth-service
npm init -y
npm install express pg bcryptjs jsonwebtoken dotenv cors amqplib
```

2. **Copy User-Related Code**
- `backend/controllers/users.js` → `services/auth-service/src/controllers/`
- `backend/models/user.js` → `services/auth-service/src/models/`
- `backend/routes/users.js` → `services/auth-service/src/routes/`

3. **Create Database Migration**
```bash
psql -h localhost -p 5432 -U postgres -d auth_db < services/auth-service/database/migrations/001_create_users_table.sql
```

4. **Test Auth Service Independently**
```bash
cd services/auth-service
npm run dev

# Test registration
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

5. **Setup API Gateway (Simple Version)**
```javascript
// services/api-gateway/src/index.js
import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

// Route to Auth Service
app.use('/api/auth', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:5001${req.url}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal error' });
  }
});

// Route everything else to old backend (strangler pattern)
app.use('*', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:5001${req.url}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal error' });
  }
});

app.listen(8000, () => console.log('API Gateway running on 8000'));
```

6. **Update Frontend**
```javascript
// frontend/src/api/index.js
// Change from:
const API_URL = 'http://localhost:5001';

// To:
const API_URL = 'http://localhost:8000';
```

**Result**: Frontend → API Gateway → Auth Service (for auth) OR Old Backend (for everything else)

### Week 5-6: Extract Story Service

Same process as Auth Service but for stories/posts.

**What to Extract:**
- Post CRUD operations
- Post search
- Post categorization
- Image uploads

**Inter-Service Communication:**
```javascript
// Story Service needs to verify user exists
import axios from 'axios';

const verifyUser = async (userId, token) => {
  try {
    const response = await axios.get(
      `http://auth-service:5001/api/auth/profile/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.user;
  } catch (error) {
    throw new Error('User not found');
  }
};
```

**Event Publishing:**
```javascript
// When post is created, publish event
import { publishEvent } from '../../shared/events/rabbitmq.js';

await publishEvent('post_exchange', 'post.created', {
  postId: post.id,
  userId: post.user_id,
  caption: post.caption,
});
```

### Week 7-8: Extract Social Service

**What to Extract:**
- Likes
- Comments
- Shares

**Event-Driven Example:**
```javascript
// Social Service: When someone likes a post
export const likePost = async (postId, userId) => {
  // Save like to database
  await saveLike(postId, userId);

  // Get post details from Story Service
  const post = await storyClient.getPost(postId);

  // Publish event for Notification Service
  await publishEvent('social_exchange', 'post.liked', {
    postId,
    postOwnerId: post.userId,
    likedByUserId: userId,
  });
};
```

```javascript
// Notification Service: Consume like events
consumeEvents('notification_queue', 'social_exchange', ['post.liked'], async (message) => {
  // Send WebSocket notification to post owner
  sendNotificationToUser(message.postOwnerId, {
    type: 'LIKE',
    postId: message.postId,
    likedBy: message.likedByUserId,
  });
});
```

### Week 9: Extract Notification Service

**What to Extract:**
- Existing `backend/consumer.js`
- WebSocket server

Just move the code into its own service!

### Week 10: Remove Old Backend

Once all traffic flows through microservices:
```bash
# Stop old backend
pm2 stop backend

# Monitor for errors
# If no issues after 1 week, delete old backend
rm -rf backend-legacy
```

## Testing Strategy

### 1. Unit Tests (Each Service)
```bash
cd services/auth-service
npm test
```

### 2. Integration Tests (Service to Service)
Test Auth Service can talk to Story Service.

### 3. Contract Tests (Already have Pact!)
Ensure API contracts between services don't break.

### 4. E2E Tests (Already have Playwright!)
Test entire user journey through API Gateway.

### 5. Load Tests
```bash
# Install artillery
npm install -g artillery

# Load test Story Service
artillery quick --count 100 -n 20 http://localhost:5002/api/stories
```

## Monitoring Setup

### Basic Monitoring (Start Here)

**1. Health Checks**
```javascript
// Each service
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});
```

**2. Structured Logging**
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

logger.info('User registered', { userId: user.id, email: user.email });
```

**3. Request Tracing**
Add correlation ID to track requests across services:
```javascript
// API Gateway adds correlation ID
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);
  next();
});

// Pass to downstream services
axios.get('http://auth-service/api/auth/profile/1', {
  headers: { 'x-correlation-id': req.correlationId },
});

// Log with correlation ID
logger.info('Processing request', { correlationId: req.correlationId });
```

### Advanced Monitoring (Later)

**Prometheus + Grafana**
```bash
docker run -d -p 9090:9090 prom/prometheus
docker run -d -p 3001:3000 grafana/grafana
```

## Common Pitfalls & Solutions

### Pitfall 1: Distributed Transactions
**Problem**: User registers, but post creation fails. Now user exists but post doesn't.

**Solution**: Use Saga pattern with compensating transactions.

### Pitfall 2: Network Latency
**Problem**: Now 3 service calls instead of 1 database call.

**Solution**: 
- Cache frequently accessed data (Redis)
- Use async communication where possible
- Implement GraphQL Federation for efficient data fetching

### Pitfall 3: Debugging Complexity
**Problem**: Request fails, but which service caused it?

**Solution**:
- Correlation IDs
- Distributed tracing (Jaeger)
- Centralized logging (ELK)

### Pitfall 4: Data Inconsistency
**Problem**: User deleted from Auth Service, but posts still exist in Story Service.

**Solution**: Event-driven architecture with eventual consistency.
```javascript
// Auth Service publishes USER_DELETED event
// Story Service listens and deletes user's posts
```

## Cost Analysis

### Current Setup (Monolith)
```
1 Backend Server:  $50/month
1 Database:        $100/month
1 RabbitMQ:        $50/month
Total:             $200/month
```

### Microservices (Production)
```
4 Services:        $400/month (4 x $100)
3 Databases:       $300/month (3 x $100)
1 RabbitMQ:        $100/month
1 API Gateway:     $50/month
1 Load Balancer:   $50/month
Monitoring:        $50/month
Total:             $950/month
```

**Cost Optimization:**
- Start with smaller instances
- Use spot instances
- Scale services independently based on actual load
- Effective cost: ~$400-500/month

## Decision Time

### I Recommend: **Start with Strangler Pattern**

**Immediate Next Steps (This Week):**

1. **Read both documentation files I created**
   - `MICROSERVICES_ARCHITECTURE.md` - High-level architecture
   - `IMPLEMENTATION_GUIDE.md` - Code examples

2. **Decide on timeline**
   - Are you ready for 3-6 month migration?
   - Can you dedicate 10-20 hours/week?

3. **Set up development environment**
   ```bash
   # Try the Docker Compose setup
   docker-compose -f docker-compose.microservices.yml up
   ```

4. **Start with Auth Service extraction**
   - Lowest risk
   - Clear boundaries
   - Good learning experience

**Would you like me to:**
1. ✅ Create the complete folder structure with all services
2. ✅ Build working Auth Service as starting point
3. ✅ Set up Docker Compose that works
4. ✅ Create migration scripts for databases
5. ✅ Update frontend to use API Gateway

Just let me know and I'll build it all for you!

## Resources I Created For You

1. ✅ `MICROSERVICES_ARCHITECTURE.md` - Complete architecture documentation
2. ✅ `IMPLEMENTATION_GUIDE.md` - Step-by-step code implementation
3. ✅ `QUICK_START.md` - This file (decision guide)

## Questions to Consider

1. **Team Size**: How many developers will work on this?
2. **Timeline**: When do you need this completed?
3. **Experience**: Comfortable with Docker, RabbitMQ, microservices?
4. **Goal**: Why microservices? (Scale? Team independence? Learning?)
5. **Risk Tolerance**: Comfortable with increased complexity?

Let me know your answers and I'll provide a customized migration plan!

