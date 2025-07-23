#!/bin/bash

# GameCom Auto Deployment Script
# Voor Ubuntu/Debian servers
# Email: info@midaweb.be

set -e  # Stop bij errors

# Kleuren voor output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log functie
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Configuratie
DOMAIN="gamecom.midaweb.be"
EMAIL="info@midaweb.be"
APP_NAME="gamecom"
APP_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/backups/$APP_NAME"
SSL_DIR="/etc/letsencrypt/live/$DOMAIN"

# Check of script als root wordt uitgevoerd
if [[ $EUID -ne 0 ]]; then
   error "Dit script moet als root worden uitgevoerd"
fi

log "🚀 GameCom Auto Deployment Script gestart"
log "Domain: $DOMAIN"
log "Email: $EMAIL"

# Update systeem
log "📦 Systeem updaten..."
apt update && apt upgrade -y

# Installeer basis packages
log "📦 Basis packages installeren..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Docker installatie
log "🐳 Docker installeren..."
if ! command -v docker &> /dev/null; then
    # Docker repository toevoegen
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Docker service starten
    systemctl start docker
    systemctl enable docker
    
    log "✅ Docker geïnstalleerd en gestart"
else
    log "✅ Docker is al geïnstalleerd"
fi

# Docker Compose installatie
log "🐳 Docker Compose installeren..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    log "✅ Docker Compose geïnstalleerd"
else
    log "✅ Docker Compose is al geïnstalleerd"
fi

# Node.js installatie (voor development tools)
log "📦 Node.js installeren..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    log "✅ Node.js geïnstalleerd"
else
    log "✅ Node.js is al geïnstalleerd"
fi

# Nginx installatie
log "🌐 Nginx installeren..."
apt install -y nginx

