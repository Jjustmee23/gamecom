#!/bin/bash

# Complete Server Setup voor com.midaweb.be
# Voer dit uit op je server als root

set -e

DOMAIN="com.midaweb.be"
EMAIL="info@midaweb.be"
SERVER_IP=$(curl -s ifconfig.me)

echo "🚀 Complete Setup voor $DOMAIN"
echo "Server IP: $SERVER_IP"
echo "=================================="

# 1. Stop bestaande services
echo "📋 Stap 1: Services stoppen..."
systemctl stop nginx || true
docker-compose -f /opt/gamecom/docker-compose.yml down || true

# 2. Update Vite configuratie
echo "📋 Stap 2: Vite configuratie updaten..."
cat > /opt/gamecom/frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: 'all',
    hmr: {
      host: 'localhost',
    },
    proxy: {
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
EOF

# 3. Update Nginx configuratie
echo "📋 Stap 3: Nginx configuratie updaten..."
cat > /etc/nginx/sites-available/gamecom << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        
        if (\$request_method = 'OPTIONS') {
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# 4. Activeer Nginx configuratie
echo "📋 Stap 4: Nginx activeren..."
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/gamecom /etc/nginx/sites-enabled/
nginx -t
systemctl start nginx

# 5. Start applicatie
echo "📋 Stap 5: Applicatie starten..."
cd /opt/gamecom
docker-compose up -d

# 6. Wacht tot services opstarten
echo "📋 Stap 6: Wachten tot services opstarten..."
sleep 30

# 7. Test services
echo "📋 Stap 7: Services testen..."
echo "Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is bereikbaar"
else
    echo "❌ Frontend is niet bereikbaar"
fi

echo "Testing backend..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is bereikbaar"
else
    echo "❌ Backend is niet bereikbaar"
fi

echo "Testing nginx..."
if curl -f http://$DOMAIN > /dev/null 2>&1; then
    echo "✅ Nginx proxy werkt"
else
    echo "❌ Nginx proxy werkt niet"
fi

# 8. SSL certificaat installeren
echo "📋 Stap 8: SSL certificaat installeren..."
if command -v certbot > /dev/null 2>&1; then
    echo "Installing SSL certificate..."
    if certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL; then
        echo "✅ SSL certificaat geïnstalleerd"
    else
        echo "⚠️ SSL certificaat installatie gefaald (DNS mogelijk nog niet geconfigureerd)"
    fi
else
    echo "⚠️ Certbot niet geïnstalleerd, SSL wordt overgeslagen"
fi

# 9. Firewall configureren
echo "📋 Stap 9: Firewall configureren..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable || echo "⚠️ Firewall configuratie gefaald"

# 10. Finale status
echo ""
echo "🎉 Setup Voltooid voor $DOMAIN!"
echo "=================================="
echo "🌐 Website: http://$DOMAIN"
echo "🔒 HTTPS: https://$DOMAIN (na DNS configuratie)"
echo "📧 Email: $EMAIL"
echo "🖥️ Server IP: $SERVER_IP"
echo ""
echo "📋 DNS Records die je moet toevoegen:"
echo "Type: A"
echo "Name: com"
echo "Value: $SERVER_IP"
echo "TTL: 300"
echo ""
echo "🔧 Handige commando's:"
echo "- Status: docker-compose -f /opt/gamecom/docker-compose.yml ps"
echo "- Logs: docker-compose -f /opt/gamecom/docker-compose.yml logs -f"
echo "- Restart: docker-compose -f /opt/gamecom/docker-compose.yml restart"
echo "- SSL renew: certbot renew"
echo ""
echo "✅ Je GameCom applicatie is nu geconfigureerd voor $DOMAIN!" 