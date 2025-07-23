#!/bin/bash

# GameCom GitHub Actions Setup Script
# Configureert automatische deployment naar VPS

echo "🚀 GameCom GitHub Actions Setup"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed."
    echo "Please install it first: https://cli.github.com/"
    exit 1
fi

# Check if user is logged in
if ! gh auth status &> /dev/null; then
    print_error "You are not logged in to GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

print_status "Setting up GitHub Actions secrets for automatic deployment..."

# Get VPS details
echo ""
echo "📋 VPS Configuration"
echo "===================="

read -p "VPS IP Address (45.154.238.116): " VPS_HOST
VPS_HOST=${VPS_HOST:-45.154.238.116}

read -p "VPS Username: " VPS_USERNAME
if [ -z "$VPS_USERNAME" ]; then
    print_error "VPS username is required"
    exit 1
fi

read -p "VPS SSH Port (22): " VPS_PORT
VPS_PORT=${VPS_PORT:-22}

# Generate SSH key if it doesn't exist
SSH_KEY_PATH="$HOME/.ssh/gamecom_deploy"
if [ ! -f "$SSH_KEY_PATH" ]; then
    print_status "Generating SSH key for deployment..."
    ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" -C "gamecom-deploy@github-actions"
    print_success "SSH key generated at $SSH_KEY_PATH"
else
    print_status "Using existing SSH key at $SSH_KEY_PATH"
fi

# Display public key
echo ""
echo "🔑 SSH Public Key (add this to your VPS):"
echo "=========================================="
cat "${SSH_KEY_PATH}.pub"
echo ""

print_warning "IMPORTANT: Add the SSH public key above to your VPS authorized_keys"
echo "Run this command on your VPS:"
echo "echo '$(cat ${SSH_KEY_PATH}.pub)' >> ~/.ssh/authorized_keys"

# Wait for user confirmation
read -p "Press Enter after adding the SSH key to your VPS..."

# Test SSH connection
print_status "Testing SSH connection..."
if ssh -i "$SSH_KEY_PATH" -p "$VPS_PORT" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$VPS_USERNAME@$VPS_HOST" "echo 'SSH connection successful'"; then
    print_success "SSH connection test passed"
else
    print_error "SSH connection test failed"
    echo "Please check:"
    echo "1. SSH key is added to VPS authorized_keys"
    echo "2. VPS IP, username, and port are correct"
    echo "3. SSH service is running on VPS"
    exit 1
fi

# Set GitHub secrets
print_status "Setting GitHub repository secrets..."

# Get repository name
REPO_NAME=$(gh repo view --json name -q .name)
REPO_OWNER=$(gh repo view --json owner -q .owner.login)
FULL_REPO="$REPO_OWNER/$REPO_NAME"

echo "Repository: $FULL_REPO"

# Set secrets
print_status "Setting VPS_HOST secret..."
echo "$VPS_HOST" | gh secret set VPS_HOST --repo "$FULL_REPO"

print_status "Setting VPS_USERNAME secret..."
echo "$VPS_USERNAME" | gh secret set VPS_USERNAME --repo "$FULL_REPO"

print_status "Setting VPS_PORT secret..."
echo "$VPS_PORT" | gh secret set VPS_PORT --repo "$FULL_REPO"

print_status "Setting VPS_SSH_KEY secret..."
gh secret set VPS_SSH_KEY --repo "$FULL_REPO" < "$SSH_KEY_PATH"

print_success "All secrets configured successfully!"

# Create deployment script on VPS
print_status "Setting up deployment script on VPS..."
ssh -i "$SSH_KEY_PATH" -p "$VPS_PORT" "$VPS_USERNAME@$VPS_HOST" << 'EOF'
# Create deployment directory if it doesn't exist
mkdir -p /opt/gamecom

# Create deployment script
cat > /opt/gamecom/deploy-from-github.sh << 'SCRIPT_EOF'
#!/bin/bash

# GameCom GitHub Actions Deployment Script
set -e

echo "🚀 Starting deployment from GitHub..."

# Navigate to application directory
cd /opt/gamecom

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Stop current containers
echo "🛑 Stopping current containers..."
docker compose down

# Remove old images to free space
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start new containers
echo "🔨 Building and starting containers..."
docker compose up --build -d

# Wait for containers to be healthy
echo "⏳ Waiting for containers to start..."
sleep 30

