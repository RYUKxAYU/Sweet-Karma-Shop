# 🐳 Sweet Shop Backend - Docker Guide

This guide helps you containerize and deploy the Sweet Shop Backend using Docker.

## 📋 Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

## 🚀 Quick Start

### Option 1: Using Build Script (Recommended)
```bash
# Build the Docker image
./build-docker.sh

# Run the container
./run-docker.sh
```

### Option 2: Manual Docker Commands
```bash
# Build the image
docker build -t sweet-shop-backend .

# Run the container
docker run -p 8000:8000 sweet-shop-backend
```

### Option 3: Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Configuration

### Environment Variables

The container accepts these environment variables:

```bash
# Application Settings
APP_NAME=Sweet Shop API
DEBUG=false
ENVIRONMENT=production

# Database
DATABASE_URL=sqlite+aiosqlite:///./sweetshop.db

# JWT Security
JWT_SECRET_KEY=your-super-secure-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Settings
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.com

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
UPLOAD_DIR=uploads

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/sweetshop.log
```

### Volume Mounts

The container uses these volumes for persistence:

```bash
- ./data:/app/data          # Database files
- ./uploads:/app/uploads    # Uploaded images
- ./logs:/app/logs          # Application logs
```

## 🏗️ Build Options

### Development Build
```bash
docker build -t sweet-shop-backend:dev .
```

### Production Build (Multi-stage)
```bash
docker build -f Dockerfile.prod -t sweet-shop-backend:prod .
```

### Build with Custom Tag
```bash
./build-docker.sh v1.0.0 Dockerfile.prod
```

## 🚀 Deployment Options

### 1. Local Development
```bash
docker run -p 8000:8000 \
  -e DEBUG=true \
  -e ALLOWED_ORIGINS="http://localhost:5173" \
  sweet-shop-backend
```

### 2. Production Deployment
```bash
docker run -d \
  --name sweet-shop-api \
  -p 8000:8000 \
  -e DEBUG=false \
  -e ENVIRONMENT=production \
  -e JWT_SECRET_KEY="your-production-secret" \
  -e ALLOWED_ORIGINS="https://your-domain.com" \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/logs:/app/logs \
  --restart unless-stopped \
  sweet-shop-backend:prod
```

### 3. With PostgreSQL Database
```bash
# Start PostgreSQL
docker run -d \
  --name sweet-shop-db \
  -e POSTGRES_DB=sweetshop \
  -e POSTGRES_USER=sweetshop \
  -e POSTGRES_PASSWORD=secure-password \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Start API with PostgreSQL
docker run -d \
  --name sweet-shop-api \
  --link sweet-shop-db:db \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql+asyncpg://sweetshop:secure-password@db:5432/sweetshop" \
  sweet-shop-backend:prod
```

## 🔍 Monitoring & Debugging

### Check Container Status
```bash
docker ps
docker logs sweet-shop-api
```

### Health Check
```bash
curl http://localhost:8000/health
```

### Access Container Shell
```bash
docker exec -it sweet-shop-api bash
```

### View Application Logs
```bash
docker logs -f sweet-shop-api
```

## 📊 Container Specifications

- **Base Image**: python:3.11-slim
- **Port**: 8000
- **User**: appuser (non-root)
- **Health Check**: /health endpoint
- **Restart Policy**: unless-stopped

## 🔒 Security Features

- ✅ Non-root user execution
- ✅ Minimal base image (slim)
- ✅ Multi-stage build for production
- ✅ Health checks enabled
- ✅ Environment variable configuration
- ✅ Volume mounts for data persistence

## 🐳 Docker Hub Deployment

### Build and Tag for Registry
```bash
# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 \
  -t your-registry/sweet-shop-backend:latest \
  --push .
```

### Push to Registry
```bash
docker tag sweet-shop-backend your-registry/sweet-shop-backend:latest
docker push your-registry/sweet-shop-backend:latest
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Use different port
   docker run -p 8001:8000 sweet-shop-backend
   ```

2. **Permission denied for uploads**
   ```bash
   # Fix permissions
   sudo chown -R 1000:1000 ./uploads
   ```

3. **Database connection issues**
   ```bash
   # Check database URL
   docker logs sweet-shop-api | grep DATABASE
   ```

4. **CORS errors**
   ```bash
   # Update ALLOWED_ORIGINS
   docker run -e ALLOWED_ORIGINS="*" sweet-shop-backend
   ```

### Debug Mode
```bash
docker run -p 8000:8000 \
  -e DEBUG=true \
  -e LOG_LEVEL=DEBUG \
  sweet-shop-backend
```

## 📈 Performance Tuning

### Production Optimizations
```bash
# Use multiple workers
docker run -p 8000:8000 \
  sweet-shop-backend:prod \
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Resource Limits
```bash
docker run --memory=512m --cpus=1.0 \
  -p 8000:8000 sweet-shop-backend
```

## 🎯 Next Steps

1. **Deploy to cloud** (AWS ECS, Google Cloud Run, etc.)
2. **Set up CI/CD** pipeline for automated builds
3. **Configure monitoring** (Prometheus, Grafana)
4. **Set up load balancing** for high availability
5. **Implement backup** strategies for data persistence

---

**Need help?** Check the container logs and health endpoint first!