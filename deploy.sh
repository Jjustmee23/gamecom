#!/bin/bash

# GameCom VPS Deployment Script
# Ubuntu 24.04 Minimal - com.midaweb.be
# VPS IP: 45.154.238.116

set -e  # Exit on any error

echo "🚀 GameCom VPS Deployment Script"
echo "=================================="
echo "VPS: 45.154.238.116"
echo "Domain: com.midaweb.be"
echo "Email: info@midaweb.be"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Check if sudo is available
if ! command -v sudo &> /dev/null; then
    print_error "sudo is not installed. Please install it first."
    exit 1
fi

print_status "Starting GameCom VPS deployment..."

# Step 1: System Updates
print_status "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated successfully"

# Step 2: Install Essential Packages
print_status "Step 2: Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
print_success "Essential packages installed"

# Step 3: Install Docker
print_status "Step 3: Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

print_success "Docker installed successfully"

# Step 4: Install Nginx
print_status "Step 4: Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
print_success "Nginx installed successfully"

# Step 5: Install Certbot
print_status "Step 5: Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx
print_success "Certbot installed successfully"

# Step 6: Install Node.js
print_status "Step 6: Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
print_success "Node.js installed successfully"

# Step 7: Install PostgreSQL
print_status "Step 7: Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
print_success "PostgreSQL installed successfully"

# Step 8: Configure Firewall
print_status "Step 8: Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
print_success "Firewall configured"

# Step 9: Create Application Directory
print_status "Step 9: Creating application directory..."
sudo mkdir -p /opt/gamecom
sudo chown $USER:$USER /opt/gamecom
cd /opt/gamecom
print_success "Application directory created"

# Step 10: Clone Repository (if git URL is provided)
if [ ! -z "$1" ]; then
    print_status "Step 10: Cloning repository..."
    git clone $1 .
    print_success "Repository cloned"
else
    print_warning "No repository URL provided. Please clone your repository manually to /opt/gamecom"
fi

# Step 11: Create Environment File
print_status "Step 11: Creating environment configuration..."
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://gamecom:gamecom_secure_password_2024@localhost:5432/gamecom

# Steam API Configuration
STEAM_API_KEY=your_steam_api_key_here

# JWT Configuration
JWT_SECRET=gamecom_jwt_secret_key_$(openssl rand -hex 32)

# Domain Configuration
DOMAIN=https://com.midaweb.be

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Email Configuration
EMAIL_FROM=info@midaweb.be
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@midaweb.be
EMAIL_PASS=your_email_password_here
EOF

print_success "Environment file created"
print_warning "Please edit .env file with your actual API keys and passwords"

# Step 12: Setup Database
print_status "Step 12: Setting up database..."
sudo -u postgres psql -c "CREATE DATABASE gamecom;" || print_warning "Database might already exist"
sudo -u postgres psql -c "CREATE USER gamecom WITH PASSWORD 'gamecom_secure_password_2024';" || print_warning "User might already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gamecom TO gamecom;"
sudo -u postgres psql -c "ALTER USER gamecom CREATEDB;"
print_success "Database setup completed"

# Step 13: Create Nginx Configuration
print_status "Step 13: Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/com.midaweb.be > /dev/null << 'EOF'
server {
    listen 80;
    server_name com.midaweb.be;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name com.midaweb.be;
    
    # SSL configuration will be added by Certbot
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/com.midaweb.be /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
print_success "Nginx configuration created"

# Step 14: Install Security Tools
print_status "Step 14: Installing security tools..."
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
print_success "Security tools installed"

# Step 15: Create Backup Script
print_status "Step 15: Creating backup script..."
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/gamecom"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker compose exec -T backend pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /opt/gamecom

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh
print_success "Backup script created"

# Step 16: Create Management Scripts
print_status "Step 16: Creating management scripts..."

# Start script
cat > start.sh << 'EOF'
#!/bin/bash
cd /opt/gamecom
docker compose up -d
echo "GameCom started successfully"
EOF

# Stop script
cat > stop.sh << 'EOF'
#!/bin/bash
cd /opt/gamecom
docker compose down
echo "GameCom stopped successfully"
EOF

# Restart script
cat > restart.sh << 'EOF'
#!/bin/bash
cd /opt/gamecom
docker compose restart
echo "GameCom restarted successfully"
EOF

# Status script
cat > status.sh << 'EOF'
#!/bin/bash
echo "=== GameCom Status ==="
cd /opt/gamecom
docker compose ps
echo ""
echo "=== System Status ==="
sudo systemctl status nginx --no-pager -l
sudo systemctl status postgresql --no-pager -l
sudo certbot certificates
EOF

chmod +x start.sh stop.sh restart.sh status.sh
print_success "Management scripts created"

# Step 17: Final Instructions
echo ""
echo "🎉 Deployment completed successfully!"
echo "====================================="
echo ""
echo "📋 Next Steps:"
echo "1. Edit the .env file with your actual API keys:"
echo "   nano /opt/gamecom/.env"
echo ""
echo "2. Get SSL certificate:"
echo "   sudo certbot --nginx -d com.midaweb.be --email info@midaweb.be --agree-tos --non-interactive"
echo ""
echo "3. Build and start the application:"
echo "   cd /opt/gamecom"
echo "   docker compose up --build -d"
echo ""
echo "4. Check application status:"
echo "   ./status.sh"
echo ""
echo "🔧 Management Commands:"
echo "   ./start.sh    - Start application"
echo "   ./stop.sh     - Stop application"
echo "   ./restart.sh  - Restart application"
echo "   ./status.sh   - Check status"
echo "   ./backup.sh   - Create backup"
echo ""
echo "🌐 Your application will be available at:"
echo "   https://com.midaweb.be"
echo ""
echo "⚠️  Important:"
echo "   - Change default passwords in .env file"
echo "   - Set up your Steam API key"
echo "   - Configure email settings"
echo "   - Test the application thoroughly"
echo ""
print_success "Deployment script completed!" 