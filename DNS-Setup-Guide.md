# DNS Setup Gids voor com.midaweb.be

## 🎯 Wat Je Moet Doen

### **Stap 1: Vind Je Server IP**
```bash
# Voer dit uit op je server
curl -s ifconfig.me
```

### **Stap 2: DNS Records Toevoegen**

Ga naar je domain provider (waarschijnlijk Midaweb) en voeg deze records toe:

#### **A Record (IPv4)**
```
Type: A
Name: com
Value: [JOUW_SERVER_IP]
TTL: 300
```

#### **AAAA Record (IPv6 - optioneel)**
```
Type: AAAA
Name: com
Value: [JOUW_SERVER_IPV6]
TTL: 300
```

#### **CNAME Record (www redirect)**
```
Type: CNAME
Name: www.com
Value: com.midaweb.be
TTL: 300
```

### **Stap 3: DNS Propagation Controleren**

```bash
# Test DNS propagation
nslookup com.midaweb.be
dig com.midaweb.be
ping com.midaweb.be
```

## 🔧 Server Setup Script

### **Download en Voer Uit:**

```bash
# Download het setup script
wget https://raw.githubusercontent.com/Jjustmee23/gamecom/main/server-setup-com.midaweb.be.sh

# Maak uitvoerbaar
chmod +x server-setup-com.midaweb.be.sh

# Voer uit als root
sudo ./server-setup-com.midaweb.be.sh
```

### **Of Voer Handmatig Uit:**

```bash
# 1. Update Vite configuratie
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

# 2. Update Nginx configuratie
cat > /etc/nginx/sites-available/gamecom << 'EOF'
server {
    listen 80;
    server_name com.midaweb.be www.com.midaweb.be;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 3. Activeer configuratie
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/gamecom /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 4. Herstart applicatie
cd /opt/gamecom
docker-compose restart frontend
docker-compose up -d

# 5. SSL certificaat (na DNS configuratie)
certbot --nginx -d com.midaweb.be
```

## ✅ Test Commando's

```bash
# Test DNS
nslookup com.midaweb.be

# Test HTTP
curl -I http://com.midaweb.be

# Test HTTPS (na SSL)
curl -I https://com.midaweb.be

# Test API
curl http://com.midaweb.be/api/health

# Test Wall of Gamers
curl http://com.midaweb.be/api/users/wall-of-gamers
```

## 🚀 Wall of Gamers Features

Na de setup kun je:

1. **Bezoek** https://com.midaweb.be
2. **Navigeer** naar "Wall of Gamers" in de sidebar
3. **Test alle features:**
   - ✅ Gebruikers bekijken
   - ✅ Zoeken en filteren
   - ✅ Profielen openen
   - ✅ Vriendschapsverzoeken sturen
   - ✅ Direct messaging
   - ✅ Recente games en achievements

## 🔧 Troubleshooting

### **DNS Problemen:**
```bash
# Controleer DNS propagation
dig com.midaweb.be +trace

# Test vanaf verschillende locaties
curl -I http://com.midaweb.be
```

### **Nginx Problemen:**
```bash
# Test configuratie
nginx -t

# Bekijk logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### **Docker Problemen:**
```bash
# Status check
docker-compose ps

# Logs bekijken
docker-compose logs -f

# Restart alles
docker-compose down && docker-compose up -d
```

### **SSL Problemen:**
```bash
# Test certificaat
openssl s_client -connect com.midaweb.be:443

# Renew certificaat
certbot renew
```

## 📞 Support

Als je problemen hebt:

1. **Controleer logs:** `docker-compose logs -f`
2. **Test DNS:** `nslookup com.midaweb.be`
3. **Test services:** `curl -I http://localhost:3000`
4. **Controleer firewall:** `ufw status`

## 🎉 Succes!

Na deze setup heb je een volledig werkende GameCom applicatie op com.midaweb.be met:
- ✅ Wall of Gamers functionaliteit
- ✅ Vriendschapsverzoeken
- ✅ Direct messaging
- ✅ SSL certificaat
- ✅ Optimale performance 