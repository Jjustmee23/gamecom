# 🚀 Complete Automatische VPS Deployment Setup

## 📋 Overzicht
Complete automatische deployment van GameCom naar VPS bij elke git push, inclusief alle systemen, SSL, en management tools.

### 🎯 Wat Wordt Automatisch Geïnstalleerd
- ✅ **Alle system packages** (Docker, Nginx, PostgreSQL, etc.)
- ✅ **SSL certificaat** voor com.midaweb.be
- ✅ **Complete applicatie setup**
- ✅ **Management scripts**
- ✅ **Backup systeem**
- ✅ **Security hardening**

---

## 🔧 Stap 1: VPS Initial Setup

### 1.1 SSH naar VPS als Root
```bash
# SSH naar VPS als root
ssh root@45.154.238.116
```

### 1.2 Download en Run GitHub Actions Setup
```bash
# Download setup script
wget https://raw.githubusercontent.com/Jjustmee23/gamecom/main/setup-github-actions.sh

# Maak uitvoerbaar
chmod +x setup-github-actions.sh

# Run als root
./setup-github-actions.sh
```

### 1.3 Kopieer SSH Private Key
Het script toont een SSH private key. **Kopieer deze volledig** (van `-----BEGIN OPENSSH PRIVATE KEY-----` tot `-----END OPENSSH PRIVATE KEY-----`)

---

## 🌐 Stap 2: GitHub Repository Setup

### 2.1 Ga naar GitHub Repository
1. Open browser
2. Ga naar: https://github.com/Jjustmee23/gamecom
3. Klik op **Settings** (tab bovenaan)

### 2.2 Voeg Repository Secrets Toe
1. Klik op **Secrets and variables** (linker menu)
2. Klik op **Actions**
3. Klik op **New repository secret**

**Secret 1:**
- **Name**: `VPS_SSH_KEY`
- **Value**: (plak de private key van stap 1.3)

**Secret 2:**
- **Name**: `VPS_USER`
- **Value**: `github-actions`

**Secret 3:**
- **Name**: `GITHUB_TOKEN`
- **Value**: `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`

### 2.3 Controleer Secrets
Je zou nu 3 secrets moeten hebben:
- ✅ `VPS_SSH_KEY`
- ✅ `VPS_USER`
- ✅ `GITHUB_TOKEN`

---

## 🚀 Stap 3: Trigger Complete Deployment

### 3.1 Push naar Main Branch
```bash
# Op je lokale machine
cd /path/to/your/gamecom/repository

# Maak een wijziging
echo "# Complete automatic deployment setup" >> README.md

# Commit en push
git add README.md
git commit -m "Trigger complete VPS deployment"
git push origin main
```

### 3.2 Monitor GitHub Actions
1. Ga naar: https://github.com/Jjustmee23/gamecom/actions
2. Je ziet een workflow draaien: **"Deploy to VPS"**
3. Klik erop om de logs te bekijken
4. Het duurt 10-15 minuten voor complete setup

### 3.3 Deployment Proces
De workflow voert automatisch uit:

1. **System Updates** - Alle packages updaten
2. **Package Installation** - Docker, Nginx, PostgreSQL, etc.
3. **Docker Setup** - Docker installatie en configuratie
4. **Node.js Setup** - Node.js 18.x installatie
5. **Firewall Configuration** - UFW firewall setup
6. **PostgreSQL Setup** - Database en gebruiker aanmaken
7. **Repository Clone** - Code ophalen van GitHub
8. **Environment Setup** - .env file configureren
9. **Nginx Configuration** - Reverse proxy setup
10. **SSL Certificate** - Let's Encrypt certificaat
11. **Application Build** - Docker containers bouwen
12. **Database Migrations** - Schema uitvoeren
13. **Management Scripts** - Start/stop/status scripts
14. **Final Verification** - Health check en status

---

## 🛠️ Stap 4: Post-Deployment Setup

### 4.1 Configure Environment Variables
```bash
# SSH naar VPS
ssh root@45.154.238.116

# Ga naar app directory
cd /opt/gamecom

# Edit environment file
nano .env
```

**Vul deze waarden in:**
```env
# Database Configuration
DATABASE_URL=postgresql://gamecom:gamecom_secure_password_2024@localhost:5432/gamecom

# Steam API Configuration
STEAM_API_KEY=your_steam_api_key_here

# JWT Configuration
JWT_SECRET=gamecom_jwt_secret_key_$(openssl rand -hex 32)

# Domain Configuration
DOMAIN=https://com.midaweb.be

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Email Configuration
EMAIL_FROM=info@midaweb.be
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@midaweb.be
EMAIL_PASS=your_email_password_here
```

### 4.2 Restart Application
```bash
# Restart met nieuwe configuratie
cd /opt/gamecom
./restart.sh
```

---

## 🔍 Stap 5: Verification

### 5.1 Check Application Status
```bash
# Op VPS
cd /opt/gamecom
./status.sh
```

### 5.2 Test Application
```bash
# Health check
curl https://com.midaweb.be/health

# Of open in browser
# https://com.midaweb.be
```

