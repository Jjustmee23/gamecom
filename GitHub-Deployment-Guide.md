# GitHub Deployment Setup voor GameCom

## 🎯 **Stap 1: GitHub Repository Voorbereiden**

### **1.1 Fork de Repository**
```bash
# Ga naar: https://github.com/Jjustmee23/gamecom
# Klik op "Fork" om je eigen kopie te maken
```

### **1.2 Clone naar je lokale machine**
```bash
git clone https://github.com/[JOUW_USERNAME]/gamecom.git
cd gamecom
```

### **1.3 Voeg upstream toe**
```bash
git remote add upstream https://github.com/Jjustmee23/gamecom.git
git fetch upstream
```

## 🚀 **Stap 2: VPS Setup**

### **2.1 Download en voer setup script uit**
```bash
# Download het complete setup script
wget https://raw.githubusercontent.com/[JOUW_USERNAME]/gamecom/main/complete-gamecom-setup.sh

# Maak uitvoerbaar
chmod +x complete-gamecom-setup.sh

# Voer uit als root
sudo ./complete-gamecom-setup.sh
```

### **2.2 DNS Records toevoegen**
Voeg deze records toe bij je domain provider:
```
Type: A
Name: com
Value: [JOUW_VPS_IP]
TTL: 300
```

## 🔄 **Stap 3: GitHub Actions Workflow**

### **3.1 Maak GitHub Actions workflow**
Maak dit bestand: `.github/workflows/deploy.yml`

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /opt/gamecom
          /usr/local/bin/deploy-gamecom
```

### **3.2 GitHub Secrets instellen**
Ga naar je GitHub repository → Settings → Secrets and variables → Actions

Voeg deze secrets toe:
- `VPS_HOST`: Je VPS IP adres
- `VPS_USERNAME`: root (of je SSH gebruiker)
- `VPS_SSH_KEY`: Je private SSH key

## 🔑 **Stap 4: SSH Key Setup**

### **4.1 Genereer SSH key (als je nog geen hebt)**
```bash
# Op je lokale machine
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

### **4.2 Voeg public key toe aan VPS**
```bash
# Kopieer je public key naar VPS
ssh-copy-id root@[JOUW_VPS_IP]

# Of handmatig:
cat ~/.ssh/id_rsa.pub | ssh root@[JOUW_VPS_IP] "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### **4.3 Test SSH verbinding**
```bash
ssh root@[JOUW_VPS_IP]
```

## 🔄 **Stap 5: Deployment Workflow**

### **5.1 Lokale development workflow**
```bash
# 1. Maak wijzigingen
git add .
git commit -m "Update: beschrijving van wijzigingen"
git push origin main

# 2. GitHub Actions zal automatisch deployen
# 3. Check status op GitHub → Actions tab
```

### **5.2 Handmatige deployment**
```bash
# Op je VPS
/usr/local/bin/deploy-gamecom
```

### **5.3 Rollback bij problemen**
```bash
# Op je VPS
cd /opt/gamecom
git log --oneline -5  # Bekijk recente commits
git reset --hard HEAD~1  # Ga terug naar vorige commit
docker-compose restart
```

## 📊 **Stap 6: Monitoring**

### **6.1 Status check commando's**
```bash
# VPS status
docker-compose ps
docker-compose logs -f

# Website status
curl -I https://com.midaweb.be
curl https://com.midaweb.be/api/health

# SSL certificaat
certbot certificates
```

### **6.2 Log monitoring**
```bash
# Deployment logs
tail -f /var/log/gamecom-deploy.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Docker logs
docker-compose logs -f
```

## 🛠️ **Stap 7: Automatische Updates**

### **7.1 Cron job (al ingesteld door setup script)**
```bash
# Dagelijkse update om 2:00 AM
0 2 * * * /usr/local/bin/deploy-gamecom >> /var/log/gamecom-deploy.log 2>&1

# Bekijk cron jobs
crontab -l

# Bewerk cron jobs
crontab -e
```

### **7.2 SSL certificaat vernieuwing**
```bash
# Test SSL vernieuwing
certbot renew --dry-run

# Handmatige vernieuwing
certbot renew
```

## 🔧 **Stap 8: Troubleshooting**

### **8.1 Deployment problemen**
```bash
# Check deployment script
/usr/local/bin/deploy-gamecom

# Check git status
cd /opt/gamecom
git status
git log --oneline -5

# Check container status
docker-compose ps
docker-compose logs
```

### **8.2 Website problemen**
```bash
# Test services
curl http://localhost:3000
curl http://localhost:3001/health

# Check nginx config
nginx -t
systemctl status nginx

# Check firewall
ufw status
```

### **8.3 SSL problemen**
```bash
# Test certificaat
openssl s_client -connect com.midaweb.be:443 -servername com.midaweb.be

# Renew certificaat
certbot renew

# Check certificaat info
certbot certificates
```

## 🎯 **Stap 9: Best Practices**

### **9.1 Development workflow**
1. **Fork** de originele repository
2. **Clone** naar je lokale machine
3. **Maak wijzigingen** in feature branches
4. **Test** lokaal met Docker
5. **Commit** en **push** naar je fork
6. **GitHub Actions** deployt automatisch naar VPS

### **9.2 Backup strategie**
```bash
# Database backup
docker-compose exec backend npm run db:backup

# Code backup
cd /opt/gamecom
tar -czf backup-$(date +%Y%m%d).tar.gz .

# Restore
tar -xzf backup-20250723.tar.gz
```

### **9.3 Security**
- **Regelmatige updates**: `apt update && apt upgrade`
- **Firewall**: `ufw enable`
- **SSL certificaten**: Automatische vernieuwing
- **Backups**: Dagelijkse backups
- **Monitoring**: Log monitoring

## 🎉 **Succes!**

Na deze setup heb je:
- ✅ **Automatische deployment** via GitHub Actions
- ✅ **SSL certificaat** met automatische vernieuwing
- ✅ **Wall of Gamers** functionaliteit
- ✅ **Monitoring** en logging
- ✅ **Backup** systeem
- ✅ **Rollback** mogelijkheden

**Je GameCom applicatie is nu volledig geautomatiseerd!** 🚀 