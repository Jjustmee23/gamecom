#!/bin/bash

# Complete GameCom Setup Script
# Repository: https://github.com/Jjustmee23/gamecom
# Voer dit uit als root op je VPS

set -e

# Configuratie
DOMAIN="com.midaweb.be"
EMAIL="info@midaweb.be"
REPO_URL="https://github.com/Jjustmee23/gamecom.git"
INSTALL_DIR="/opt/gamecom"
SERVER_IP=$(curl -s ifconfig.me)

echo "🚀 Complete GameCom Setup Script"
echo "=================================="
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo "Server IP: $SERVER_IP"
echo "Install Directory: $INSTALL_DIR"
echo ""

# Functies
error_exit() {
    echo "❌ Error: $1" >&2
    exit 1
}

success_msg() {
    echo "✅ $1"
}

info_msg() {
    echo "ℹ️  $1"
}

# Stap 1: Systeem voorbereiden
info_msg "Stap 1: Systeem voorbereiden..."
apt update && apt upgrade -y || error_exit "Systeem update gefaald"
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release ufw nginx certbot python3-certbot-nginx || error_exit "Package installatie gefaald"
success_msg "Systeem voorbereid"

# Stap 2: Docker installeren
info_msg "Stap 2: Docker installeren..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    success_msg "Docker geïnstalleerd"
else
    success_msg "Docker is al geïnstalleerd"
fi

# Stap 3: Node.js installeren
info_msg "Stap 3: Node.js installeren..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    success_msg "Node.js geïnstalleerd"
else
    success_msg "Node.js is al geïnstalleerd"
fi

# Stap 4: Repository clonen
info_msg "Stap 4: Repository clonen..."
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
fi
git clone "$REPO_URL" "$INSTALL_DIR" || error_exit "Repository clonen gefaald"
cd "$INSTALL_DIR"
success_msg "Repository gekloneerd"

# Stap 5: Environment configuratie
info_msg "Stap 5: Environment configuratie..."
if [ ! -f .env ]; then
    cp env.example .env
    sed -i "s/localhost/$DOMAIN/g" .env
    sed -i "s/your-email@example.com/$EMAIL/g" .env
    success_msg "Environment bestand geconfigureerd"
else
    success_msg "Environment bestand bestaat al"
fi

# Stap 6: Vite configuratie updaten
info_msg "Stap 6: Vite configuratie updaten..."
cat > frontend/vite.config.ts << 'EOF'
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
success_msg "Vite configuratie bijgewerkt"

# Stap 7: Backend routes repareren
info_msg "Stap 7: Backend routes repareren..."
cat > backend/src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Client } from 'pg';

// Import routes
import authRoutes from './routes/auth';
import gameRoutes from './routes/games';
import chatRoutes from './routes/chat';
import userRoutes from './routes/users';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database query test successful:', result.rows[0]);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Chat functionality
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', data);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

async function startServer() {
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }

  const port = process.env.PORT || 3001;
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  });
}

startServer().catch(console.error);
EOF
success_msg "Backend routes gerepareerd"

# Stap 8: Nginx configuratie
info_msg "Stap 8: Nginx configuratie..."
cat > /etc/nginx/sites-available/gamecom << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
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
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# Activeer Nginx configuratie
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/gamecom /etc/nginx/sites-enabled/
nginx -t || error_exit "Nginx configuratie test gefaald"
systemctl restart nginx
success_msg "Nginx geconfigureerd"

# Stap 9: Applicatie starten
info_msg "Stap 9: Applicatie starten..."
docker-compose up -d || error_exit "Docker Compose start gefaald"
success_msg "Applicatie gestart"

# Stap 10: Wachten tot services opstarten
info_msg "Stap 10: Wachten tot services opstarten..."
sleep 30

# Stap 11: SSL certificaat installeren
info_msg "Stap 11: SSL certificaat installeren..."
if certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL; then
    success_msg "SSL certificaat geïnstalleerd"
else
    info_msg "SSL certificaat installatie gefaald (DNS mogelijk nog niet geconfigureerd)"
fi

