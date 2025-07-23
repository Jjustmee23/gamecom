# GameCom VPS Deployment Guide
## Ubuntu 24.04 Minimal - com.midaweb.be

### 🚀 Complete Setup voor VPS: 45.154.238.116

---

## 📋 Pre-Installatie Checklist

### 1. Basis Systeem Updates
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 2. Installatie van Docker & Docker Compose
```bash
# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker compose version
```

### 3. Installatie van Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### 4. Installatie van Certbot (SSL)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

### 5. Installatie van Node.js (voor development)
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

---

## 🌐 Domain & SSL Setup

### 1. DNS Configuration
Configureer je DNS records:
```
Type: A
Name: com.midaweb.be
Value: 45.154.238.116
TTL: 300
```

### 2. Nginx Configuration
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/com.midaweb.be
```

Voeg deze configuratie toe:
```nginx
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
```

### 3. Enable Site & Get SSL Certificate
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/com.midaweb.be /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d com.midaweb.be --email info@midaweb.be --agree-tos --non-interactive

# Test SSL renewal
sudo certbot renew --dry-run
```

---

## 📦 Application Deployment

### 1. Clone Repository
```bash
# Create application directory
sudo mkdir -p /opt/gamecom
sudo chown $USER:$USER /opt/gamecom
cd /opt/gamecom

# Clone repository (replace with your actual repo URL)
git clone https://github.com/yourusername/gamecom.git .
```

### 2. Environment Configuration
```bash
# Create environment file
cp env.example .env
nano .env
```

Configureer de environment variabelen:
```env
# Database
DATABASE_URL=postgresql://gamecom:your_secure_password@localhost:5432/gamecom

# Steam API
STEAM_API_KEY=your_steam_api_key

# JWT Secret
JWT_SECRET=your_very_secure_jwt_secret_key_here

# Domain
DOMAIN=https://com.midaweb.be

# Redis
REDIS_URL=redis://localhost:6379
```

### 3. Database Setup
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE gamecom;"
sudo -u postgres psql -c "CREATE USER gamecom WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gamecom TO gamecom;"
sudo -u postgres psql -c "ALTER USER gamecom CREATEDB;"
```

### 4. Build & Deploy Application
```bash
# Build and start containers
docker compose up --build -d

# Check container status
docker compose ps

# View logs
docker compose logs -f
```

### 5. Database Migration
```bash
# Run database migrations
docker compose exec backend npm run db:setup

# Or manually run schema
docker compose exec backend node -e "
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
client.connect().then(() => {
  console.log('Connected to database');
  // Run your schema setup here
});
"
```

---

## 🔧 Post-Installatie Setup

### 1. Security Hardening
```bash
# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Install fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Monitoring Setup
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Create log rotation
sudo nano /etc/logrotate.d/gamecom
```

Log rotation configuratie:
```
/opt/gamecom/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

### 3. Backup Script
```bash
# Create backup script
nano /opt/gamecom/backup.sh
```

Backup script inhoud:
```bash
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
```

```bash
# Make backup script executable
chmod +x /opt/gamecom/backup.sh

# Add to crontab (daily backup at 2 AM)
crontab -e
# Add: 0 2 * * * /opt/gamecom/backup.sh
```

---

## 🚀 Application Management

### 1. Start/Stop Application
```bash
# Start application
cd /opt/gamecom
docker compose up -d

# Stop application
docker compose down

# Restart application
docker compose restart

# View logs
docker compose logs -f
```

### 2. Update Application
```bash
# Pull latest changes
cd /opt/gamecom
git pull

# Rebuild and restart
docker compose down
docker compose up --build -d

# Run migrations if needed
docker compose exec backend npm run db:migrate
```

### 3. Monitor Application
```bash
# Check container status
docker compose ps

# Check resource usage
docker stats

# Check logs
docker compose logs -f backend
docker compose logs -f frontend
```

---

## 🔍 Troubleshooting

### 1. Common Issues
```bash
# Check if ports are in use
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Check Docker logs
docker compose logs

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check SSL certificate
sudo certbot certificates
```

### 2. Database Issues
```bash
# Connect to database
docker compose exec backend psql $DATABASE_URL

# Check database status
docker compose exec backend npm run db:status
```

### 3. SSL Issues
```bash
# Renew SSL certificate
sudo certbot renew

# Check SSL configuration
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 Performance Optimization

### 1. Nginx Optimization
```bash
# Edit Nginx configuration
sudo nano /etc/nginx/nginx.conf
```

Voeg deze optimalisaties toe:
```nginx
# In http block
client_max_body_size 100M;
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. Docker Optimization
```bash
# Create Docker daemon configuration
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
# Restart Docker
sudo systemctl restart docker
```

---

## ✅ Verification Checklist

- [ ] Domain resolves to VPS IP
- [ ] SSL certificate is valid
- [ ] Application is accessible via HTTPS
- [ ] Database is connected
- [ ] Steam API integration works
- [ ] File uploads work
- [ ] Email notifications work
- [ ] Backups are running
- [ ] Monitoring is active
- [ ] Security measures are in place

---

## 🆘 Support Commands

```bash
# Quick status check
echo "=== System Status ==="
docker compose ps
sudo systemctl status nginx
sudo systemctl status postgresql
sudo certbot certificates

# Quick restart
cd /opt/gamecom && docker compose restart

# View all logs
docker compose logs -f --tail=100
```

**🎯 Je GameCom applicatie is nu klaar op: https://com.midaweb.be** 