# Check if containers are running
echo "📊 Container status:"
docker compose ps

# Run database migrations if needed
echo "🗄️ Running database migrations..."
docker compose exec -T backend npm run db:migrate || echo "No migrations needed"

# Clear any old logs
docker system prune -f

echo "✅ Deployment completed successfully!"
echo "🌐 Application available at: https://com.midaweb.be"
SCRIPT_EOF

# Make script executable
chmod +x /opt/gamecom/deploy-from-github.sh

echo "✅ Deployment script created on VPS"
EOF

# Create GitHub Actions workflow directory
print_status "Creating GitHub Actions workflow..."
mkdir -p .github/workflows

# Create the workflow file
cat > .github/workflows/deploy.yml << 'WORKFLOW_EOF'
name: Deploy to VPS

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: |
        cd backend
        npm ci
        cd ../frontend
        npm ci
        
    - name: Build frontend
      run: |
        cd frontend
        npm run build
        
    - name: Build backend
      run: |
        cd backend
        npm run build
        
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        port: ${{ secrets.VPS_PORT }}
        script: |
          # Navigate to application directory
          cd /opt/gamecom
          
          # Pull latest changes
          git pull origin main
          
          # Stop current containers
          docker compose down
          
          # Remove old images to free space
          docker system prune -f
          
          # Build and start new containers
          docker compose up --build -d
          
          # Wait for containers to be healthy
          sleep 30
          
          # Check if containers are running
          docker compose ps
          
          # Run database migrations if needed
          docker compose exec -T backend npm run db:migrate || echo "No migrations needed"
          
          # Clear any old logs
          docker system prune -f
          
          echo "Deployment completed successfully!"
          
    - name: Health check
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        port: ${{ secrets.VPS_PORT }}
        script: |
          cd /opt/gamecom
          
          # Check container status
          echo "=== Container Status ==="
          docker compose ps
          
          # Check if services are responding
          echo "=== Health Check ==="
          
          # Check backend health
          if curl -f http://localhost:3001/health; then
            echo "✅ Backend is healthy"
          else
            echo "❌ Backend health check failed"
            exit 1
          fi
          
          # Check frontend (basic connectivity)
          if curl -f http://localhost:3000; then
            echo "✅ Frontend is responding"
          else
            echo "❌ Frontend health check failed"
            exit 1
          fi
          
          echo "🎉 All services are healthy!"
          
    - name: Notify deployment status
      if: always()
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        port: ${{ secrets.VPS_PORT }}
        script: |
          # Send notification (optional - you can add Discord webhook or email here)
          echo "Deployment completed at $(date)" >> /opt/gamecom/deployment.log
          
          # Keep only last 10 deployment logs
          tail -n 10 /opt/gamecom/deployment.log > /tmp/deployment.log
          mv /tmp/deployment.log /opt/gamecom/deployment.log
WORKFLOW_EOF

print_success "GitHub Actions workflow created!"

# Final instructions
echo ""
echo "🎉 GitHub Actions setup completed!"
echo "=================================="
echo ""
echo "📋 What was configured:"
echo "✅ SSH key generated and added to VPS"
echo "✅ GitHub repository secrets set"
echo "✅ Deployment script created on VPS"
echo "✅ GitHub Actions workflow created"
echo ""
echo "🚀 Next steps:"
echo "1. Commit and push the workflow file:"
echo "   git add .github/workflows/deploy.yml"
echo "   git commit -m 'Add GitHub Actions deployment workflow'"
echo "   git push origin main"
echo ""
echo "2. Test the deployment:"
echo "   - Go to your GitHub repository"
echo "   - Click on 'Actions' tab"
echo "   - You should see the deployment workflow running"
echo ""
echo "3. Monitor deployments:"
echo "   - Check VPS logs: ssh $VPS_USERNAME@$VPS_HOST 'tail -f /opt/gamecom/deployment.log'"
echo "   - Check container status: ssh $VPS_USERNAME@$VPS_HOST 'cd /opt/gamecom && docker compose ps'"
echo ""
echo "🔧 Manual deployment (if needed):"
echo "   ssh $VPS_USERNAME@$VPS_HOST 'cd /opt/gamecom && ./deploy-from-github.sh'"
echo ""
print_success "Setup completed! Your VPS will now automatically update on every git push!" 