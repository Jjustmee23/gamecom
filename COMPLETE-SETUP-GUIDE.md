# 🚀 Complete GameCom VPS Deployment Setup Guide

## 📋 Overzicht
Volledige setup voor automatische deployment van GameCom naar VPS bij elke git push.

### 🎯 Wat We Gaan Doen
1. **VPS initialiseren** met alle benodigde software
2. **GitHub repository** configureren met secrets
3. **Automatische deployment** opzetten
4. **Testen** van de complete setup

---

## 🔧 Stap 1: VPS Initialisatie

### 1.1 SSH naar VPS
```bash
# Open terminal/command prompt
ssh root@45.154.238.116
# Of als je een andere user hebt:
ssh user@45.154.238.116
```

### 1.2 Download en Run Deployment Script
```bash
# Download het deployment script
wget https://raw.githubusercontent.com/Jjustmee23/gamecom/main/deploy.sh

# Maak het uitvoerbaar
chmod +x deploy.sh

# Run het script (zonder repository URL, we doen dat handmatig)
./deploy.sh
```

**Wacht tot het script klaar is (kan 10-15 minuten duren)**

### 1.3 Clone Repository Handmatig
```bash
# Ga naar application directory
cd /opt/gamecom

# Clone je private repository
git clone https://github.com/Jjustmee23/gamecom.git .

# Als het vraagt om credentials, gebruik:
# Username: Jjustmee23
# Password: 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
```

### 1.4 Configure Environment
```bash
# Open environment file
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

**Sla op met Ctrl+X, dan Y, dan Enter**

### 1.5 Get SSL Certificate
```bash
# Vraag SSL certificaat aan
sudo certbot --nginx -d com.midaweb.be --email info@midaweb.be --agree-tos --non-interactive
```

### 1.6 Start Application
```bash
# Build en start containers
docker compose up --build -d

# Check status
docker compose ps
```

---

## 🔑 Stap 2: GitHub Actions Setup

### 2.1 Run GitHub Actions Setup Script
```bash
# Download setup script
wget https://raw.githubusercontent.com/Jjustmee23/gamecom/main/setup-github-actions.sh

# Maak uitvoerbaar
chmod +x setup-github-actions.sh

# Run script
./setup-github-actions.sh
```

### 2.2 Kopieer SSH Private Key
Het script toont een SSH private key. **Kopieer deze volledig** (van `-----BEGIN OPENSSH PRIVATE KEY-----` tot `-----END OPENSSH PRIVATE KEY-----`)

---

## 🌐 Stap 3: GitHub Repository Configuratie

### 3.1 Ga naar GitHub Repository
1. Open browser
2. Ga naar: https://github.com/Jjustmee23/gamecom
3. Klik op **Settings** (tab bovenaan)

### 3.2 Voeg Repository Secrets Toe
1. Klik op **Secrets and variables** (linker menu)
2. Klik op **Actions**
3. Klik op **New repository secret**

**Secret 1:**
- **Name**: `VPS_SSH_KEY`
- **Value**: (plak de private key van stap 2.2)

**Secret 2:**
- **Name**: `VPS_USER`
- **Value**: `github-actions`

**Secret 3:**
- **Name**: `GITHUB_TOKEN`
- **Value**: `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`

### 3.3 Controleer Secrets
Je zou nu 3 secrets moeten hebben:
- ✅ `VPS_SSH_KEY`
- ✅ `VPS_USER`
- ✅ `GITHUB_TOKEN`

---

## 🚀 Stap 4: Test Automatische Deployment

### 4.1 Maak Test Wijziging
```bash
# Op je lokale machine
cd /path/to/your/gamecom/repository

# Maak een kleine wijziging
echo "# Test deployment" >> README.md

# Commit en push
git add README.md
git commit -m "Test automatic deployment"
git push origin main
```

### 4.2 Check GitHub Actions
1. Ga naar: https://github.com/Jjustmee23/gamecom/actions
2. Je ziet een workflow draaien: **"Deploy to VPS"**
3. Klik erop om de logs te bekijken
4. Wacht tot het groen wordt (✅)

### 4.3 Verify Deployment
```bash
# Check of applicatie draait
curl https://com.midaweb.be/health

