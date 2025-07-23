#!/bin/bash

# GameCom VPS Installatie Script
# Voor Ubuntu VPS - Eenvoudige installatie

echo "🚀 GameCom VPS Installatie Script"
echo "=================================="

# Check of we root zijn
if [ "$EUID" -ne 0 ]; then
    echo "❌ Dit script moet als root worden uitgevoerd"
    echo "Gebruik: sudo bash install-vps.sh"
    exit 1
fi

# Configuratie
DOMAIN="gamecom.midaweb.be"
EMAIL="info@midaweb.be"

echo "📋 Configuratie:"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# 1. Systeem updaten
echo "📦 Stap 1: Systeem updaten..."
apt update && apt upgrade -y

# 2. Basis packages installeren
echo "📦 Stap 2: Basis packages installeren..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release ufw

# 3. Docker installeren
echo "🐳 Stap 3: Docker installeren..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl start docker
systemctl enable docker

# 4. Docker Compose installeren
echo "🐳 Stap 4: Docker Compose installeren..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# 5. Node.js installeren
echo "📦 Stap 5: Node.js installeren..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 6. Nginx installeren
echo "🌐 Stap 6: Nginx installeren..."
apt install -y nginx

# 7. Nginx configureren
echo "⚙️ Stap 7: Nginx configureren..."
cat > /etc/nginx/sites-available/gamecom << 'EOF'
server {
    listen 80;
    server_name gamecom.midaweb.be www.gamecom.midaweb.be;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gamecom.midaweb.be www.gamecom.midaweb.be;
    
    ssl_certificate /etc/letsencrypt/live/gamecom.midaweb.be/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gamecom.midaweb.be/privkey.pem;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
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
        proxy_read_timeout 86400;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

ln -sf /etc/nginx/sites-available/gamecom /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl start nginx
systemctl enable nginx

# 8. Certbot installeren
echo "🔒 Stap 8: SSL certificaat installeren..."
apt install -y certbot python3-certbot-nginx

# 9. App directory maken
echo "📁 Stap 9: App directory maken..."
mkdir -p /opt/gamecom
mkdir -p /opt/backups/gamecom

# 10. Git repository clonen
echo "📦 Stap 10: Code downloaden..."
cd /opt/gamecom
git clone https://github.com/yourusername/gamecom.git .

# 11. Environment file maken
echo "⚙️ Stap 11: Configuratie maken..."
cat > .env << EOF
DATABASE_URL=postgresql://gamecom:gamecom_password@localhost:5432/gamecom
REDIS_URL=redis://localhost:6379
STEAM_API_KEY=your_steam_api_key_here
JWT_SECRET=$(openssl rand -hex 32)
DOMAIN=$DOMAIN
EMAIL=$EMAIL
NODE_ENV=production
EOF

# 12. Docker Compose configuratie
echo "🐳 Stap 12: Docker configuratie maken..."
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: gamecom-postgres
    environment:
      POSTGRES_DB: gamecom
      POSTGRES_USER: gamecom
      POSTGRES_PASSWORD: gamecom_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    restart: unless-stopped
    networks:
      - gamecom-network

  redis:
    image: redis:7-alpine
    container_name: gamecom-redis
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    restart: unless-stopped
    networks:
      - gamecom-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: gamecom-backend
    environment:
      - DATABASE_URL=postgresql://gamecom:gamecom_password@postgres:5432/gamecom
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
      - DOMAIN=gamecom.midaweb.be
    volumes:
      - ./backend:/app
      - /app/node_modules
    ports:
      - "127.0.0.1:3001:3001"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - gamecom-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: gamecom-frontend
    environment:
      - VITE_API_URL=https://gamecom.midaweb.be/api
      - VITE_WS_URL=wss://gamecom.midaweb.be
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - gamecom-network

volumes:
  postgres_data:
  redis_data:

networks:
  gamecom-network:
    driver: bridge
EOF

# 13. Firewall configureren
echo "🔥 Stap 13: Firewall configureren..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

# 14. Containers bouwen en starten
echo "🐳 Stap 14: Applicatie starten..."
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 15. SSL certificaat aanvragen
echo "🔒 Stap 15: SSL certificaat aanvragen..."
sleep 30
certbot --nginx -d gamecom.midaweb.be -d www.gamecom.midaweb.be --email info@midaweb.be --agree-tos --non-interactive

# 16. Backup script maken
echo "💾 Stap 16: Backup systeem instellen..."
cat > /usr/local/bin/backup-gamecom << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.tar.gz"
cd /opt/gamecom
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U gamecom gamecom > backup.sql
tar -czf "/opt/backups/gamecom/$BACKUP_FILE" --exclude=node_modules --exclude=.git --exclude=backup.sql .
tar -czf "/opt/backups/gamecom/$BACKUP_FILE" backup.sql
rm -f backup.sql
find /opt/backups/gamecom -name "backup_*.tar.gz" -mtime +30 -delete
echo "Backup gemaakt: $BACKUP_FILE"
EOF

chmod +x /usr/local/bin/backup-gamecom

# 17. Cron jobs instellen
echo "⏰ Stap 17: Automatische taken instellen..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-gamecom") | crontab -
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# 18. Monitoring script maken
echo "📊 Stap 18: Monitoring instellen..."
cat > /usr/local/bin/monitor-gamecom << 'EOF'
#!/bin/bash
echo "=== GameCom Status ==="
docker ps --filter "name=gamecom" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "=== SSL Certificate ==="
certbot certificates
echo ""
echo "=== Health Check ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://gamecom.midaweb.be/health
EOF

chmod +x /usr/local/bin/monitor-gamecom

# 19. Finale check
echo "🏥 Stap 19: Finale health check..."
sleep 30
if curl -s -f https://gamecom.midaweb.be/health > /dev/null; then
    echo "✅ Applicatie is gezond!"
else
    echo "⚠️ Health check gefaald, controleer de logs"
fi

# 20. Klaar!
echo ""
echo "🎉 INSTALLATIE VOLTOOID!"
echo "========================"
echo "🌐 Website: https://gamecom.midaweb.be"
echo "📧 Email: info@midaweb.be"
echo "📁 App Directory: /opt/gamecom"
echo "💾 Backup Directory: /opt/backups/gamecom"
echo ""
echo "🔧 Commando's:"
echo "  Status: docker-compose -f /opt/gamecom/docker-compose.prod.yml ps"
echo "  Logs: docker-compose -f /opt/gamecom/docker-compose.prod.yml logs"
echo "  Backup: /usr/local/bin/backup-gamecom"
echo "  Monitoring: /usr/local/bin/monitor-gamecom"
echo "  Restart: docker-compose -f /opt/gamecom/docker-compose.prod.yml restart"
echo ""
echo "✅ Je GameCom applicatie draait nu op je VPS!" 