#!/bin/bash

# Sweet Shop Backend Docker Run Script

set -e

# Configuration
IMAGE_NAME="sweet-shop-backend"
TAG=${1:-latest}
CONTAINER_NAME="sweet-shop-api"

echo "🍬 Running Sweet Shop Backend Container"
echo "======================================="
echo "Image: $IMAGE_NAME:$TAG"
echo "Container: $CONTAINER_NAME"
echo ""

# Stop and remove existing container if it exists
if docker ps -a --format 'table {{.Names}}' | grep -q $CONTAINER_NAME; then
    echo "🛑 Stopping existing container..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
fi

# Run the container
echo "🚀 Starting new container..."
docker run -d \
    --name $CONTAINER_NAME \
    -p 8000:8000 \
    -e ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:3000,https://sweet-karma-shop-8xmg.vercel.app" \
    -e JWT_SECRET_KEY="docker-secret-key-change-in-production" \
    -e DEBUG="false" \
    -e ENVIRONMENT="production" \
    -v $(pwd)/data:/app/data \
    -v $(pwd)/uploads:/app/uploads \
    -v $(pwd)/logs:/app/logs \
    --restart unless-stopped \
    $IMAGE_NAME:$TAG

echo ""
echo "✅ Container started successfully!"
echo ""
echo "📋 Container Status:"
docker ps --filter name=$CONTAINER_NAME

echo ""
echo "🔍 Health Check:"
sleep 5
curl -f http://localhost:8000/health || echo "❌ Health check failed"

echo ""
echo "📊 Container Logs:"
docker logs $CONTAINER_NAME --tail 10

echo ""
echo "🌐 API Endpoints:"
echo "  - Health: http://localhost:8000/health"
echo "  - API Root: http://localhost:8000/api"
echo "  - Docs: http://localhost:8000/docs"
echo "  - Sweets: http://localhost:8000/api/sweets"