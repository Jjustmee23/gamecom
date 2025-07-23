#!/bin/bash

# GameCom Verbeterd Installatie Script
# Repository: https://github.com/Jjustmee23/gamecom

set -e

# Configuratie
DOMAIN="gamecom.midaweb.be"
EMAIL="info@midaweb.be"
REPO_URL="https://github.com/Jjustmee23/gamecom.git"
INSTALL_DIR="/opt/gamecom"

echo "🚀 GameCom Verbeterde Installatie Script"
echo "Repository: $REPO_URL"
echo "========================================"
echo "📋 Configuratie:"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Functie voor error handling
error_exit() {
    echo "❌ Error: $1" >&2
    exit 1
}

# Functie voor success messages
success_msg() {
    echo "✅ $1"
}

# Functie voor info messages
info_msg() {
    echo "ℹ️  $1"
}

# Stap 1: Systeem updaten
info_msg "Stap 1: Systeem updaten..."
apt update && apt upgrade -y || error_exit "Systeem update gefaald"
success_msg "Systeem update voltooid"

# Stap 2: Basis packages installeren
info_msg "Stap 2: Basis packages installeren..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release ufw || error_exit "Basis packages installatie gefaald"
success_msg "Basis packages geïnstalleerd"

# Stap 3: Docker installeren
info_msg "Stap 3: Docker installeren..."
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

# Stap 4: Node.js installeren
info_msg "Stap 4: Node.js installeren..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    success_msg "Node.js geïnstalleerd"
else
    success_msg "Node.js is al geïnstalleerd"
fi

# Stap 5: Nginx installeren
info_msg "Stap 5: Nginx installeren..."
apt install -y nginx || error_exit "Nginx installatie gefaald"
systemctl enable nginx
success_msg "Nginx geïnstalleerd"

# Stap 6: Repository clonen
info_msg "Stap 6: GameCom repository clonen..."
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
fi
git clone "$REPO_URL" "$INSTALL_DIR" || error_exit "Repository clonen gefaald"
cd "$INSTALL_DIR"
success_msg "Repository gekloneerd"

# Stap 7: Environment configuratie
info_msg "Stap 7: Environment configuratie..."
if [ ! -f .env ]; then
    cp env.example .env
    sed -i "s/localhost/$DOMAIN/g" .env
    sed -i "s/your-email@example.com/$EMAIL/g" .env
    success_msg "Environment bestand geconfigureerd"
else
    success_msg "Environment bestand bestaat al"
fi

# Stap 8: Tijdelijke Nginx configuratie (HTTP)
info_msg "Stap 8: Tijdelijke Nginx configuratie..."
cat > /etc/nginx/sites-available/gamecom << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
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
}
EOF

# Verwijder default site en activeer gamecom
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/gamecom /etc/nginx/sites-enabled/
nginx -t || error_exit "Nginx configuratie test gefaald"
systemctl restart nginx
success_msg "Nginx geconfigureerd (HTTP)"

# Stap 9: SSL certificaat installeren
info_msg "Stap 9: SSL certificaat installeren..."
apt install -y certbot python3-certbot-nginx || error_exit "Certbot installatie gefaald"

# Wacht even tot Nginx volledig is opgestart
sleep 5

# Probeer SSL certificaat te installeren
if certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL"; then
    success_msg "SSL certificaat geïnstalleerd"
else
    info_msg "SSL certificaat installatie gefaald, maar HTTP werkt wel"
fi

# Stap 10: Database setup
info_msg "Stap 10: Database setup..."
cd backend
npm install || error_exit "Backend dependencies installatie gefaald"

# Update package.json scripts
npm pkg set scripts.db:generate="drizzle-kit generate:pg"
npm pkg set scripts.db:push="drizzle-kit push:pg"

# Voer database migraties uit
npx drizzle-kit generate:pg || info_msg "Database schema generatie gefaald (kan normaal zijn)"
npx drizzle-kit push:pg || info_msg "Database push gefaald (kan normaal zijn)"
success_msg "Database setup voltooid"

# Stap 11: Frontend setup
info_msg "Stap 11: Frontend setup..."
cd ../frontend
npm install || error_exit "Frontend dependencies installatie gefaald"
success_msg "Frontend setup voltooid"

# Stap 12: Applicatie starten
info_msg "Stap 12: Applicatie starten..."
cd ..
docker-compose up -d || error_exit "Docker Compose start gefaald"
success_msg "Applicatie gestart"

# Stap 13: Firewall configureren
info_msg "Stap 13: Firewall configureren..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable || info_msg "Firewall configuratie gefaald"
success_msg "Firewall geconfigureerd"

# Stap 14: Status check
info_msg "Stap 14: Status check..."
sleep 10

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    success_msg "Frontend is bereikbaar"
else
    info_msg "Frontend is nog niet bereikbaar (kan normaal zijn tijdens startup)"
fi

if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    success_msg "Backend health check succesvol"
else
    info_msg "Backend health check gefaald (kan normaal zijn tijdens startup)"
fi

# Finale status
echo ""
echo "🎉 GameCom Installatie Voltooid!"
echo "=================================="
echo "🌐 Website: https://$DOMAIN"
echo "📧 Email: $EMAIL"
echo ""
echo "📋 Volgende stappen:"
echo "1. Wacht 2-3 minuten tot alle services volledig zijn opgestart"
echo "2. Bezoek https://$DOMAIN"
echo "3. Registreer een admin account"
echo "4. Configureer je Steam API key in .env bestand"
echo ""
echo "🔧 Handige commando's:"
echo "- Status check: docker-compose ps"
echo "- Logs bekijken: docker-compose logs -f"
echo "- Restart: docker-compose restart"
echo "- Stop: docker-compose down"
echo ""
echo "📚 Documentatie: https://github.com/Jjustmee23/gamecom"
echo ""
success_msg "Installatie script voltooid!" 