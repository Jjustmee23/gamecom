# 🚀 GameCom VPS Deployment

## 📋 Overzicht
Complete deployment guide voor GameCom op Ubuntu 24.04 VPS met domain `com.midaweb.be`

### 🎯 Specificaties
- **VPS IP**: 45.154.238.116
- **Domain**: com.midaweb.be
- **Email**: info@midaweb.be
- **OS**: Ubuntu 24.04 Minimal

---

## ⚡ Snelle Start

### 1. Download Deployment Script
```bash
# Download het deployment script
wget https://raw.githubusercontent.com/yourusername/gamecom/main/deploy.sh
chmod +x deploy.sh
```

### 2. Run Deployment Script
```bash
# Met repository URL
./deploy.sh https://github.com/yourusername/gamecom.git

# Of zonder repository (handmatig clonen)
./deploy.sh
```

### 3. Configure Environment
```bash
cd /opt/gamecom
nano .env
```

### 4. Get SSL Certificate
```bash
sudo certbot --nginx -d com.midaweb.be --email info@midaweb.be --agree-tos --non-interactive
```

### 5. Start Application
```bash
cd /opt/gamecom
docker compose up --build -d
```

---

## 📦 Wat Wordt Geïnstalleerd

### 🔧 System Components
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy & SSL termination
- **PostgreSQL** - Database
- **Certbot** - SSL certificates
- **Node.js 18.x** - Development tools
- **Fail2ban** - Security

### 🌐 Network Configuration
- **Firewall (UFW)** - Security rules
- **SSL/HTTPS** - Secure connections
- **Domain routing** - com.midaweb.be
- **WebSocket support** - Real-time features

### 📁 Application Structure
```
/opt/gamecom/
├── .env                 # Environment variables
├── docker-compose.yml   # Container configuration
├── backend/            # Backend application
├── frontend/           # Frontend application
├── start.sh           # Start application
├── stop.sh            # Stop application
├── restart.sh         # Restart application
├── status.sh          # Check status
└── backup.sh          # Backup script
```

---

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://gamecom:password@localhost:5432/gamecom

# Steam API
STEAM_API_KEY=your_steam_api_key

# JWT Secret
JWT_SECRET=your_jwt_secret

# Domain
DOMAIN=https://com.midaweb.be

# Redis
REDIS_URL=redis://localhost:6379

# Email (optional)
EMAIL_FROM=info@midaweb.be
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@midaweb.be
EMAIL_PASS=your_email_password
```

### Getting Steam API Key
1. Ga naar [Steam Developer](https://steamcommunity.com/dev/apikey)
2. Log in met je Steam account
3. Accepteer de voorwaarden
4. Voer een domain in (com.midaweb.be)
5. Kopieer de API key naar je .env file

---

## 🛠️ Management Commands

### Application Management
```bash
cd /opt/gamecom

# Start application
./start.sh

# Stop application
./stop.sh

# Restart application
./restart.sh

# Check status
./status.sh

# View logs
docker compose logs -f

# Update application
git pull
docker compose down
docker compose up --build -d
```

### Database Management
```bash
# Connect to database
docker compose exec backend psql $DATABASE_URL

# Run migrations
docker compose exec backend npm run db:migrate

# Backup database
./backup.sh
```

### SSL Management
```bash
# Check SSL status
sudo certbot certificates

# Renew SSL certificate
sudo certbot renew

# Test SSL renewal
sudo certbot renew --dry-run
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the ports
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Kill process if needed
sudo kill -9 <PID>
```

#### 2. Docker Permission Issues
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again, or run:
newgrp docker
```

#### 3. SSL Certificate Issues
```bash
# Check Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Certbot logs
sudo journalctl -u certbot
```

#### 4. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connection
docker compose exec backend node -e "
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
client.connect().then(() => console.log('Connected')).catch(console.error);
"
```

### Log Locations
```bash
# Application logs
docker compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -u nginx
sudo journalctl -u postgresql
```

---

## 🔒 Security Checklist

### ✅ Implemented Security Measures
- [x] **Firewall (UFW)** - Only necessary ports open
- [x] **SSL/HTTPS** - Encrypted connections
- [x] **Fail2ban** - Brute force protection
- [x] **Docker** - Container isolation
- [x] **Non-root user** - Limited privileges
- [x] **Secure passwords** - Strong default passwords

### 🔧 Additional Security Recommendations
```bash
# Change default passwords
nano /opt/gamecom/.env

# Set up automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Monitor system resources
sudo apt install htop iotop nethogs

# Set up log monitoring
sudo apt install logwatch
```

---

## 📊 Monitoring & Maintenance

### System Monitoring
```bash
# Check system resources
htop
df -h
free -h

# Check Docker resources
docker stats

# Check application status
./status.sh
```

### Backup Strategy
```bash
# Manual backup
./backup.sh

# Automatic daily backup (already configured)
# Runs at 2 AM daily via crontab
```

### Update Strategy
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update application
cd /opt/gamecom
git pull
docker compose down
docker compose up --build -d

# Update SSL certificates
sudo certbot renew
```

---

## 🌐 Domain & DNS Setup

### DNS Records
Configureer deze DNS records bij je provider:
```
Type: A
Name: com.midaweb.be
Value: 45.154.238.116
TTL: 300
```

### SSL Certificate
Het SSL certificaat wordt automatisch aangevraagd via Certbot met:
- **Domain**: com.midaweb.be
- **Email**: info@midaweb.be
- **Provider**: Let's Encrypt
- **Auto-renewal**: Configured

---

## 📞 Support

### Quick Status Check
```bash
echo "=== Quick Status ==="
cd /opt/gamecom
docker compose ps
sudo systemctl status nginx --no-pager -l
sudo certbot certificates
```

### Common Commands
```bash
# Restart everything
sudo systemctl restart nginx postgresql
cd /opt/gamecom && docker compose restart

# View all logs
docker compose logs -f --tail=100

# Check disk space
df -h

# Check memory usage
free -h
```

### Contact Information
- **Domain**: com.midaweb.be
- **Email**: info@midaweb.be
- **VPS IP**: 45.154.238.116

---

## ✅ Verification Checklist

Na deployment, controleer:

- [ ] **Domain resolves**: `ping com.midaweb.be`
- [ ] **SSL certificate**: `https://com.midaweb.be` loads with lock
- [ ] **Application accessible**: Frontend loads correctly
- [ ] **API working**: Backend endpoints respond
- [ ] **Database connected**: No connection errors
- [ ] **Steam integration**: API calls work
- [ ] **File uploads**: Upload functionality works
- [ ] **Real-time features**: WebSocket connections work
- [ ] **Backups running**: `./backup.sh` executes successfully
- [ ] **Security measures**: Firewall active, fail2ban running

---

## 🎯 Final Result

Na succesvolle deployment is je GameCom applicatie beschikbaar op:

**🌐 https://com.midaweb.be**

Met alle features:
- ✅ **Secure HTTPS** connection
- ✅ **Steam integration** voor games
- ✅ **Real-time chat** en messaging
- ✅ **User management** en profiles
- ✅ **Games database** met metadata
- ✅ **Achievements** tracking
- ✅ **Wall of Gamers** social features
- ✅ **Admin dashboard** voor beheer
- ✅ **Automatic backups** en monitoring

**🚀 Je GameCom platform is nu live en klaar voor gebruik!** 