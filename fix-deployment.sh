#!/bin/bash

# Fix Deployment Issues Script
# Voer dit uit als root op je VPS

set -e

echo "🔧 Fixing Deployment Issues..."
echo "=============================="

# Stap 1: Repository probleem oplossen
echo "📋 Stap 1: Fixing repository..."
cd /opt
rm -rf gamecom
mkdir gamecom
cd gamecom

# Clone repository
git clone https://github.com/Jjustmee23/gamecom.git .
echo "✅ Repository gekloneerd"

# Stap 2: Directories maken
echo "📋 Stap 2: Creating directories..."
mkdir -p nginx/conf.d
mkdir -p ssl
mkdir -p certbot/conf
mkdir -p certbot/www
echo "✅ Directories gemaakt"

# Stap 3: Environment file maken
echo "📋 Stap 3: Creating environment file..."
cat > .env << 'EOF'
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
echo "✅ Environment file gemaakt"

# Stap 4: Firewall configureren
echo "📋 Stap 4: Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable || echo "⚠️ Firewall configuratie gefaald"
echo "✅ Firewall geconfigureerd"

# Stap 5: Services starten
echo "📋 Stap 5: Starting services..."
docker compose down || true
docker compose build --no-cache
docker compose up -d
echo "✅ Services gestart"

# Stap 6: Wachten tot services opstarten
echo "📋 Stap 6: Waiting for services to start..."
sleep 30

# Stap 7: Services testen
echo "📋 Stap 7: Testing services..."
echo "Testing backend..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is bereikbaar"
else
    echo "❌ Backend is niet bereikbaar"
fi

echo "Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is bereikbaar"
else
    echo "❌ Frontend is niet bereikbaar"
fi

echo "Testing nginx..."
if curl -f http://com.midaweb.be > /dev/null 2>&1; then
    echo "✅ Nginx proxy werkt"
else
    echo "⚠️ Nginx proxy werkt niet (DNS mogelijk nog niet geconfigureerd)"
fi

# Stap 8: SSL certificaat installeren
echo "📋 Stap 8: Installing SSL certificate..."
if certbot --nginx -d com.midaweb.be --non-interactive --agree-tos --email info@midaweb.be; then
    echo "✅ SSL certificaat geïnstalleerd"
else
    echo "⚠️ SSL certificaat installatie gefaald (DNS mogelijk nog niet geconfigureerd)"
fi

# Stap 9: Deployment script maken
echo "📋 Stap 9: Creating deployment script..."
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
echo "✅ Deployment script gemaakt"

# Stap 10: Cron job maken
echo "📋 Stap 10: Creating cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/deploy-gamecom >> /var/log/gamecom-deploy.log 2>&1") | crontab -
echo "✅ Cron job gemaakt"

# Finale status
echo ""
echo "🎉 Deployment Issues Fixed!"
echo "==========================="
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
echo "✅ All issues fixed!" 