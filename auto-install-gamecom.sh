#!/bin/bash

# GameCom Auto Installatie Script
# Voor Ubuntu VPS - Volledig geautomatiseerd
# Repository: https://github.com/Jjustmee23/gamecom

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
REPO_URL="https://github.com/Jjustmee23/gamecom.git"

# Check of script als root wordt uitgevoerd
if [[ $EUID -ne 0 ]]; then
   error "Dit script moet als root worden uitgevoerd. Gebruik: sudo bash auto-install-gamecom.sh"
fi

log "🚀 GameCom Auto Installatie Script gestart"
log "Repository: $REPO_URL"
log "Domain: $DOMAIN"
log "Email: $EMAIL"

# Ubuntu versie check
log "🐧 Ubuntu versie controleren..."
if ! command -v lsb_release &> /dev/null; then
    error "lsb_release niet gevonden. Dit script werkt alleen op Ubuntu."
fi

UBUNTU_VERSION=$(lsb_release -rs)
log "Ubuntu versie gedetecteerd: $UBUNTU_VERSION"

if [[ "$UBUNTU_VERSION" != "20.04" && "$UBUNTU_VERSION" != "22.04" && "$UBUNTU_VERSION" != "24.04" ]]; then
    warn "Dit script is getest op Ubuntu 20.04, 22.04 en 24.04. Huidige versie: $UBUNTU_VERSION"
    read -p "Doorgaan? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Stap 1: Systeem updaten
log "📦 Stap 1: Systeem updaten..."
export DEBIAN_FRONTEND=noninteractive
apt update && apt upgrade -y

# Stap 2: Basis packages installeren
log "📦 Stap 2: Basis packages installeren..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release ufw

# Stap 3: Docker installeren
log "🐳 Stap 3: Docker installeren..."
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

# Stap 4: Docker Compose installeren
log "🐳 Stap 4: Docker Compose installeren..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    log "✅ Docker Compose geïnstalleerd"
else
    log "✅ Docker Compose is al geïnstalleerd"
fi

# Stap 5: Node.js installeren
log "📦 Stap 5: Node.js installeren..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    log "✅ Node.js geïnstalleerd"
else
    log "✅ Node.js is al geïnstalleerd"
fi

# Stap 6: Nginx installeren
log "🌐 Stap 6: Nginx installeren..."
apt install -y nginx

# Stap 7: App directory maken en repository clonen
log "📁 Stap 7: Repository clonen..."
mkdir -p $APP_DIR
cd $APP_DIR

# Repository clonen
if [ -d ".git" ]; then
    log "📦 Repository al aanwezig, updaten..."
    git pull origin main
else
    log "📦 Repository clonen..."
    git clone $REPO_URL .
fi

# Stap 8: Environment configuratie
log "⚙️ Stap 8: Environment configuratie maken..."
if [ ! -f ".env" ]; then
    cp env.example .env
fi

# Environment file aanpassen
log "⚙️ Environment variabelen instellen..."
cat > .env << EOF
# Database (gebruik de officiële database van de repo)
DATABASE_URL=postgresql://danny:Jjustmee12773@45.154.238.111:5432/gamecom

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=$(openssl rand -hex 32)

# Steam API (optioneel)
STEAM_API_KEY=your-steam-api-key-here

# Server
PORT=3001
NODE_ENV=production

# Domain
DOMAIN=$DOMAIN

# Email
EMAIL=$EMAIL
EOF

log "✅ Environment configuratie voltooid"

# Stap 9: Nginx configuratie
log "⚙️ Stap 9: Nginx configureren..."
cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
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

# Stap 10: Certbot installeren en SSL configureren
log "🔒 Stap 10: SSL certificaat installeren..."
apt install -y certbot python3-certbot-nginx

# SSL certificaat aanvragen
log "🔒 SSL certificaat aanvragen voor $DOMAIN..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# Auto-renewal cron job
log "🔄 SSL auto-renewal cron job instellen..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Stap 11: Database setup
log "🗄️ Stap 11: Database setup..."
cd $APP_DIR/backend

# Dependencies installeren
npm install

# Database schema genereren
npm run db:generate

