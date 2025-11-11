#!/bin/bash

echo "🔍 Checking Microservices Status..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check services
echo "📊 Service Status:"
docker-compose -f docker-compose.microservices.yml ps

echo ""
echo "🧪 Testing API Gateway..."
HEALTH=$(curl -s http://localhost:8000/health 2>&1)
if echo "$HEALTH" | grep -q "healthy"; then
    echo "✅ API Gateway is healthy"
else
    echo "❌ API Gateway is not responding"
fi

echo ""
echo "🌐 Testing Frontend..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1)
if [ "$FRONTEND" = "200" ]; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo ""
echo "📚 Testing Stories API..."
STORIES=$(curl -s http://localhost:8000/api/stories 2>&1)
if echo "$STORIES" | grep -q "stories"; then
    echo "✅ Stories API is working"
else
    echo "❌ Stories API is not responding"
fi

echo ""
echo "🎉 All systems checked!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend:  http://localhost:3000"
echo "   API Gateway: http://localhost:8000"
echo "   RabbitMQ:  http://localhost:15672 (admin/password)"
echo ""
echo "📖 For more info, see: MICROSERVICES_RUNNING.md"
