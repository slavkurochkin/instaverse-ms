# Microservices Architecture Proposal for Instaverse

## Current Architecture (Monolithic)
```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│   Express Backend (5001)    │
│  ┌─────────────────────┐   │
│  │  User Routes        │   │
│  │  Story Routes       │   │
│  │  Profile Routes     │   │
│  └─────────────────────┘   │
└──────────┬──────────────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
┌──────────┐  ┌──────────────┐
│PostgreSQL│  │   RabbitMQ   │
└──────────┘  └──────┬───────┘
                     │
              ┌──────▼───────┐
              │ WebSocket    │
              │ Server:8080  │
              └──────────────┘
```

## Proposed Microservices Architecture

```
                    ┌─────────────────┐
                    │  React Frontend │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  API Gateway    │
                    │    (Kong/NGINX) │
                    │    Port: 8000   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Auth Service │    │Story Service │    │Social Service│
│   Port: 5001 │    │  Port: 5002  │    │  Port: 5003  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       │                   │                    │
       ▼                   ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Users DB   │    │  Stories DB  │    │  Social DB   │
│  (Postgres)  │    │  (Postgres)  │    │  (Postgres)  │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                    │
        └───────────────────┼────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │   Message Bus   │
                   │   (RabbitMQ)    │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Notification    │
                   │   Service       │
                   │   Port: 5004    │
                   │   WebSocket     │
                   └─────────────────┘
```

## Microservices Breakdown

### 1. **API Gateway** (Port: 8000)
- **Technology**: Kong, NGINX, or Express Gateway
- **Responsibilities**:
  - Single entry point for all client requests
  - Route requests to appropriate microservices
  - Authentication/Authorization validation
  - Rate limiting and throttling
  - Request/Response transformation
  - Load balancing
  - CORS handling
  - API versioning

### 2. **Auth Service** (Port: 5001)
- **Responsibilities**:
  - User registration and login
  - JWT token generation and validation
  - Password hashing and verification
  - User profile management
  - User authentication
- **Database**: `users_db`
- **Tables**:
  - `users` (id, username, email, password, role, age, gender, bio, favorite_style, total_posts)
- **APIs**:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/profile/:id`
  - `PUT /auth/profile/:id`
  - `GET /auth/validate-token`

### 3. **Story Service** (Port: 5002)
- **Responsibilities**:
  - CRUD operations for stories/posts
  - Image upload and storage
  - Post search and filtering
  - Post categorization
- **Database**: `stories_db`
- **Tables**:
  - `posts` (id, caption, category, device, username, user_id, image, post_date)
  - `post_tags` (id, post_id, tag)
- **APIs**:
  - `GET /stories`
  - `GET /stories/:id`
  - `POST /stories`
  - `PUT /stories/:id`
  - `DELETE /stories/:id`
  - `GET /stories/user/:userId`
  - `GET /stories/search?query=...`

### 4. **Social Service** (Port: 5003)
- **Responsibilities**:
  - Handle likes on posts
  - Handle comments on posts
  - Social media sharing
  - User interactions tracking
- **Database**: `social_db`
- **Tables**:
  - `post_likes` (id, post_id, user_id)
  - `post_comments` (id, post_id, comment_id, text, user_id, username, comment_date, seen_by_story_owner)
  - `post_social` (id, post_id, platform)
- **APIs**:
  - `POST /social/likes/:postId`
  - `DELETE /social/likes/:postId/:userId`
  - `GET /social/likes/:postId`
  - `POST /social/comments/:postId`
  - `GET /social/comments/:postId`
  - `DELETE /social/comments/:commentId`
  - `POST /social/share/:postId`

### 5. **Notification Service** (Port: 5004)
- **Responsibilities**:
  - Real-time notifications via WebSocket
  - Consume events from RabbitMQ
  - Store and retrieve offline messages
  - Push notifications
- **Technology**: WebSocket + RabbitMQ Consumer
- **Event Types**:
  - `LIKE_NOTIFICATION`
  - `COMMENT_NOTIFICATION`
  - `NEW_FOLLOWER`
  - `MENTION`
- **APIs**:
  - WebSocket: `ws://localhost:5004?userId=xxx`
  - `GET /notifications/:userId` (Get pending notifications)
  - `PUT /notifications/:id/read`

## Inter-Service Communication

### 1. **Synchronous Communication (REST)**
- Services communicate via HTTP/REST for immediate responses
- Example: Story Service calls Auth Service to validate user

### 2. **Asynchronous Communication (Event-Driven)**
- Services publish events to RabbitMQ
- Other services subscribe to relevant events
- Example Flow:
  ```
  User likes a post → Social Service publishes LIKE_EVENT 
  → Notification Service consumes event 
  → Sends WebSocket notification to post owner
  ```

### 3. **Service Discovery**
- **Option 1**: Hard-coded service URLs (simple, for development)
- **Option 2**: Consul/Eureka for dynamic service discovery
- **Option 3**: Kubernetes service mesh (for production)

## Event-Driven Architecture with RabbitMQ

### Message Exchange Patterns