# Of open in browser
# https://com.midaweb.be
```

---

## 🛠️ Stap 5: Management Commands

### 5.1 VPS Management
```bash
# SSH naar VPS
ssh user@45.154.238.116

# Ga naar app directory
cd /opt/gamecom

# Management commands
./start.sh      # Start applicatie
./stop.sh       # Stop applicatie
./restart.sh    # Herstart applicatie
./status.sh     # Check status
./backup.sh     # Maak backup
```

### 5.2 Logs Bekijken
```bash
# Application logs
docker compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### 5.3 Manual Deployment
```bash
# Als je handmatig wilt deployen
cd /opt/gamecom
git pull origin main
docker compose down
docker compose up --build -d
```

---

## 🔍 Stap 6: Troubleshooting

### 6.1 Common Issues

#### SSH Connection Failed
```bash
# Check SSH key in GitHub Secrets
# Verify VPS_SSH_KEY secret is correct
# Check VPS_USER secret is 'github-actions'
```

#### Git Pull Failed (Private Repository)
```bash
# Op VPS, configureer git credentials
cd /opt/gamecom
git config --global credential.helper store
echo "https://Jjustmee23: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@github.com" > ~/.git-credentials
```

#### Docker Build Failed
```bash
# Check logs
cd /opt/gamecom
docker compose logs -f

# Check disk space
df -h

# Restart Docker
sudo systemctl restart docker
```

#### SSL Certificate Issues
```bash
# Check SSL status
sudo certbot certificates

# Renew SSL
sudo certbot renew

# Check Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

### 6.2 Debug Commands
```bash
# Test SSH connection
ssh github-actions@45.154.238.116

# Check GitHub Actions user
sudo -u github-actions whoami

# Test deployment script
sudo -u github-actions /home/github-actions/deploy.sh

# Check all services
sudo systemctl status nginx postgresql docker
```

---

## 📊 Stap 7: Monitoring

### 7.1 Health Check
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

### 7.2 Status Check
```bash
# Quick status
cd /opt/gamecom
./status.sh

# Of check GitHub Actions
https://github.com/Jjustmee23/gamecom/actions
```

### 7.3 Resource Monitoring
```bash
# Check system resources
htop
df -h
free -h

# Check Docker resources
docker stats
```

---

## ✅ Stap 8: Verification Checklist

Na setup, controleer:

- [ ] **VPS Setup** - Alle software geïnstalleerd
- [ ] **Repository** - Code geklond op VPS
- [ ] **Environment** - .env file geconfigureerd
- [ ] **SSL Certificate** - HTTPS werkt
- [ ] **Application** - Draait in Docker containers
- [ ] **GitHub Secrets** - Alle 3 secrets toegevoegd
- [ ] **GitHub Actions** - Workflow succesvol
- [ ] **Automatic Deployment** - Werkt bij git push
- [ ] **Health Check** - /health endpoint werkt
- [ ] **Domain** - https://com.midaweb.be laadt

---

## 🎯 Stap 9: Development Workflow

### 9.1 Normale Development
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

### 9.2 Manual Deployment
```bash
# Via GitHub Actions UI
1. Ga naar: https://github.com/Jjustmee23/gamecom/actions
2. Klik op "Deploy to VPS"
3. Klik op "Run workflow"
```

---

## 🆘 Stap 10: Support

### 10.1 Quick Fixes
```bash
# Restart everything
cd /opt/gamecom
./restart.sh

# Check logs
docker compose logs -f

# Manual deployment
sudo -u github-actions /home/github-actions/deploy.sh
```

### 10.2 Contact Information
- **Repository**: https://github.com/Jjustmee23/gamecom
- **VPS**: 45.154.238.116
- **Domain**: https://com.midaweb.be
- **GitHub Actions**: https://github.com/Jjustmee23/gamecom/actions

---

## 🎉 Resultaat

Na het volgen van alle stappen:

✅ **Automatische deployment** bij elke git push  
✅ **Veilige SSH authenticatie**  
✅ **SSL certificaat** voor HTTPS  
✅ **Health check verificatie**  
✅ **Database migrations** automatisch  
✅ **Monitoring en logs**  
✅ **Backup systeem**  

**🚀 Je GameCom applicatie wordt nu automatisch gedeployed bij elke git push naar main branch!**

**🌐 Live op: https://com.midaweb.be** 