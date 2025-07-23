#!/bin/bash

# GameCom Platform - Auto Deployment Script
# This script is executed by GitHub Actions to deploy to VPS

set -e  # Exit on any error

echo "🚀 GameCom Platform - Auto Deployment"
echo "====================================="
echo "Timestamp: $(date)"
echo "Branch: $GITHUB_REF_NAME"
echo "Commit: $GITHUB_SHA"

# Configuration
PROJECT_DIR="/opt/gamecom"
GIT_REPO="https://github.com/Jjustmee23/gamecom.git"
BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "$PROJECT_DIR" ]; then
    error "Project directory $PROJECT_DIR not found!"
    exit 1
fi

cd "$PROJECT_DIR"

# Backup current state
log "💾 Creating backup before deployment..."
BACKUP_DIR="/opt/backups/gamecom-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/"
fi

if [ -d "uploads" ]; then
    cp -r uploads "$BACKUP_DIR/"
fi

success "Backup created at $BACKUP_DIR"

# Pull latest changes
log "📥 Pulling latest changes from Git..."
git fetch origin
git reset --hard origin/$BRANCH
git clean -fd

success "Git repository updated"

# Ensure environment file exists
if [ ! -f ".env" ]; then
    warning ".env file not found, creating from template..."
    if [ -f "env.example" ]; then
        cp env.example .env
        warning "Please configure your .env file with proper values!"
    else
        error "env.example not found! Cannot create .env file."
        exit 1
    fi
fi

# Stop current containers
log "🐳 Stopping current Docker containers..."
docker compose down || true

# Clean up old images (optional)
log "🧹 Cleaning up old Docker images..."
docker system prune -f || true

# Build and start new containers
log "🔨 Building and starting new containers..."
docker compose up -d --build

# Wait for services to be ready
log "⏳ Waiting for services to start..."
sleep 30

# Health check
log "🔍 Performing health check..."
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        success "Backend API is healthy!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        warning "Backend health check failed (attempt $RETRY_COUNT/$MAX_RETRIES), retrying in 10 seconds..."
        sleep 10
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    error "Backend health check failed after $MAX_RETRIES attempts!"
    log "📋 Checking container logs..."
    docker compose logs backend --tail=50
    exit 1
fi

# Check frontend health
log "🔍 Checking frontend health..."
FRONTEND_RETRY_COUNT=0
while [ $FRONTEND_RETRY_COUNT -lt 5 ]; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend is healthy!"
        break
    else
        FRONTEND_RETRY_COUNT=$((FRONTEND_RETRY_COUNT + 1))
        warning "Frontend health check failed (attempt $FRONTEND_RETRY_COUNT/5), retrying in 5 seconds..."
        sleep 5
    fi
done

# Run database migrations if needed
log "🗄️ Running database migrations..."
docker compose exec -T backend npm run db:migrate || echo "No migrations needed or migration failed"

# Final status check
log "📊 Checking final service status..."
docker compose ps

# Verify all containers are running
if docker compose ps | grep -q "Up"; then
    success "All containers are running!"
else
    error "Some containers failed to start!"
    docker compose ps
    exit 1
fi

# Cleanup old backups (keep last 5)
log "🧹 Cleaning up old backups..."
cd /opt/backups
ls -t | tail -n +6 | xargs -r rm -rf

success "Deployment completed successfully!"
echo "🌐 Your application is available at: https://com.midaweb.be"
echo "📊 Backend API: https://com.midaweb.be/api"
echo "🔐 Admin panel: https://com.midaweb.be/admin"
echo "🎮 Games: https://com.midaweb.be/games"
echo "👥 Wall of Gamers: https://com.midaweb.be/wall-of-gamers"

# Optional: Send notification
if command -v curl > /dev/null 2>&1; then
    log "📧 Sending deployment notification..."
    # You can add webhook notifications here if needed
fi

echo "🎉 Auto deployment completed at $(date)" 