# Nginx configuratie
log "⚙️ Nginx configureren..."
cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect naar HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL configuratie (wordt later toegevoegd door Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compressie
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Frontend proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Security headers
    location ~ /\. {
        deny all;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Nginx site activeren
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx configuratie testen
nginx -t

# Nginx starten
systemctl start nginx
systemctl enable nginx

log "✅ Nginx geconfigureerd en gestart"

# Certbot installatie voor SSL
log "🔒 Certbot installeren voor SSL..."
apt install -y certbot python3-certbot-nginx

# SSL certificaat aanvragen
log "🔒 SSL certificaat aanvragen voor $DOMAIN..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# Auto-renewal cron job
log "🔄 SSL auto-renewal cron job instellen..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# App directory maken
log "📁 App directory maken..."
mkdir -p $APP_DIR
mkdir -p $BACKUP_DIR

# Git repository clonen (als het een git repo is)
if [ -d ".git" ]; then
    log "📦 Huidige directory kopiëren naar $APP_DIR..."
    cp -r . $APP_DIR/
else
    log "📦 Git repository clonen..."
    git clone https://github.com/yourusername/gamecom.git $APP_DIR
fi

cd $APP_DIR

# Environment file maken
log "⚙️ Environment configuratie maken..."
cat > .env << EOF
# Database
DATABASE_URL=postgresql://gamecom:gamecom_password@localhost:5432/gamecom

# Redis
REDIS_URL=redis://localhost:6379

# Steam API (optioneel)
STEAM_API_KEY=your_steam_api_key_here

# JWT Secret
JWT_SECRET=$(openssl rand -hex 32)

# Domain
DOMAIN=$DOMAIN

# Email
EMAIL=$EMAIL

# Environment
NODE_ENV=production
EOF

# Docker Compose production configuratie
log "🐳 Docker Compose production configuratie maken..."
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: ${APP_NAME}-postgres
    environment:
      POSTGRES_DB: gamecom
      POSTGRES_USER: gamecom
      POSTGRES_PASSWORD: gamecom_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - ${APP_NAME}-network

  redis:
    image: redis:7-alpine
    container_name: ${APP_NAME}-redis
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - ${APP_NAME}-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ${APP_NAME}-backend
    environment:
      - DATABASE_URL=postgresql://gamecom:gamecom_password@postgres:5432/gamecom
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=\${JWT_SECRET}
      - NODE_ENV=production
      - DOMAIN=$DOMAIN
    volumes:
      - ./backend:/app
      - /app/node_modules
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - ${APP_NAME}-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ${APP_NAME}-frontend
    environment:
      - VITE_API_URL=https://$DOMAIN/api
      - VITE_WS_URL=wss://$DOMAIN
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - ${APP_NAME}-network

volumes:
  postgres_data:
  redis_data:

networks:
  ${APP_NAME}-network:
    driver: bridge
EOF

# Backup script maken
log "💾 Backup script maken..."
cat > /usr/local/bin/backup-$APP_NAME << EOF
#!/bin/bash
# Backup script voor $APP_NAME

BACKUP_DIR="$BACKUP_DIR"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_\$DATE.tar.gz"

cd $APP_DIR

# Database backup
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U gamecom gamecom > backup.sql

# Files backup
tar -czf "\$BACKUP_DIR/\$BACKUP_FILE" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=backup.sql \
    .

# Database backup toevoegen
tar -czf "\$BACKUP_DIR/\$BACKUP_FILE" backup.sql

# Cleanup
rm -f backup.sql

# Oude backups verwijderen (ouder dan 30 dagen)
find \$BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup gemaakt: \$BACKUP_FILE"
EOF

chmod +x /usr/local/bin/backup-$APP_NAME

# Backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-$APP_NAME") | crontab -

# Monitoring script maken
log "📊 Monitoring script maken..."
cat > /usr/local/bin/monitor-$APP_NAME << EOF
#!/bin/bash
# Monitoring script voor $APP_NAME

APP_NAME="$APP_NAME"
DOMAIN="$DOMAIN"

# Check containers
echo "=== Container Status ==="
docker ps --filter "name=$APP_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check disk usage
echo -e "\n=== Disk Usage ==="
df -h | grep -E "(Filesystem|/dev/)"

# Check memory usage
echo -e "\n=== Memory Usage ==="
free -h

# Check SSL certificate
echo -e "\n=== SSL Certificate ==="
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -text -noout | grep -E "(Subject:|Not After)"
else
    echo "SSL certificate not found"
fi

# Check application health
echo -e "\n=== Application Health ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://$DOMAIN/health || echo "Application not responding"
EOF

chmod +x /usr/local/bin/monitor-$APP_NAME

# Firewall configuratie
log "🔥 Firewall configureren..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

log "✅ Firewall geconfigureerd"

# Docker containers bouwen en starten
log "🐳 Docker containers bouwen en starten..."
cd $APP_DIR
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wachten tot containers gestart zijn
log "⏳ Wachten tot containers gestart zijn..."
sleep 30

# Health check
log "🏥 Health check uitvoeren..."
if curl -s -f https://$DOMAIN/health > /dev/null; then
    log "✅ Applicatie is gezond en draait op https://$DOMAIN"
else
    warn "⚠️ Health check gefaald, controleer de logs"
fi

# Logs bekijken
log "📋 Container logs bekijken..."
docker-compose -f docker-compose.prod.yml logs --tail=20

# Finale informatie
log "🎉 Deployment voltooid!"
echo -e "${BLUE}"
echo "=========================================="
echo "           GAMECOM DEPLOYMENT"
echo "=========================================="
echo "🌐 Website: https://$DOMAIN"
echo "📧 Email: $EMAIL"
echo "📁 App Directory: $APP_DIR"
echo "💾 Backup Directory: $BACKUP_DIR"
echo ""
echo "🔧 Commando's:"
echo "  Status bekijken: docker-compose -f $APP_DIR/docker-compose.prod.yml ps"
echo "  Logs bekijken: docker-compose -f $APP_DIR/docker-compose.prod.yml logs"
echo "  Backup maken: /usr/local/bin/backup-$APP_NAME"
echo "  Monitoring: /usr/local/bin/monitor-$APP_NAME"
echo "  Restart: docker-compose -f $APP_DIR/docker-compose.prod.yml restart"
echo "  Stop: docker-compose -f $APP_DIR/docker-compose.prod.yml down"
echo ""
echo "📊 Monitoring:"
echo "  SSL Status: certbot certificates"
echo "  Nginx Status: systemctl status nginx"
echo "  Docker Status: systemctl status docker"
echo "=========================================="
echo -e "${NC}"

log "✅ Deployment script voltooid!" 