```
┌──────────────────┐
│  Social Service  │
│  (Publisher)     │
└────────┬─────────┘
         │ Publish Event
         ▼
┌─────────────────────────────┐
│      RabbitMQ Exchange      │
│     (Topic Exchange)        │
└────────┬───────────┬────────┘
         │           │
         ▼           ▼
    [Queue1]    [Queue2]
         │           │
         ▼           ▼
┌──────────────┐  ┌──────────────┐
│Notification  │  │ Analytics    │
│  Service     │  │  Service     │
└──────────────┘  └──────────────┘
```

### Event Types and Routing Keys

1. **user.registered** → Notification Service (Welcome email)
2. **post.created** → Story Service, Notification Service
3. **post.liked** → Social Service, Notification Service
4. **post.commented** → Social Service, Notification Service
5. **user.profile.updated** → Auth Service

## Data Management Strategy

### Database Per Service Pattern
Each microservice has its own database to ensure:
- Data isolation
- Independent scaling
- Technology flexibility
- Fault isolation

### Data Consistency Challenges

**Problem**: When a user is deleted, their posts should also be removed.

**Solutions**:

1. **Saga Pattern**:
   - Distributed transactions across services
   - Compensating transactions on failure

2. **Event Sourcing**:
   - Store all changes as events
   - Rebuild state by replaying events

3. **Eventual Consistency**:
   - Accept temporary inconsistency
   - Use events to synchronize data

Example Flow (User Deletion):
```
1. Auth Service receives DELETE /users/:id
2. Auth Service publishes USER_DELETED event to RabbitMQ
3. Story Service listens to USER_DELETED event
4. Story Service deletes all posts by that user
5. Social Service deletes all likes/comments by that user
6. Notification Service removes pending notifications
```

## Authentication & Authorization

### JWT-Based Authentication Flow

```
1. Client → API Gateway: POST /auth/login {email, password}
2. API Gateway → Auth Service: POST /login
3. Auth Service: Validates credentials
4. Auth Service → API Gateway: JWT Token
5. API Gateway → Client: JWT Token

// Subsequent requests
6. Client → API Gateway: GET /stories (with JWT in header)
7. API Gateway: Validates JWT
8. API Gateway → Story Service: GET /stories (with user context)
9. Story Service → Client (via Gateway): Stories
```

### Service-to-Service Authentication

**Option 1: JWT Token Propagation**
- API Gateway validates JWT
- Passes JWT to downstream services
- Services trust the gateway

**Option 2: Mutual TLS (mTLS)**
- Services authenticate each other using certificates
- More secure for production

## Technology Stack

| Service | Technology | Port |
|---------|-----------|------|
| API Gateway | Kong / NGINX / Express Gateway | 8000 |
| Auth Service | Node.js + Express | 5001 |
| Story Service | Node.js + Express | 5002 |
| Social Service | Node.js + Express | 5003 |
| Notification Service | Node.js + Express + WebSocket | 5004 |
| Message Bus | RabbitMQ | 5672, 15672 |
| Databases | PostgreSQL | 5432 (multiple instances) |
| Service Discovery | Consul (optional) | 8500 |
| Container Orchestration | Docker Compose / Kubernetes | - |
| Monitoring | Prometheus + Grafana | 9090, 3001 |
| Logging | ELK Stack (Elasticsearch, Logstash, Kibana) | 9200, 5601 |

## Deployment Strategy

