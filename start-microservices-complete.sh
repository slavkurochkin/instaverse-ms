#!/bin/bash

# Complete Microservices Startup Script with Frontend Fix
echo "🚀 Starting Instaverse Microservices (Complete Setup)..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "📦 Stopping any existing containers..."
docker-compose -f docker-compose.microservices.yml down

# Build and start services (this will rebuild frontend with correct config)
echo ""
echo "🔨 Building and starting all services..."
echo "   (This may take a few minutes on first run)"
docker-compose -f docker-compose.microservices.yml up --build -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

# Check service health
echo ""
echo "🏥 Checking service health..."
echo ""

check_service() {
    local name=$1
    local port=$2
    local max_retries=5
    local retry=0
    
    while [ $retry -lt $max_retries ]; do
        if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
            echo "✅ $name is healthy (http://localhost:$port)"
            return 0
        fi
        retry=$((retry + 1))
        if [ $retry -lt $max_retries ]; then
            sleep 2
        fi
    done
    echo "⚠️  $name is still starting... (http://localhost:$port)"
    return 1
}

check_service "API Gateway" 8000
check_service "Auth Service" 5001
check_service "Story Service" 5002
check_service "Social Service" 5003
check_service "Notification Service" 5004

if curl -s "http://localhost:16686" > /dev/null 2>&1; then
    echo "✅ Jaeger UI is running (http://localhost:16686)"
else
    echo "⚠️  Jaeger UI is still starting... (http://localhost:16686)"
fi

# Check frontend
if curl -s "http://localhost:3000" > /dev/null 2>&1; then
    echo "✅ Frontend is running (http://localhost:3000)"
else
    echo "⚠️  Frontend is still starting... (http://localhost:3000)"
fi

echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.microservices.yml ps

echo ""
echo "✨ Microservices Started!"
echo ""
echo "🌐 Access Points:"
echo "   ┌─────────────────────────────────────────────────────"
echo "   │ 🎨 Frontend:     http://localhost:3000"
echo "   │ 🚪 API Gateway:  http://localhost:8000"
echo "   │ 🔭 Jaeger UI:    http://localhost:16686"
echo "   │ 🐰 RabbitMQ:     http://localhost:15672 (admin/password)"
echo "   └─────────────────────────────────────────────────────"
echo ""
echo "🧪 Quick Test:"
echo "   1. Open http://localhost:3000"
echo "   2. Try to login with:"
echo "      Email: admin@instaverse.com"
echo "      Password: admin123"
echo ""
echo "📝 Useful Commands:"
echo "   View logs:    docker-compose -f docker-compose.microservices.yml logs -f"
echo "   Stop all:     docker-compose -f docker-compose.microservices.yml down"
echo "   Restart one:  docker-compose -f docker-compose.microservices.yml restart [service]"
echo ""
echo "🔍 Troubleshooting:"
echo "   - Frontend blank? Check: docker-compose -f docker-compose.microservices.yml logs frontend"
echo "   - API errors? Check browser console (F12)"
echo "   - Check all logs: docker-compose -f docker-compose.microservices.yml logs"
echo ""

