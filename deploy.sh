#!/bin/bash

# GameCom Docker Deployment Script
# Domain: com.midaweb.be
# IP: 45.154.238.116

set -e

echo "🚀 GameCom Docker Deployment"
echo "============================"
echo "Domain: com.midaweb.be"
echo "IP: 45.154.238.116"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

info_msg() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error_exit "Please run as root (use sudo)"
fi

# Step 1: Install Docker and Docker Compose
info_msg "Step 1: Installing Docker and Docker Compose..."

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    success_msg "Docker installed"
else
    success_msg "Docker already installed"
fi

# Step 2: Create directories
info_msg "Step 2: Creating directories..."
mkdir -p /opt/gamecom
mkdir -p /opt/gamecom/nginx/conf.d
mkdir -p /opt/gamecom/ssl
mkdir -p /opt/gamecom/certbot/conf
mkdir -p /opt/gamecom/certbot/www
success_msg "Directories created"

# Step 3: Clone repository
info_msg "Step 3: Cloning repository..."
cd /opt/gamecom
if [ -d ".git" ]; then
    git pull origin main
    success_msg "Repository updated"
else
    git clone https://github.com/Jjustmee23/gamecom.git .
    success_msg "Repository cloned"
fi

# Step 4: Create environment file
info_msg "Step 4: Creating environment file..."
if [ ! -f .env ]; then
    cat > .env << EOF
# GameCom Environment Variables
NODE_ENV=production
DOMAIN=com.midaweb.be
EMAIL=info@midaweb.be

# Database
POSTGRES_DB=gamecom
POSTGRES_USER=gamecom
POSTGRES_PASSWORD=gamecom_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Steam API (optional)
STEAM_API_KEY=

# Frontend
VITE_API_URL=https://com.midaweb.be/api
VITE_WS_URL=wss://com.midaweb.be
EOF
    success_msg "Environment file created"
else
    success_msg "Environment file already exists"
fi

# Step 5: Configure firewall
info_msg "Step 5: Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable || info_msg "Firewall configuration failed"
success_msg "Firewall configured"

# Step 6: Start services
info_msg "Step 6: Starting services..."
docker compose down || true
docker compose build --no-cache
docker compose up -d
success_msg "Services started"

# Step 7: Wait for services to start
info_msg "Step 7: Waiting for services to start..."
sleep 30

# Step 8: Test services
info_msg "Step 8: Testing services..."
echo "Testing backend..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    success_msg "Backend is accessible"
else
    error_exit "Backend is not accessible"
fi

echo "Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    success_msg "Frontend is accessible"
else
    error_exit "Frontend is not accessible"
fi

echo "Testing nginx..."
if curl -f http://com.midaweb.be > /dev/null 2>&1; then
    success_msg "Nginx proxy works"
else
    info_msg "Nginx proxy not working (DNS may not be configured yet)"
fi

# Step 9: SSL certificate
info_msg "Step 9: Installing SSL certificate..."
if certbot --nginx -d com.midaweb.be --non-interactive --agree-tos --email info@midaweb.be; then
    success_msg "SSL certificate installed"
else
    info_msg "SSL certificate installation failed (DNS may not be configured yet)"
fi

# Step 10: Create deployment script
info_msg "Step 10: Creating deployment script..."
cat > /usr/local/bin/deploy-gamecom << 'EOF'
#!/bin/bash

# GameCom Deployment Script
cd /opt/gamecom

echo "🚀 Deploying GameCom..."

# Backup current version
if [ -d "backup" ]; then
    rm -rf backup
fi
mkdir backup
cp -r . backup/

# Pull latest changes
git pull origin main || {
    echo "❌ Git pull failed, restoring backup..."
    cp -r backup/* .
    exit 1
}

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Wait for services
sleep 30

# Test services
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend health check successful"
else
    echo "❌ Backend health check failed"
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
    exit 1
fi

# Renew SSL certificate
certbot renew --quiet || echo "⚠️ SSL certificate renewal failed"

echo "🎉 Deployment successful!"
echo "🌐 Website: https://com.midaweb.be"
echo "📊 Health: https://com.midaweb.be/health"
EOF

chmod +x /usr/local/bin/deploy-gamecom
success_msg "Deployment script created"

# Step 11: Create cron job for automatic updates
info_msg "Step 11: Creating cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/deploy-gamecom >> /var/log/gamecom-deploy.log 2>&1") | crontab -
success_msg "Cron job created"

# Final status
echo ""
echo "🎉 GameCom Deployment Complete!"
echo "=============================="
echo "🌐 Website: https://com.midaweb.be"
echo "📧 Email: info@midaweb.be"
echo "🖥️ Server IP: 45.154.238.116"
echo "📁 App Directory: /opt/gamecom"
echo ""
echo "📋 DNS Records to add:"
echo "Type: A"
echo "Name: com"
echo "Value: 45.154.238.116"
echo "TTL: 300"
echo ""
echo "🔧 Useful commands:"
echo "- Status: docker compose ps"
echo "- Logs: docker compose logs -f"
echo "- Deploy: /usr/local/bin/deploy-gamecom"
echo "- Restart: docker compose restart"
echo "- SSL renew: certbot renew"
echo ""
echo "🚀 Wall of Gamers Features:"
echo "- View and search users"
echo "- Open profiles"
echo "- Send friendship requests"
echo "- Direct messaging"
echo "- Recent games and achievements"
echo ""
success_msg "Deployment completed successfully!" 