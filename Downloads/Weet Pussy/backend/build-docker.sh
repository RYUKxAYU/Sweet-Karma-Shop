#!/bin/bash

# Sweet Shop Backend Docker Build Script

set -e

# Configuration
IMAGE_NAME="sweet-shop-backend"
TAG=${1:-latest}
DOCKERFILE=${2:-Dockerfile}

echo "🍬 Building Sweet Shop Backend Docker Image"
echo "================================================"
echo "Image: $IMAGE_NAME:$TAG"
echo "Dockerfile: $DOCKERFILE"
echo ""

# Build the image
echo "🔨 Building Docker image..."
docker build -f $DOCKERFILE -t $IMAGE_NAME:$TAG .

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📋 Image Details:"
docker images $IMAGE_NAME:$TAG

echo ""
echo "🚀 To run the container:"
echo "docker run -p 8000:8000 $IMAGE_NAME:$TAG"
echo ""
echo "🐳 To run with docker-compose:"
echo "docker-compose up -d"
echo ""
echo "🔍 To check container health:"
echo "docker ps"
echo "curl http://localhost:8000/health"