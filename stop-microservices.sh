#!/bin/bash

# Instaverse Microservices Stop Script

echo "🛑 Stopping Instaverse Microservices..."
echo ""

docker-compose -f docker-compose.microservices.yml down

echo ""
echo "✅ All microservices stopped successfully!"
echo ""
echo "💡 To remove volumes (databases), run:"
echo "   docker-compose -f docker-compose.microservices.yml down -v"
echo ""

