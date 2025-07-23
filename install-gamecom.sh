#!/bin/bash

# GameCom Snelle Installatie Script
# Voor Ubuntu VPS - Gebruikt officiële repository: https://github.com/Jjustmee23/gamecom

echo "🚀 GameCom Snelle Installatie Script"
echo "Repository: https://github.com/Jjustmee23/gamecom"
echo "=========================================="

# Check root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Dit script moet als root worden uitgevoerd"
    echo "Gebruik: sudo bash install-gamecom.sh"
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

# 2. Basis packages
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

# 4. Docker Compose
echo "🐳 Stap 4: Docker Compose installeren..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# 5. Node.js
echo "📦 Stap 5: Node.js installeren..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 6. Nginx
echo "🌐 Stap 6: Nginx installeren..."
apt install -y nginx

# 7. Repository clonen
echo "📁 Stap 7: GameCom repository clonen..."
mkdir -p /opt/gamecom
cd /opt/gamecom
git clone https://github.com/Jjustmee23/gamecom.git .

# 8. Environment configuratie
echo "⚙️ Stap 8: Environment configuratie..."
cp env.example .env

# Environment aanpassen
cat > .env << EOF
# Database (officiële database van de repo)
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

# 9. Nginx configuratie
echo "⚙️ Stap 9: Nginx configureren..."
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

# 10. SSL certificaat
echo "🔒 Stap 10: SSL certificaat installeren..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d gamecom.midaweb.be -d www.gamecom.midaweb.be --email info@midaweb.be --agree-tos --non-interactive
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# 11. Database setup
echo "🗄️ Stap 11: Database setup..."
cd /opt/gamecom/backend
npm install
npm run db:generate
npm run db:push

# 12. Docker containers starten
echo "🐳 Stap 12: Applicatie starten..."
cd /opt/gamecom
docker-compose up -d --build

# 13. Firewall
echo "🔥 Stap 13: Firewall configureren..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

# 14. Health check
echo "🏥 Stap 14: Health check..."
sleep 30
if curl -s -f https://gamecom.midaweb.be/health > /dev/null; then
    echo "✅ Applicatie is gezond!"
else
    echo "⚠️ Health check gefaald, controleer de logs"
fi

# 15. Backup script
echo "💾 Stap 15: Backup systeem instellen..."
mkdir -p /opt/backups/gamecom
cat > /usr/local/bin/backup-gamecom << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.tar.gz"
cd /opt/gamecom
docker-compose exec -T postgres pg_dump -U danny gamecom > backup.sql
tar -czf "/opt/backups/gamecom/$BACKUP_FILE" --exclude=node_modules --exclude=.git --exclude=backup.sql .
tar -czf "/opt/backups/gamecom/$BACKUP_FILE" backup.sql
rm -f backup.sql
find /opt/backups/gamecom -name "backup_*.tar.gz" -mtime +30 -delete
echo "Backup gemaakt: $BACKUP_FILE"
EOF
chmod +x /usr/local/bin/backup-gamecom
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-gamecom") | crontab -

# Klaar!
echo ""
echo "🎉 GAMECOM INSTALLATIE VOLTOOID!"
echo "=================================="
echo "🌐 Website: https://gamecom.midaweb.be"
echo "📧 Email: info@midaweb.be"
echo "📁 App Directory: /opt/gamecom"
echo "💾 Backup Directory: /opt/backups/gamecom"
echo ""
echo "🔧 Beheer Commando's:"
echo "  Status: docker-compose -f /opt/gamecom/docker-compose.yml ps"
echo "  Logs: docker-compose -f /opt/gamecom/docker-compose.yml logs"
echo "  Backup: /usr/local/bin/backup-gamecom"
echo "  Restart: docker-compose -f /opt/gamecom/docker-compose.yml restart"
echo ""
echo "✅ Je GameCom applicatie draait nu op je VPS!" 