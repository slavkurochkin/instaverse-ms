#!/bin/bash

# Instaverse Microservices Startup Script
# This script starts all microservices using Docker Compose

echo "🚀 Starting Instaverse Microservices..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Stop any existing containers
echo "📦 Stopping any existing containers..."
docker-compose -f docker-compose.microservices.yml down

# Build and start services
echo ""
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.microservices.yml up --build -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🏥 Checking service health..."
echo ""

services=("api-gateway:8000" "auth-service:5001" "story-service:5002" "social-service:5003" "notification-service:5004")

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
        echo "✅ $name is healthy (http://localhost:$port)"
    else
        echo "⚠️  $name might still be starting... (http://localhost:$port)"
    fi
done

echo ""
echo "📊 Service Status:"
echo ""
docker-compose -f docker-compose.microservices.yml ps

echo ""
echo "✨ Microservices Started Successfully!"
echo ""
echo "🌐 Access Points:"
echo "   - API Gateway: http://localhost:8000"
echo "   - Auth Service: http://localhost:5001"
echo "   - Story Service: http://localhost:5002"
echo "   - Social Service: http://localhost:5003"
echo "   - Notification Service: http://localhost:5004"
echo "   - WebSocket: ws://localhost:8080"
echo "   - RabbitMQ Management: http://localhost:15672 (admin/password)"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "📝 To view logs: docker-compose -f docker-compose.microservices.yml logs -f [service-name]"
echo "🛑 To stop: docker-compose -f docker-compose.microservices.yml down"
echo ""