### 5.3 Check SSL Certificate
```bash
# Check SSL status
sudo certbot certificates

# Test SSL
curl -I https://com.midaweb.be
```

---

## 🛠️ Management Commands

### 5.1 Application Management
```bash
# Op VPS
cd /opt/gamecom

# Start application
./start.sh

# Stop application
./stop.sh

# Restart application
./restart.sh

# Check status
./status.sh

# Create backup
./backup.sh
```

### 5.2 System Management
```bash
# Check system status
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status docker

# Check logs
docker compose logs -f
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u nginx -f
```

### 5.3 SSL Management
```bash
# Check SSL certificates
sudo certbot certificates

# Renew SSL certificates
sudo certbot renew

# Test SSL renewal
sudo certbot renew --dry-run
```

---

## 🔍 Troubleshooting

### Common Issues

#### GitHub Actions Failed
```bash
# Check SSH key in GitHub Secrets
# Verify VPS_SSH_KEY secret is correct
# Check VPS_USER secret is 'github-actions'
# Check GITHUB_TOKEN secret is correct
```

#### SSL Certificate Failed
```bash
# Check domain DNS
nslookup com.midaweb.be

# Check Nginx configuration
sudo nginx -t

# Manual SSL certificate
sudo certbot --nginx -d com.midaweb.be --email info@midaweb.be --agree-tos --non-interactive
```

#### Docker Build Failed
```bash
# Check Docker logs
cd /opt/gamecom
docker compose logs -f

# Check disk space
df -h

# Restart Docker
sudo systemctl restart docker
```

#### Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connection
cd /opt/gamecom
docker compose exec backend psql $DATABASE_URL

# Check database user
sudo -u postgres psql -c "\du"
```

### Debug Commands
```bash
# Check all services
sudo systemctl status nginx postgresql docker

# Check application logs
cd /opt/gamecom
docker compose logs -f

# Check system resources
htop
df -h
free -h

# Check network
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
```

---

## 📊 Monitoring

### 5.1 Health Check
```bash
# Test health endpoint
curl https://com.midaweb.be/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### 5.2 Status Check
```bash
# Quick status
cd /opt/gamecom
./status.sh

# Or check GitHub Actions
https://github.com/Jjustmee23/gamecom/actions
```

### 5.3 Resource Monitoring
```bash
# Check system resources
htop
df -h
free -h

# Check Docker resources
docker stats

# Check application resources
cd /opt/gamecom
docker compose ps
```

---

## ✅ Verification Checklist

Na complete deployment, controleer:

- [ ] **GitHub Actions** - Workflow succesvol
- [ ] **System Packages** - Docker, Nginx, PostgreSQL geïnstalleerd
- [ ] **SSL Certificate** - HTTPS werkt op com.midaweb.be
- [ ] **Application** - Draait in Docker containers
- [ ] **Database** - PostgreSQL draait en toegankelijk
- [ ] **Domain** - com.midaweb.be resolveert naar VPS
- [ ] **Health Check** - /health endpoint werkt
- [ ] **Management Scripts** - start.sh, stop.sh, etc. werken
- [ ] **Backup System** - backup.sh werkt
- [ ] **Security** - Firewall actief, SSL geldig

---

## 🎯 Development Workflow

### 5.1 Normale Development
```bash
# 1. Maak wijzigingen lokaal
# 2. Test lokaal
# 3. Commit en push
git add .
git commit -m "Add new feature"
git push origin main

# 4. GitHub Actions deployt automatisch
# 5. Check status: https://github.com/Jjustmee23/gamecom/actions
# 6. Applicatie is live op: https://com.midaweb.be
```

### 5.2 Manual Deployment
```bash
# Via GitHub Actions UI
1. Ga naar: https://github.com/Jjustmee23/gamecom/actions
2. Klik op "Deploy to VPS"
3. Klik op "Run workflow"
```

---

## 🆘 Support

### Quick Fixes
```bash
# Restart everything
cd /opt/gamecom
./restart.sh

# Check logs
docker compose logs -f

# Manual deployment
sudo -u github-actions /home/github-actions/deploy.sh
```

### Contact Information
- **Repository**: https://github.com/Jjustmee23/gamecom
- **VPS**: 45.154.238.116
- **Domain**: https://com.midaweb.be
- **GitHub Actions**: https://github.com/Jjustmee23/gamecom/actions
- **Email**: info@midaweb.be

---

## 🎉 Resultaat

Na complete setup:

✅ **Automatische deployment** bij elke git push  
✅ **Complete system setup** (Docker, Nginx, PostgreSQL, SSL)  
✅ **SSL certificaat** voor HTTPS  
✅ **Health check verificatie**  
✅ **Database migrations** automatisch  
✅ **Management scripts** en monitoring  
✅ **Backup systeem**  
✅ **Security hardening**  

**🚀 Je GameCom applicatie wordt nu automatisch gedeployed bij elke git push naar main branch!**

**🌐 Live op: https://com.midaweb.be**

**📧 SSL certificaat voor: info@midaweb.be** 