# Stap 12: Firewall configureren
info_msg "Stap 12: Firewall configureren..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable || info_msg "Firewall configuratie gefaald"
success_msg "Firewall geconfigureerd"

# Stap 13: Test services
info_msg "Stap 13: Services testen..."
echo "Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    success_msg "Frontend is bereikbaar"
else
    info_msg "Frontend is nog niet bereikbaar"
fi

echo "Testing backend..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    success_msg "Backend is bereikbaar"
else
    info_msg "Backend is nog niet bereikbaar"
fi

echo "Testing nginx..."
if curl -f http://$DOMAIN > /dev/null 2>&1; then
    success_msg "Nginx proxy werkt"
else
    info_msg "Nginx proxy werkt niet"
fi

# Stap 14: GitHub deployment script maken
info_msg "Stap 14: GitHub deployment script maken..."
cat > /usr/local/bin/deploy-gamecom << 'EOF'
#!/bin/bash

# GameCom GitHub Deployment Script
# Voer dit uit om updates van GitHub te deployen

set -e

INSTALL_DIR="/opt/gamecom"
DOMAIN="com.midaweb.be"

echo "🚀 GameCom Deployment Script"
echo "============================"

# 1. Backup huidige versie
echo "📋 Stap 1: Backup maken..."
cd $INSTALL_DIR
if [ -d "backup" ]; then
    rm -rf backup
fi
mkdir backup
cp -r . backup/

# 2. Pull laatste wijzigingen
echo "📋 Stap 2: GitHub wijzigingen ophalen..."
git pull origin main || {
    echo "❌ Git pull gefaald, restore backup..."
    cp -r backup/* .
    exit 1
}

# 3. Update dependencies
echo "📋 Stap 3: Dependencies updaten..."
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 4. Rebuild containers
echo "📋 Stap 4: Containers rebuilden..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 5. Wachten tot services opstarten
echo "📋 Stap 5: Wachten tot services opstarten..."
sleep 30

# 6. Test services
echo "📋 Stap 6: Services testen..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend health check succesvol"
else
    echo "❌ Backend health check gefaald"
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is bereikbaar"
else
    echo "❌ Frontend is niet bereikbaar"
    exit 1
fi

# 7. SSL certificaat vernieuwen (indien nodig)
echo "📋 Stap 7: SSL certificaat controleren..."
certbot renew --quiet || echo "⚠️ SSL certificaat vernieuwing gefaald"

echo "🎉 Deployment succesvol!"
echo "🌐 Website: https://$DOMAIN"
echo "📊 Health: https://$DOMAIN/api/health"
EOF

chmod +x /usr/local/bin/deploy-gamecom
success_msg "GitHub deployment script gemaakt"

# Stap 15: Cron job voor automatische updates
info_msg "Stap 15: Cron job instellen..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/deploy-gamecom >> /var/log/gamecom-deploy.log 2>&1") | crontab -
success_msg "Cron job ingesteld voor dagelijkse updates om 2:00"

# Finale status
echo ""
echo "🎉 GameCom Setup Voltooid!"
echo "=========================="
echo "🌐 Website: https://$DOMAIN"
echo "📧 Email: $EMAIL"
echo "🖥️ Server IP: $SERVER_IP"
echo "📁 App Directory: $INSTALL_DIR"
echo ""
echo "📋 DNS Records die je moet toevoegen:"
echo "Type: A"
echo "Name: com"
echo "Value: $SERVER_IP"
echo "TTL: 300"
echo ""
echo "🔧 Handige commando's:"
echo "- Status: docker-compose -f $INSTALL_DIR/docker-compose.yml ps"
echo "- Logs: docker-compose -f $INSTALL_DIR/docker-compose.yml logs -f"
echo "- Deploy: /usr/local/bin/deploy-gamecom"
echo "- Restart: docker-compose -f $INSTALL_DIR/docker-compose.yml restart"
echo "- SSL renew: certbot renew"
echo ""
echo "🚀 Wall of Gamers Features:"
echo "- Gebruikers bekijken en zoeken"
echo "- Profielen openen"
echo "- Vriendschapsverzoeken sturen"
echo "- Direct messaging"
echo "- Recente games en achievements"
echo ""
success_msg "Setup script voltooid!" 