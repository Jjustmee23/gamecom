# GameCom - Gaming Community Platform

Een complete gaming community platform met Wall of Gamers, chat, forums en meer!

## 🌟 Features

- **Wall of Gamers** - Bekijk alle gebruikers en hun profielen
- **Friendship System** - Vriendschapsverzoeken sturen en beheren
- **Direct Messaging** - Real-time chat tussen gebruikers
- **Game Integration** - Steam API integratie
- **Forums** - Community discussies
- **Achievements** - Gamification systeem
- **SSL/HTTPS** - Veilige verbindingen
- **Docker** - Complete containerized setup

## 🚀 Quick Start

### Vereisten
- Ubuntu 20.04+ of Debian 11+
- Root toegang
- Domain: `com.midaweb.be`
- IP: `45.154.238.116`

### Installatie

1. **Download en voer het deployment script uit:**
```bash
# Download het script
wget https://raw.githubusercontent.com/Jjustmee23/gamecom/main/deploy.sh

# Maak uitvoerbaar
chmod +x deploy.sh

# Voer uit als root
sudo ./deploy.sh
```

2. **DNS Records toevoegen:**
```
Type: A
Name: com
Value: 45.154.238.116
TTL: 300
```

3. **SSL certificaat installeren:**
```bash
# Het script doet dit automatisch, maar je kunt het handmatig doen:
certbot --nginx -d com.midaweb.be --non-interactive --agree-tos --email info@midaweb.be
```

## 📁 Project Structuur

```
gamecom/
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── database/       # Database schema
│   │   └── middleware/     # Express middleware
│   └── Dockerfile
├── frontend/               # React app
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── components/    # UI components
│   │   └── contexts/      # React contexts
│   └── Dockerfile
├── nginx/                  # Nginx configuratie
│   └── nginx.conf
├── docker-compose.yml      # Docker services
├── deploy.sh              # Deployment script
└── README.md
```

## 🔧 Services

### Docker Containers
- **postgres** - PostgreSQL database
- **backend** - Node.js API server
- **frontend** - React development server
- **nginx** - Reverse proxy met SSL
- **certbot** - SSL certificaat management

### Poorten
- **80** - HTTP (redirect naar HTTPS)
- **443** - HTTPS
- **3000** - Frontend (intern)
- **3001** - Backend API (intern)
- **5432** - PostgreSQL (intern)

## 🛠️ Beheer

### Status controleren
```bash
cd /opt/gamecom
docker compose ps
```

### Logs bekijken
```bash
# Alle services
docker compose logs -f

# Specifieke service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### Handmatige deployment
```bash
/usr/local/bin/deploy-gamecom
```

### Services herstarten
```bash
cd /opt/gamecom
docker compose restart
```

### SSL certificaat vernieuwen
```bash
certbot renew
```

## 🔐 Environment Variables

Bewerk `/opt/gamecom/.env` voor configuratie:

```env
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
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Registreren
- `POST /api/auth/login` - Inloggen
- `GET /api/auth/profile` - Profiel ophalen

### Users
- `GET /api/users/wall-of-gamers` - Alle gebruikers
- `GET /api/users/:id` - Gebruiker profiel
- `POST /api/users/friendship/request` - Vriendschapsverzoek
- `GET /api/users/friendships` - Vriendschappen

### Games
- `GET /api/games` - Games lijst
- `GET /api/games/:id` - Game details
- `POST /api/games/sync` - Steam games synchroniseren

### Chat
- `GET /api/chat/rooms` - Chat rooms
- `POST /api/chat/messages` - Bericht sturen
- WebSocket: `/socket.io` - Real-time chat

## 🔄 Automatische Updates

Het systeem heeft automatische updates ingesteld:

- **Cron job**: Dagelijkse updates om 2:00 AM
- **GitHub Actions**: Automatische deployment bij push
- **SSL renew**: Automatische certificaat vernieuwing

## 🚨 Troubleshooting

### Backend niet bereikbaar
```bash
# Check logs
docker compose logs backend

# Check health
curl http://localhost:3001/health

# Restart service
docker compose restart backend
```

### Frontend niet bereikbaar
```bash
# Check logs
docker compose logs frontend

# Check service
curl http://localhost:3000

# Restart service
docker compose restart frontend
```

### SSL certificaat problemen
```bash
# Check certificaat status
certbot certificates

# Renew handmatig
certbot renew

# Check nginx config
nginx -t
```

### Database problemen
```bash
# Check database logs
docker compose logs postgres

# Connect to database
docker compose exec postgres psql -U gamecom -d gamecom

# Backup database
docker compose exec postgres pg_dump -U gamecom gamecom > backup.sql
```

## 📊 Monitoring

### Health Checks
- **Backend**: `https://com.midaweb.be/health`
- **Frontend**: `https://com.midaweb.be`
- **Database**: Intern via Docker

### Logs
- **Application**: `/var/log/gamecom-deploy.log`
- **Nginx**: `/var/log/nginx/`
- **Docker**: `docker compose logs`

## 🔒 Security

- **SSL/HTTPS** - Automatische certificaten
- **Firewall** - UFW geconfigureerd
- **Rate Limiting** - API rate limiting
- **CORS** - Cross-origin resource sharing
- **JWT** - Secure authentication
- **Non-root containers** - Docker security

## 🎯 Wall of Gamers Features

### Gebruikers Bekijken
- Lijst van alle geregistreerde gebruikers
- Zoeken en filteren
- Sorteren op verschillende criteria

### Profielen
- Publieke profiel informatie
- Recente games
- Achievements
- Vriendschappen

### Interactie
- Vriendschapsverzoeken sturen
- Direct messaging
- Profiel bekijken

## 📞 Support

Voor vragen of problemen:
- **Email**: info@midaweb.be
- **GitHub**: https://github.com/Jjustmee23/gamecom
- **Documentation**: Deze README

## 📄 License

Dit project is ontwikkeld voor GameCom community platform.

---

**🎮 GameCom - Where Gamers Connect! 🎮** 