### Docker Compose (Development)

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

  story-db:
    image: postgres:15
    environment:
      POSTGRES_DB: story_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"

  social-db:
    image: postgres:15
    environment:
      POSTGRES_DB: social_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5434:5432"

  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  # Microservices
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "8000:8000"
    depends_on:
      - auth-service
      - story-service
      - social-service

  auth-service:
    build: ./services/auth-service
    ports:
      - "5001:5001"
    environment:
      - DATABASE_URL=postgresql://admin:password@auth-db:5432/auth_db
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - auth-db
      - rabbitmq

  story-service:
    build: ./services/story-service
    ports:
      - "5002:5002"
    environment:
      - DATABASE_URL=postgresql://admin:password@story-db:5432/story_db
      - RABBITMQ_URL=amqp://rabbitmq:5672
      - AUTH_SERVICE_URL=http://auth-service:5001
    depends_on:
      - story-db
      - rabbitmq

  social-service:
    build: ./services/social-service
    ports:
      - "5003:5003"
    environment:
      - DATABASE_URL=postgresql://admin:password@social-db:5432/social_db
      - RABBITMQ_URL=amqp://rabbitmq:5672
      - STORY_SERVICE_URL=http://story-service:5002
    depends_on:
      - social-db
      - rabbitmq

  notification-service:
    build: ./services/notification-service
    ports:
      - "5004:5004"
      - "8080:8080"
    environment:
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - rabbitmq

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - api-gateway
```

## Migration Strategy (From Monolith to Microservices)

### Phase 1: Preparation (Week 1-2)
1. Set up new project structure for microservices
2. Set up RabbitMQ and message patterns
3. Set up Docker Compose for development
4. Create shared libraries (JWT validation, database connection)

### Phase 2: Extract Auth Service (Week 3)
1. Create Auth Service with user-related endpoints
2. Create dedicated `auth_db` database
3. Migrate user-related tables
4. Test Auth Service independently
5. Update frontend to call Auth Service

### Phase 3: Extract Story Service (Week 4)
1. Create Story Service
2. Create `story_db` database
3. Migrate post and post_tags tables
4. Implement inter-service communication with Auth Service
5. Test story operations

### Phase 4: Extract Social Service (Week 5)
1. Create Social Service
2. Create `social_db` database
3. Migrate likes, comments, and social tables
4. Implement event publishing to RabbitMQ
5. Test social interactions

### Phase 5: Create Notification Service (Week 6)
1. Extract WebSocket server into Notification Service
2. Implement RabbitMQ consumers
3. Handle event-based notifications
4. Test real-time notification delivery

### Phase 6: Implement API Gateway (Week 7)
1. Set up Kong/NGINX as API Gateway
2. Configure routing rules
3. Implement authentication at gateway level
4. Test end-to-end flows

### Phase 7: Testing & Optimization (Week 8)
1. Integration testing
2. Performance testing
3. Load testing
4. Security testing
5. Documentation

### Phase 8: Deployment & Monitoring (Week 9)
1. Set up production environment
2. Deploy microservices
3. Configure monitoring (Prometheus, Grafana)
4. Set up logging (ELK Stack)
5. Implement alerting

## Benefits of This Architecture

### 1. **Scalability**
- Scale individual services based on load
- Story Service can handle more traffic than Auth Service

### 2. **Independent Deployment**
- Deploy services independently without affecting others
- Faster release cycles

### 3. **Technology Flexibility**
- Use different tech stacks for different services
- Example: Use Python for ML-based recommendation service

### 4. **Fault Isolation**
- Failure in one service doesn't crash entire application
- Circuit breakers prevent cascading failures

### 5. **Team Autonomy**
- Different teams can own different services
- Parallel development

### 6. **Better Monitoring**
- Monitor each service individually
- Identify bottlenecks easily

## Challenges & Solutions

### Challenge 1: Increased Complexity
**Solution**: Start simple, add complexity gradually. Use Docker Compose for development.

### Challenge 2: Distributed Transactions
**Solution**: Use Saga pattern and event-driven architecture.

### Challenge 3: Network Latency
**Solution**: Use caching (Redis), optimize API calls, implement GraphQL federation.

### Challenge 4: Debugging
**Solution**: Implement distributed tracing (Jaeger, Zipkin), centralized logging.

### Challenge 5: Data Consistency
**Solution**: Embrace eventual consistency, use event sourcing where needed.

## Monitoring & Observability

### Metrics to Track
- **Service Health**: CPU, Memory, Disk usage
- **API Performance**: Response time, throughput, error rates
- **Business Metrics**: Active users, posts created, likes per minute
- **Queue Metrics**: Message queue length, processing time

### Tools
1. **Prometheus**: Metrics collection
2. **Grafana**: Metrics visualization
3. **Jaeger/Zipkin**: Distributed tracing
4. **ELK Stack**: Centralized logging
5. **Sentry**: Error tracking (already integrated)

## Security Considerations

1. **API Gateway Security**:
   - Rate limiting
   - IP whitelisting
   - DDoS protection

2. **Service-to-Service Security**:
   - mTLS for inter-service communication
   - API keys or JWT for service authentication

3. **Data Security**:
   - Encrypt data at rest
   - Use HTTPS for all communications
   - Implement database encryption

4. **Secret Management**:
   - Use HashiCorp Vault or AWS Secrets Manager
   - Never hardcode secrets

## Cost Considerations

### Development Environment
- Use Docker Compose (Free)
- Single server with multiple containers

### Production Environment (AWS Example)

| Component | Service | Estimated Cost/Month |
|-----------|---------|---------------------|
| API Gateway | AWS API Gateway | $50 |
| Auth Service | ECS/EKS | $100 |
| Story Service | ECS/EKS | $150 |
| Social Service | ECS/EKS | $100 |
| Notification Service | ECS/EKS | $75 |
| Databases (3x) | RDS PostgreSQL | $300 |
| RabbitMQ | Amazon MQ | $100 |
| Load Balancer | ALB | $50 |
| Monitoring | CloudWatch | $50 |
| **Total** | | **~$975/month** |

## Next Steps

1. **Review this architecture** with your team
2. **Start with Phase 1** (Preparation)
3. **Set up development environment** with Docker Compose
4. **Extract one service at a time** (start with Auth Service)
5. **Test thoroughly** after each extraction
6. **Document everything** as you go
7. **Plan for production deployment** (Kubernetes/EKS)

## Additional Resources

- [Microservices Patterns Book by Chris Richardson](https://microservices.io/patterns/index.html)
- [Building Microservices by Sam Newman](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)

---

**Would you like me to start implementing this architecture?** I can create:
1. Complete folder structure for all microservices
2. Working code for each service
3. Docker Compose configuration
4. Database migration scripts
5. API Gateway configuration
6. RabbitMQ event handlers