# Schema naar database pushen
npm run db:push

log "✅ Database setup voltooid"

# Stap 12: Docker containers starten
log "🐳 Stap 12: Docker containers starten..."
cd $APP_DIR

# Docker containers bouwen en starten
docker-compose up -d --build

# Wachten tot containers gestart zijn
log "⏳ Wachten tot containers gestart zijn..."
sleep 45

# Stap 13: Firewall configureren
log "🔥 Stap 13: Firewall configureren..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

log "✅ Firewall geconfigureerd"

# Stap 14: Backup script maken
log "💾 Stap 14: Backup systeem instellen..."
mkdir -p /opt/backups/$APP_NAME

cat > /usr/local/bin/backup-$APP_NAME << EOF
#!/bin/bash
# Backup script voor $APP_NAME

BACKUP_DIR="/opt/backups/$APP_NAME"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_\$DATE.tar.gz"

cd $APP_DIR

# Database backup
docker-compose exec -T postgres pg_dump -U danny gamecom > backup.sql

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

# Stap 15: Monitoring script maken
log "📊 Stap 15: Monitoring instellen..."
cat > /usr/local/bin/monitor-$APP_NAME << EOF
#!/bin/bash
# Monitoring script voor $APP_NAME

echo "=== GameCom Status ==="
docker-compose -f $APP_DIR/docker-compose.yml ps

echo -e "\n=== SSL Certificate ==="
certbot certificates

echo -e "\n=== Health Check ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://$DOMAIN/health

echo -e "\n=== System Resources ==="
echo "CPU Usage: \$(top -bn1 | grep "Cpu(s)" | awk '{print \$2}' | cut -d'%' -f1)%"
echo "Memory Usage: \$(free | grep Mem | awk '{printf("%.1f%%", \$3/\$2 * 100.0)}')"
echo "Disk Usage: \$(df -h / | awk 'NR==2 {print \$5}')"
EOF

chmod +x /usr/local/bin/monitor-$APP_NAME

# Stap 16: Health check
log "🏥 Stap 16: Health check uitvoeren..."
sleep 30

if curl -s -f https://$DOMAIN/health > /dev/null; then
    log "✅ Applicatie is gezond en draait op https://$DOMAIN"
else
    warn "⚠️ Health check gefaald, controleer de logs"
fi

# Stap 17: Logs bekijken
log "📋 Container logs bekijken..."
docker-compose logs --tail=10

# Finale informatie
log "🎉 GameCom Auto Installatie voltooid!"
echo -e "${BLUE}"
echo "=========================================="
echo "           GAMECOM INSTALLATIE"
echo "=========================================="
echo "🌐 Website: https://$DOMAIN"
echo "📧 Email: $EMAIL"
echo "📁 App Directory: $APP_DIR"
echo "💾 Backup Directory: /opt/backups/$APP_NAME"
echo "🐧 OS: Ubuntu $UBUNTU_VERSION"
echo ""
echo "🔧 Beheer Commando's:"
echo "  Status bekijken: docker-compose -f $APP_DIR/docker-compose.yml ps"
echo "  Logs bekijken: docker-compose -f $APP_DIR/docker-compose.yml logs"
echo "  Backup maken: /usr/local/bin/backup-$APP_NAME"
echo "  Monitoring: /usr/local/bin/monitor-$APP_NAME"
echo "  Restart: docker-compose -f $APP_DIR/docker-compose.yml restart"
echo "  Stop: docker-compose -f $APP_DIR/docker-compose.yml down"
echo ""
echo "📊 Monitoring:"
echo "  SSL Status: certbot certificates"
echo "  Nginx Status: systemctl status nginx"
echo "  Docker Status: systemctl status docker"
echo "  UFW Status: ufw status"
echo ""
echo "🆘 Troubleshooting:"
echo "  SSL Problemen: certbot renew"
echo "  Container Problemen: docker-compose -f $APP_DIR/docker-compose.yml logs"
echo "  Nginx Problemen: systemctl restart nginx"
echo "=========================================="
echo -e "${NC}"

log "✅ Auto installatie script voltooid!"
log "🎮 Je GameCom applicatie draait nu op https://$DOMAIN" 