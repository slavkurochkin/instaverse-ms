# Instaverse Automation

Instaverse Automation is a full-stack web application built with **microservices architecture**. Built with React frontend, Node.js/Express microservices, and PostgreSQL databases. The project includes comprehensive testing, monitoring, and DevOps tools.

## Table of Contents

- [Application Demo](#application-demo)
- [Architecture](#architecture)
- [Features](#features)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Microservices Details](#microservices-details)
- [Notifications System](#notification-system-overview)
- [API Documentation](#api-documentation)
- [SonatQube Configuration](#sonarqube-configuration)
- [Testing](#testing)
- [Pre-Commit Hooks Setup](#pre-commit-hooks-setup)
- [Monitoring and Observability](#monitoring-and-observability-with-sentry)
- [Contributing](#contributing)

## Application Demo

Login, sorting and commenting

![Application Demo](/assets/instaverse-1.gif)

Dashboard

![Application Demo](/assets/instaverse-2.gif)

Adding new story and deleting it

![Application Demo](/assets/instaverse-3.gif)

## Architecture

Modern distributed architecture with independent services:

```
                    ┌─────────────────┐
                    │  React Frontend │
                    │   (Port: 3000)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  API Gateway    │
                    │   (Port: 8000)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┬─────────────────┐
        │                    │                    │                 │
        ▼                    ▼                    ▼                 ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐  ┌────────────────┐
│ Auth Service │    │Story Service │    │Social Service│  │  Notification  │
│ (Port: 5001) │    │ (Port: 5002) │    │ (Port: 5003) │  │Service (5004)  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘  └───────┬────────┘
       │                   │                    │                  │
       ▼                   ▼                    ▼                  │
┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  Auth DB     │    │  Story DB    │    │  Social DB   │         │
│ (Port: 5435) │    │ (Port: 5433) │    │ (Port: 5434) │         │
└──────────────┘    └──────────────┘    └──────────────┘         │
       │                   │                    │                  │
       └───────────────────┼────────────────────┴──────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │    RabbitMQ     │
                  │ Message Broker  │
                  │   (Port: 5672)  │
                  │Management:15672 │
                  └─────────────────┘
```

## Project Structure

```
instaverse-automation/
├── frontend/                 # React frontend application
│   ├── src/                  # Source code
│   ├── public/               # Static assets
│   └── Dockerfile.microservices  # Microservices Docker config
│
├── services/                 # Microservices
│   ├── shared/              # Shared utilities and middleware
│   │   ├── events/          # RabbitMQ event handlers
│   │   ├── middleware/      # Common middleware
│   │   └── utils/           # Utility functions
│   │
│   ├── api-gateway/         # API Gateway (Port: 8000)
│   │   └── src/
│   │       ├── routes/      # Gateway routing
│   │       └── middleware/  # Auth, CORS, rate limiting
│   │
│   ├── auth-service/        # Authentication Service (Port: 5001)
│   │   └── src/
│   │       ├── controllers/ # Auth controllers
│   │       ├── routes/      # Auth routes
│   │       └── services/    # Business logic
│   │
│   ├── story-service/       # Story/Post Service (Port: 5002)
│   │   └── src/
│   │       ├── controllers/ # Story controllers
│   │       ├── routes/      # Story routes
│   │       └── services/    # Business logic
│   │
│   ├── social-service/      # Social Interactions (Port: 5003)
│   │   └── src/
│   │       ├── controllers/ # Likes, comments controllers
│   │       ├── routes/      # Social routes
│   │       └── services/    # Business logic
│   │
│   └── notification-service/ # Real-time Notifications (Port: 5004)
│       └── src/
│           ├── events/      # RabbitMQ consumers
│           └── websocket/   # WebSocket server
│
├── database/                 # Database migrations
│   └── migrations/
│       ├── auth/            # Auth service migrations
│       ├── story/           # Story service migrations
│       └── social/          # Social service migrations
│
├── docker-compose.yml           # Docker setup for frontend
├── docker-compose.microservices.yml  # Microservices Docker setup
├── start-microservices.sh       # Start microservices script
└── stop-microservices.sh        # Stop microservices script
```

## Features

### Core Features
- **Frontend:** React with Ant Design UI components
- **Backend:** Node.js + Express.js Microservices Architecture
- **Database:** PostgreSQL with separate databases per microservice
- **Real-time:** WebSocket-based notifications
- **Message Queue:** RabbitMQ for event-driven architecture

### Microservices
- Distributed architecture with 5 independent services
  - API Gateway for routing and authentication
  - Auth Service for user management
  - Story Service for posts/stories
  - Social Service for likes/comments
  - Notification Service for real-time updates

### Development Tools
- **Linting & Formatting:** ESLint and Prettier
- **Security Scanner:** SonarQube integration
- **Docker Support:** Full containerization with Docker Compose
- **API Documentation:** OpenAPI/Swagger documentation
- **Contract Testing:** Pact for consumer-driven contracts
- **Unit Testing:** Jest with coverage reports
- **E2E Testing:** Playwright for end-to-end tests
- **Monitoring:** Sentry for error tracking
- **Pre-commit Hooks:** Automated testing before commits

## Getting Started

### Prerequisites

- Node.js (>=14.x)
- npm (>=7.x)
- Docker and Docker Compose

### Microservices Setup

#### 1. Quick Start (Recommended)

Use the provided startup script:

```bash
chmod +x start-microservices.sh
./start-microservices.sh
```

This script will:
- ✅ Check Docker is running
- ✅ Build and start all services
- ✅ Initialize databases
- ✅ Check service health
- ✅ Display service status

#### 2. Manual Setup

**Start all services:**
```bash
docker-compose -f docker-compose.microservices.yml up --build -d
```

**Check service health:**
```bash
docker-compose -f docker-compose.microservices.yml ps
```

**View logs for a specific service:**
```bash
docker-compose -f docker-compose.microservices.yml logs -f story-service
```

**Stop all services:**
```bash
./stop-microservices.sh
# or
docker-compose -f docker-compose.microservices.yml down
```

#### 3. Access Services

Once all services are running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React application |
| **API Gateway** | http://localhost:8000 | Single entry point for all APIs |
| **Auth Service** | http://localhost:5001 | User authentication |
| **Story Service** | http://localhost:5002 | Posts/stories management |
| **Social Service** | http://localhost:5003 | Likes and comments |
| **Notification Service** | http://localhost:5004 | HTTP health check |
| **WebSocket** | ws://localhost:8080 | Real-time notifications |
| **RabbitMQ Management** | http://localhost:15672 | Message queue admin (admin/password) |

#### 4. Service Health Check

All microservices expose a `/health` endpoint:

```bash
# Check all services
curl http://localhost:8000/health  # API Gateway
curl http://localhost:5001/health  # Auth Service
curl http://localhost:5002/health  # Story Service
curl http://localhost:5003/health  # Social Service
curl http://localhost:5004/health  # Notification Service
```

#### 5. Database Access

Each service has its own PostgreSQL database:

```bash
# Auth Database (Port: 5435)
docker exec -it auth-db psql -U admin -d auth_db

# Story Database (Port: 5433)
docker exec -it story-db psql -U admin -d story_db

# Social Database (Port: 5434)
docker exec -it social-db psql -U admin -d social_db
```

## Microservices Details

### Overview

The microservices architecture consists of 5 independent services, each with its own responsibility, database, and API endpoints. Services communicate via REST APIs and event-driven messaging through RabbitMQ.

### 1. API Gateway (Port: 8000)

**Purpose:** Single entry point for all client requests

**Responsibilities:**
- Route requests to appropriate microservices
- JWT authentication and validation
- CORS handling and security headers
- Request/response logging
- Health check aggregation

**Key Endpoints:**
```
GET  /health              # Gateway health status
POST /api/auth/*          # Routes to Auth Service
GET  /api/stories/*       # Routes to Story Service
POST /api/social/*        # Routes to Social Service
```

**Technology Stack:**
- Node.js + Express
- JWT validation middleware
- HTTP proxy for routing

---

### 2. Auth Service (Port: 5001)

**Purpose:** User authentication and management

**Responsibilities:**
- User registration and login
- JWT token generation and validation
- Password hashing (bcrypt)
- User profile management
- User data retrieval

**Database:** `auth_db` (PostgreSQL on port 5435)

**Tables:**
- `users` - User accounts and profiles

**Key Endpoints:**
```
POST /api/auth/register        # Create new user account
POST /api/auth/login           # Authenticate and get JWT token
GET  /api/auth/profile/:id     # Get user profile
PUT  /api/auth/profile/:id     # Update user profile
DELETE /api/auth/users/:id     # Delete user (admin only)
GET  /health                   # Service health check
```

**Events Published:**
- `user.registered` - When a new user signs up
- `user.deleted` - When a user account is deleted
- `user.updated` - When user profile is updated

---

### 3. Story Service (Port: 5002)

**Purpose:** Manage posts/stories content

**Responsibilities:**
- CRUD operations for posts
- Image upload and storage
- Post search and filtering
- Tag management
- Category organization

**Database:** `story_db` (PostgreSQL on port 5433)

**Tables:**
- `posts` - Story/post content
- `post_tags` - Tags associated with posts
- `post_social` - Social media sharing platforms

**Key Endpoints:**
```
GET  /api/stories              # Get all stories (paginated)
GET  /api/stories/:id          # Get single story by ID
POST /api/stories              # Create new story
PUT  /api/stories/:id          # Update existing story
DELETE /api/stories/:id        # Delete story
GET  /api/stories/user/:userId # Get stories by user
GET  /api/stories/search       # Search stories
GET  /health                   # Service health check
```

**Events Published:**
- `post.created` - When a new post is created
- `post.updated` - When a post is modified
- `post.deleted` - When a post is deleted

**Events Consumed:**
- `user.deleted` - Delete all posts by deleted user

---

### 4. Social Service (Port: 5003)

**Purpose:** Handle social interactions (likes, comments, shares)

**Responsibilities:**
- Like/unlike posts
- Add/delete comments
- Track social interactions
- Share posts to social media
- Manage user engagement

**Database:** `social_db` (PostgreSQL on port 5434)

**Tables:**
- `post_likes` - User likes on posts
- `post_comments` - Comments on posts
- `post_social` - Social sharing records

**Key Endpoints:**
```
POST   /api/social/likes/:postId      # Like a post (toggle)
DELETE /api/social/likes/:postId      # Unlike a post
GET    /api/social/likes/:postId      # Get likes for a post

POST   /api/social/comments/:postId   # Add comment to post
GET    /api/social/comments/:postId   # Get comments for a post
DELETE /api/social/comments/:commentId # Delete a comment

POST   /api/social/shares/:postId     # Share post
GET    /health                         # Service health check
```

**Events Published:**
- `post.liked` - When a user likes a post
- `post.unliked` - When a user unlikes a post
- `post.commented` - When a comment is added
- `comment.deleted` - When a comment is removed
- `post.shared` - When a post is shared

**Events Consumed:**
- `user.deleted` - Delete all likes/comments by deleted user

---

### 5. Notification Service (Port: 5004, WebSocket: 8080)

**Purpose:** Real-time notifications via WebSocket

**Responsibilities:**
- WebSocket server for real-time communication
- Consume events from RabbitMQ
- Send notifications to connected users
- Store notifications for offline users
- Deliver pending notifications on reconnect

**Technology Stack:**
- Node.js + Express (HTTP)
- WebSocket (ws library)
- RabbitMQ consumer

**Key Endpoints:**
```
GET /health                    # Service health check
WS  ws://localhost:8080?userId=<id>  # WebSocket connection
```

**Events Consumed:**
- `post.liked` - Notify post owner
- `post.commented` - Notify post owner
- `post.shared` - Notify post owner
- `user.registered` - Send welcome notification

**Notification Types:**
```javascript
{
  type: 'LIKE',
  postId: 123,
  username: 'john_doe',
  message: 'john_doe liked your post',
  timestamp: '2024-11-08T...'
}

{
  type: 'COMMENT',
  postId: 123,
  commentId: 'uuid',
  username: 'jane_smith',
  text: 'Great photo!',
  message: 'jane_smith commented on your post',
  timestamp: '2024-11-08T...'
}
```

---

### Inter-Service Communication

#### Synchronous (REST API)
Services make direct HTTP calls when immediate response is needed:

```javascript
// Story Service fetching user data from Auth Service
const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/profile/${userId}`);
```

#### Asynchronous (Event-Driven)
Services publish events to RabbitMQ for loose coupling:

```javascript
// Social Service publishing a like event
await publishEvent('social.exchange', 'post.liked', {
  postId: 123,
  userId: 456,
  timestamp: new Date().toISOString()
});
```

#### Event Flow Example: User Likes a Post

```
1. Client → API Gateway: POST /api/social/likes/123
2. API Gateway → Social Service: POST /likes/123
3. Social Service: Save like to database
4. Social Service → RabbitMQ: Publish POST_LIKED event
5. RabbitMQ → Notification Service: Deliver event
6. Notification Service → WebSocket: Send notification to post owner
7. Post owner receives real-time notification ✅
```

---

### Database Per Service Pattern

Each microservice has its own database for:

✅ **Data Isolation** - Services can't directly access other services' data  
✅ **Independent Scaling** - Scale databases based on service needs  
✅ **Technology Flexibility** - Use different DB types per service if needed  
✅ **Fault Isolation** - DB failure affects only one service  

**Database Ports:**
- Auth DB: `localhost:5435`
- Story DB: `localhost:5433`
- Social DB: `localhost:5434`

---

### Shared Components

Located in `/services/shared/`:

**1. Event System (`events/`)**
- `rabbitmq.js` - RabbitMQ connection and utilities
- `eventTypes.js` - Event type constants and routing keys

**2. Middleware (`middleware/`)**
- `errorHandler.js` - Global error handling
- Common middleware shared across services

**3. Utilities (`utils/`)**
- `logger.js` - Structured logging
- `db.js` - Database connection pooling

---

### Benefits of This Architecture

1. **Scalability** - Scale services independently based on load
2. **Resilience** - Service failures are isolated
3. **Development Speed** - Teams work on services in parallel
4. **Technology Freedom** - Use best tech for each service
5. **Deployment Flexibility** - Deploy services independently
6. **Easier Testing** - Test services in isolation
7. **Better Monitoring** - Track performance per service

---

# Database Setup

## Overview

This document provides the schema and setup instructions for the databases used in the project. In microservices architecture, each service has its own database.

## Database Schema

![Database schema](/assets/db-diagram.png)

### **Users Table**

Stores user information, including total posts.

```sql
CREATE TABLE users (
    _id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    age TIMESTAMP,
    gender VARCHAR(10),
    bio TEXT,
    favorite_style VARCHAR(50),
    total_posts INT DEFAULT 0 CHECK (total_posts >= 0),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
```

### **Posts Table**

Stores posts made by users.

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    caption TEXT NOT NULL,
    category TEXT NOT NULL,
    device TEXT NOT NULL,
    username TEXT NOT NULL,
    user_id INT NOT NULL,
    image TEXT NOT NULL,  -- Storing base64 string
    post_date TIMESTAMP NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(_id) ON DELETE CASCADE
);
```

### **Post Tags Table**

Stores tags associated with posts.

```sql
CREATE TABLE post_tags (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

### **Post Social Table**

Stores social platforms where a post is shared.

```sql
CREATE TABLE post_social (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    platform TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

### **Post Likes Table**

```sql
CREATE TABLE post_likes (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

### **Comments Table**

Stores comments on posts.

```sql
CREATE TABLE post_comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    comment_id TEXT NOT NULL,
    text TEXT NOT NULL,
    user_id INT NOT NULL,
    username TEXT NOT NULL,
    comment_date TIMESTAMP NOT NULL,
    seen_by_story_owner BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

## Setup Instructions

1. Install PostgreSQL and create databases for each microservice.
2. Run the schema creation queries from `database/migrations/`.
3. Ensure proper indexing for faster queries.
4. Use transactions when inserting multiple related records.
5. Configure environment variables for each microservice.

## Future Enhancements

- Add soft deletes for posts and comments.
- Implement indexing for faster lookups on `user_id` and `post_id`.
- Introduce triggers to update `total_posts` automatically.

---

# Notification System Overview

This project provides a WebSocket-based notification system integrated with RabbitMQ to deliver real-time notifications to users. The system is designed to handle both online and offline users by storing notifications for offline users and sending them when they reconnect.

![RabbitMQ](/assets/rabbitmq.png)

![Notifications Demo](/assets/notifications.gif)

## Features

- **Real-time notifications via WebSocket**: Clients (users) can connect to a WebSocket server to receive notifications.
- **Offline message storage**: If a user is offline when a message is sent, the notification will be stored and delivered once the user reconnects.
- **RabbitMQ integration**: Notifications are received from a RabbitMQ queue and delivered to the correct user through the WebSocket connection.

## Architecture

1. **WebSocket Server** (`ws`):

   - A WebSocket server listens for incoming WebSocket connections from clients.
   - Each client must include a `userId` as a query parameter when connecting. This ensures the server can associate messages with the correct user.
   - When a client reconnects, it will receive any pending messages that were stored while it was offline. If no pending messages exist, the client receives a `user_back_online` notification.

2. **Pending Messages Storage**:

   - The server stores messages for offline users in a `pendingMessages` map, where the key is the `userId` and the value is an array of messages.
   - When a client connects, the system checks if there are any pending messages. If so, they are sent immediately upon connection.

3. **RabbitMQ Consumer**:
   - The system listens to a RabbitMQ queue (`notifications`) for new messages.
   - Upon receiving a message, the system checks if the corresponding user is online via WebSocket. If the user is online, the message is sent immediately. If the user is offline, the message is stored for future delivery when the user reconnects.

## How it Works

1. **Client Connection**:

   - A client (user) connects to the WebSocket server with the URL:
     ```
     ws://localhost:8080?userId=<userId>
     ```
   - The server checks if the `userId` is provided and establishes a WebSocket connection.

2. **Sending Notifications**:

   - Notifications are sent to users via WebSocket when new messages are received from RabbitMQ.
   - If the user is online, the message is immediately sent to the WebSocket client.
   - If the user is offline, the message is stored in the `pendingMessages` map associated with the `userId`.

3. **Offline Message Handling**:
   - When an offline user reconnects, the WebSocket server checks if there are any pending messages for that user.
   - If pending messages exist, they are sent to the user upon connection.
   - If no pending messages exist, the server sends a `user_back_online` notification.

## Setup and Running the Project

1. **Install Dependencies**:

   - Install the required dependencies for the project:
     ```bash
     npm install
     ```

2. **Start RabbitMQ**:

   - Ensure that RabbitMQ is running on `localhost:5672`. You can use Docker to run RabbitMQ:
     ```bash
     docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:management
     ```

3. **Start the Notification Service**:

   - Run the notification service with WebSocket server:
     ```bash
     cd services/notification-service
     npm start
     ```

4. **Consume Messages from RabbitMQ**:

   - The system will automatically start consuming messages from the `notifications` queue in RabbitMQ. Ensure that your RabbitMQ server has a queue named `notifications`.

5. **Client Example**:
   - You can connect a WebSocket client using the URL:
     ```
     ws://localhost:8080?userId=<userId>
     ```
     to test the notification system.

## Example Notification Flow

1. **User 1 sends a notification**:
   - A notification is published to the RabbitMQ `notifications` queue with a payload:
     ```json
     {
       "type": "LIKE",
       "postId": "1",
       "userId": 2,
       "likedBy": 7
     }
     ```
2. **User 2 is offline**:

   - The notification for User 2 is stored in the `pendingMessages` map because User 2 is not connected at the time the message is sent.

3. **User 2 reconnects**:

   - Upon reconnecting, the WebSocket server sends any pending messages to User 2.

4. **User 1 receives a message**:
   - If User 1 is connected, they receive the notification in real-time.

## Notes

- **WebSocket Reconnection**: The WebSocket client should handle reconnections to ensure that users who disconnect and reconnect can still receive their notifications.
- **Message Persistence**: The messages are stored in memory. If the server is restarted, the pending messages are lost. Consider integrating a persistent storage solution for message durability if needed.

## Troubleshooting

- **WebSocket Not Connecting**: Ensure that the `userId` query parameter is properly set when connecting to the WebSocket server.
- **Messages Not Delivered**: Check if RabbitMQ is running and the queue is properly set up. Verify that the server is consuming messages from the correct queue.

```
cd services/notification-service && npm start
```

### Docker Setup

Build and start all microservices using Docker Compose:

```bash
docker-compose -f docker-compose.microservices.yml up --build
```

## API Documentation

OpenAPI/Swagger documentation is available for each microservice:

```
Auth Service: http://localhost:5001/api-docs
Story Service: http://localhost:5002/api-docs
Social Service: http://localhost:5003/api-docs
```

![Documentation Demo](/assets/api-docs.gif)

## SonarQube Configuration

This project includes a SonarQube setup that can be run locally for code quality analysis.

![Documentation Demo](/assets/sonarq.gif)

### Running SonarQube Locally

1. Ensure you have Docker installed and running on your machine.
2. Use the following command to start SonarQube:
   ```bash
   docker-compose up -d
   ```
3. Access SonarQube UI at `http://localhost:9000`.
4. Default credentials:
   - Username: `admin`
   - Password: `admin`

### Running Analysis

Run the following command to trigger a code analysis using SonarScanner:

```bash
sonar-scanner
```

Ensure your `sonar-project.properties` file is correctly configured in the root directory.

### Linting and Formatting

Run ESLint on the frontend:

```bash
npm run lint
```

Format code using Prettier:

```bash
npm run format
```

# Testing

![Test Types](/assets/test-types.gif)

## Test Data Seeding

![Test Data Seeding](/assets/test-data-seeding.gif)

## E2E Testing with Playwright

Runs the end-to-end tests.

```
npx playwright test
```

Starts the interactive UI mode.

```
npx playwright test --ui
```

Runs the tests only on Desktop Chrome.

```
npx playwright test --project=chromium
```

Runs the tests in a specific file.

```
npx playwright test example
```

Runs the tests in debug mode.

```
npx playwright test --debug
```

Auto generate tests with Codegen.

```
npx playwright codegen
```

## Contract Testing

Contract testing is used to validate the interactions between the frontend and microservices of Instaverse. This ensures that all components adhere to the agreed-upon API contracts, reducing integration issues.

![Contract Testing](/assets/contract-testing.gif)

### Frontend

The frontend uses `jest` for contract testing and includes scripts for running tests and publishing Pacts to a Pact Broker.

#### Scripts

- **Run Contract Tests**:

  ```bash
  cd frontend
  npm run test:contract
  ```

  Executes contract tests defined in `pact.test.js`.

- **Publish Pacts**:
  ```bash
  cd frontend
  npm run publish:pact
  ```
  Publishes the generated Pacts to the configured Pact Broker.

#### Prerequisites

- Set the following environment variables:
  - `PACT_BROKER_BASE_URL`: The base URL of your Pact Broker.
  - `PACT_BROKER_TOKEN`: Token for authentication with the Pact Broker.

### Microservices

Each microservice uses `jest` with experimental VM modules for contract testing. Scripts are provided for running tests with and without additional experimental settings.

#### Scripts

- **Run All Tests**:

  ```bash
  cd services/<service-name>
  npm test
  ```

  Executes all tests, including unit and integration tests.

- **Run Contract Tests with Experimental Flags**:
  ```bash
  cd services/<service-name>
  npm run test:contract
  ```
  Runs contract tests with additional experimental VM module settings.

### Benefits

- Ensures compatibility between frontend and microservices.
- Catches integration issues early.
- Maintains API stability across services.

## Unit Testing and Coverage

Unit tests are written using Jest to ensure code quality and correctness.\
To run unit tests, use the following command:

```bash
npm run test:unit
```

To generate a test coverage report, run:

```bash
npm run test:coverage
```

This will create a detailed coverage report in the `coverage` directory. Open `coverage/lcov-report/index.html` in your browser to view the report.

![Jest Unit Testing](/assets/test-coverage.gif)

## Pre-Commit Hooks Setup

This project is configured with a pre-commit hook to streamline the testing process in a monorepo environment. The hook automatically determines which tests to run based on the changes staged for commit, ensuring efficiency and code quality.

### How It Works

- **Frontend changes**: Runs frontend unit tests using Jest.
- **Other changes**: Skips tests if no frontend changes are detected.

### Configuration

1. **Pre-commit Hook**
   The pre-commit hook is defined using [Husky](https://typicode.github.io/husky/). The hook is configured to execute a custom script, `scripts/precommit.js`, which dynamically determines the scope of the tests to run based on the files that have been staged.

   To ensure the hook is installed and works correctly:

   ```bash
   npx husky install
   ```

2. **Scripts**
   Relevant scripts are defined in `package.json` to run the tests:

   ```json
   "scripts": {
     "test:unit:frontend": "node --experimental-vm-modules node_modules/jest/.bin/jest --config frontend/jest.config.js"
   }
   ```

3. **Precommit.js Script**
   The `scripts/precommit.js` file dynamically determines which tests to run based on the staged files:

   ```javascript
   import { execSync } from "child_process";

   const stagedFiles = execSync("git diff --cached --name-only", {
     encoding: "utf-8",
   });

   const runFrontendTests = stagedFiles.includes("frontend/");

   try {
     if (runFrontendTests) {
       execSync("npm run test:unit:frontend", { stdio: "inherit" });
     } else {
       console.log("No relevant changes for tests. Skipping...");
     }
   } catch (error) {
     console.error("Tests failed:", error.message);
     process.exit(1);
   }
   ```

### Running the Hook

To test the pre-commit hook manually:

```bash
git add .
git commit -m "Test pre-commit hook"
```

### Notes

- Make sure `precommit.js` is executable and defined in `package.json`.
- Extend or customize the script to include additional test types or workflows as needed.

By automating test execution with pre-commit hooks, you can enforce quality standards and improve developer productivity across the monorepo.

## Monitoring and Observability with Sentry

We use [Sentry](https://sentry.io/) for real-time error tracking and monitoring across both the frontend (React) and microservices (Express) of our application. Sentry helps us capture, report, and track errors, providing insights into issues as they occur in a production environment.

### React Frontend

The React frontend is configured to send error events to Sentry whenever JavaScript errors, unhandled promise rejections, or other critical issues occur. Sentry automatically captures unhandled exceptions and provides detailed error reports, including stack traces and context for debugging.

#### Setup

1. **Install Sentry SDK**:
   In the frontend directory, install the Sentry SDK:

   ```bash
   npm install @sentry/react
   ```

2. **Initialize Sentry**:
   In your `index.js` or `app.js` (or equivalent entry point), initialize Sentry:

   ```javascript
   import * as Sentry from "@sentry/react";
   Sentry.init({ dsn: "YOUR_SENTRY_DSN" });
   ```

3. **Error Reporting**:
   Sentry will automatically capture errors in React components. You can also manually capture errors or messages:
   ```javascript
   Sentry.captureException(new Error("Custom Error"));
   ```

### Express Microservices

Each Express microservice is configured to send uncaught errors and performance metrics to Sentry for monitoring. This allows you to capture errors at the service level and get insights into the performance of your microservices APIs.

#### Setup

1. **Install Sentry SDK**:
   In each microservice directory, install the Sentry SDK:

   ```bash
   cd services/<service-name>
   npm install @sentry/node
   ```

2. **Initialize Sentry**:
   In your main `server.js` (or equivalent entry point) of each service, initialize Sentry:

   ```javascript
   const Sentry = require("@sentry/node");
   Sentry.init({ dsn: "YOUR_SENTRY_DSN" });
   ```

3. **Capture Errors**:
   Sentry automatically captures uncaught exceptions, unhandled promise rejections, and any errors thrown in routes. You can manually capture errors:

   ```javascript
   app.get("/some-endpoint", (req, res) => {
     throw new Error("Custom Error");
   });
   ```

4. **Error Handling Middleware**:
   Ensure that Sentry's error handling middleware is placed after all route handlers:
   ```javascript
   app.use(Sentry.Handlers.errorHandler());
   ```

### Monitoring Features

- **Error Alerts**: Sentry notifies you in real-time about new errors in both the frontend and microservices.
- **Performance Monitoring**: Sentry tracks API response times and helps identify performance bottlenecks across services.
- **Contextual Data**: Every error is enriched with additional context such as browser information, HTTP request data, stack traces, and user context, which makes debugging easier.
- **Service Isolation**: Track errors per microservice to quickly identify which service is having issues.

### Accessing the Sentry Dashboard

1. Go to the [Sentry Dashboard](https://sentry.io/) and log in to your account.
2. You'll be able to view all captured issues, trace performance, and monitor error trends over time.
3. Set up separate projects for each microservice for better organization.

### Local Development

- Ensure you are using the production build for both the frontend and microservices to mimic the production environment locally.
- If running locally in development mode, Sentry may behave differently; refer to the [Sentry documentation](https://docs.sentry.io/platforms/javascript/) for further setup options.

### More Information

For more details on configuring and customizing Sentry, refer to the official [Sentry documentation](https://docs.sentry.io/).

![Monitoring](/assets/sentry.io.gif)

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m 'Add feature'`).
4. Push the branch (`git push origin feature-name`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License.

---

**Happy Coding! 🚀**
