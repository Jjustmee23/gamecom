#!/bin/bash

# Fix VPS Issues Script
# Voer dit uit als root op je VPS

set -e

echo "🔧 Fixing VPS Issues..."
echo "======================="

# Stap 1: Docker Compose installeren
echo "📋 Stap 1: Docker Compose installeren..."
if ! command -v docker compose &> /dev/null; then
    apt install docker-compose-plugin -y
    echo "✅ Docker Compose geïnstalleerd"
else
    echo "✅ Docker Compose is al geïnstalleerd"
fi

# Stap 2: Nginx configuratie repareren
echo "📋 Stap 2: Nginx configuratie repareren..."
cat > /etc/nginx/sites-available/gamecom << 'EOF'
server {
    listen 80;
    server_name com.midaweb.be www.com.midaweb.be;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
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
    
    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF

# Activeer configuratie
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/gamecom /etc/nginx/sites-enabled/

# Test en herstart Nginx
nginx -t
systemctl restart nginx
echo "✅ Nginx geconfigureerd"

# Stap 3: Applicatie starten
echo "📋 Stap 3: Applicatie starten..."
cd /opt/gamecom
docker compose down || true
docker compose up -d
echo "✅ Applicatie gestart"

# Stap 4: Wachten tot services opstarten
echo "📋 Stap 4: Wachten tot services opstarten..."
sleep 30

# Stap 5: Services testen
echo "📋 Stap 5: Services testen..."
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
    echo "❌ Nginx proxy werkt niet"
fi

# Stap 6: DNS controleren
echo "📋 Stap 6: DNS controleren..."
echo "DNS lookup voor com.midaweb.be:"
nslookup com.midaweb.be

# Stap 7: SSL certificaat installeren
echo "📋 Stap 7: SSL certificaat installeren..."
if certbot --nginx -d com.midaweb.be --non-interactive --agree-tos --email info@midaweb.be; then
    echo "✅ SSL certificaat geïnstalleerd"
else
    echo "⚠️ SSL certificaat installatie gefaald (DNS mogelijk nog niet geconfigureerd)"
fi

# Stap 8: Finale status
echo ""
echo "🎉 VPS Issues Fixed!"
echo "==================="
echo "🌐 Website: http://com.midaweb.be"
echo "🔒 HTTPS: https://com.midaweb.be (na DNS configuratie)"
echo "📊 Health: http://com.midaweb.be/health"
echo ""
echo "📋 Handige commando's:"
echo "- Status: docker compose ps"
echo "- Logs: docker compose logs -f"
echo "- Restart: docker compose restart"
echo "- SSL renew: certbot renew"
echo ""
echo "🔑 GitHub Deployment:"
echo "1. Kopieer je public key: cat gamecom.pub"
echo "2. Voeg toe aan GitHub Secrets"
echo "3. Push naar GitHub voor automatische deployment" 