# GameCom Ubuntu VPS Deployment Guide

## 🐧 Ubuntu VPS Auto Deployment

Specifiek geoptimaliseerd voor Ubuntu VPS servers (20.04, 22.04, 24.04)

## 📋 VPS Vereisten

### Minimale Specificaties
- **OS**: Ubuntu 20.04 LTS, 22.04 LTS, of 24.04 LTS
- **RAM**: 2GB minimum (4GB aanbevolen)
- **Storage**: 20GB SSD minimum
- **CPU**: 2 vCPU cores minimum
- **Bandwidth**: 1TB/maand minimum

### Aanbevolen VPS Providers
- **DigitalOcean** - Droplet $12/maand (2GB RAM)
- **Vultr** - Cloud Compute $12/maand (2GB RAM)
- **Linode** - Nanode $12/maand (2GB RAM)
- **Hetzner** - Cloud CX21 €8.29/maand (2GB RAM)

## 🚀 Snelle Deployment

### 1. VPS Aanmaken
```bash
# Maak een nieuwe Ubuntu VPS aan bij je provider
# Kies Ubuntu 20.04, 22.04 of 24.04
# Noteer het IP adres en root wachtwoord
```

### 2. SSH Verbinding
```bash
# Verbind met je VPS
ssh root@your-vps-ip

# Update het systeem
apt update && apt upgrade -y
```

### 3. Script Downloaden
```bash
# Download het deployment script
wget https://raw.githubusercontent.com/yourusername/gamecom/main/deploy-ubuntu.sh
chmod +x deploy-ubuntu.sh
```

### 4. Domain DNS Instellen
```bash
# Stel A-record in bij je domain provider
# gamecom.midaweb.be -> your-vps-ip
# www.gamecom.midaweb.be -> your-vps-ip
```

### 5. Deployment Starten
```bash
# Start de automatische deployment
sudo ./deploy-ubuntu.sh
```

## 🔧 Ubuntu Specifieke Features

### UFW Firewall
```bash
# Firewall status bekijken
sudo ufw status

# Poorten bekijken
sudo ufw status numbered

# Firewall regels aanpassen
sudo ufw allow 8080/tcp  # Extra poort toevoegen
```

### Systemd Services
```bash
# Service status bekijken
sudo systemctl status nginx
sudo systemctl status docker

# Service herstarten
sudo systemctl restart nginx
sudo systemctl restart docker

# Service logs bekijken
sudo journalctl -u nginx -f
sudo journalctl -u docker -f
```

### Swap File (Automatisch)
```bash
# Swap status bekijken
free -h

# Swap file locatie
ls -la /swapfile
```

## 📊 Monitoring & Beheer

### Real-time Monitoring
```bash
# Start monitoring dashboard
sudo /usr/local/bin/monitor-gamecom

# Systeem resources
htop
iotop
nethogs
```

### Logs Bekijken
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Docker logs
cd /opt/gamecom
docker-compose -f docker-compose.prod.yml logs -f

# System logs
sudo journalctl -f
```

### Performance Monitoring
```bash
# CPU usage
top -p 1

# Memory usage
free -h

# Disk usage
df -h

# Network usage
iftop
```

## 🔒 Security Best Practices

### SSH Hardening
```bash
# SSH configuratie aanpassen
sudo nano /etc/ssh/sshd_config

# Aanbevolen instellingen:
# PermitRootLogin no
# PasswordAuthentication no
# Port 2222  # Verander standaard poort

# SSH herstarten
sudo systemctl restart ssh
```

### Fail2ban Installatie
```bash
# Fail2ban installeren
sudo apt install -y fail2ban

# Configuratie
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Fail2ban starten
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Regular Updates
```bash
# Automatische updates instellen
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Update log bekijken
sudo cat /var/log/unattended-upgrades/unattended-upgrades.log
```

## 💾 Backup & Restore

### Automatische Backups
```bash
# Backup status bekijken
ls -la /opt/backups/gamecom/

# Handmatige backup
sudo /usr/local/bin/backup-gamecom

# Backup grootte bekijken
du -sh /opt/backups/gamecom/*
```

### Backup Restore
```bash
# Beschikbare backups
sudo ./restore.sh

# Specifieke backup herstellen
sudo ./restore.sh backup_20241201_143022.tar.gz
```

## 🔧 Troubleshooting

### Veelvoorkomende Problemen

#### 1. SSL Certificaat Problemen
```bash
# Certificaat status
sudo certbot certificates

# Certificaat vernieuwen
sudo certbot renew --force-renewal

# Nginx herladen
sudo systemctl reload nginx
```

#### 2. Docker Problemen
```bash
# Docker status
sudo systemctl status docker

# Docker logs
sudo journalctl -u docker -f

# Docker restart
sudo systemctl restart docker
```

#### 3. Nginx Problemen
```bash
# Configuratie testen
sudo nginx -t

# Nginx status
sudo systemctl status nginx

# Nginx herstarten
sudo systemctl restart nginx
```

#### 4. Database Problemen
```bash
# PostgreSQL status
cd /opt/gamecom
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U gamecom

# Database grootte
docker-compose -f docker-compose.prod.yml exec postgres psql -U gamecom -d gamecom -c "SELECT pg_size_pretty(pg_database_size('gamecom'));"
```

### Performance Issues

#### 1. High CPU Usage
```bash
# Processen bekijken
top
htop

# Docker resource usage
docker stats
```

#### 2. High Memory Usage
```bash
# Memory usage
free -h

# Swap usage
swapon --show

# Memory pressure
cat /proc/pressure/memory
```

#### 3. High Disk Usage
```bash
# Disk usage
df -h

# Large files zoeken
sudo find / -type f -size +100M -exec ls -lh {} \;

# Docker cleanup
docker system prune -a
```

## 📈 Performance Optimization

### Nginx Optimization
```bash
# Nginx worker processes
sudo nano /etc/nginx/nginx.conf

# Aanbevolen instellingen:
# worker_processes auto;
# worker_connections 1024;
```

### Database Optimization
```bash
# PostgreSQL configuratie
cd /opt/gamecom
docker-compose -f docker-compose.prod.yml exec postgres psql -U gamecom -d gamecom -c "SHOW shared_buffers;"
docker-compose -f docker-compose.prod.yml exec postgres psql -U gamecom -d gamecom -c "SHOW effective_cache_size;"
```

### Docker Optimization
```bash
# Docker daemon configuratie
sudo nano /etc/docker/daemon.json

# Aanbevolen instellingen:
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## 🆘 Support & Maintenance

### Regular Maintenance
```bash
# Dagelijkse checks
sudo /usr/local/bin/monitor-gamecom

# Wekelijkse updates
sudo apt update && sudo apt upgrade -y

# Maandelijkse cleanup
sudo docker system prune -a
sudo journalctl --vacuum-time=30d
```

### Monitoring Alerts
```bash
# Disk space alert
df -h | awk '$5 > "80%" {print $0}'

# Memory alert
free -h | awk 'NR==2{if($3/$2 > 0.8) print "High memory usage"}'

# SSL expiry alert
sudo certbot certificates | grep "VALID"
```

### Contact Information
- **Email**: info@midaweb.be
- **Domain**: gamecom.midaweb.be
- **Documentation**: Deze README

## 🎉 Deployment Voltooid!

Na succesvolle deployment:
- ✅ **Website**: https://gamecom.midaweb.be
- ✅ **API**: https://gamecom.midaweb.be/api
- ✅ **Health Check**: https://gamecom.midaweb.be/health
- ✅ **SSL**: Automatisch geconfigureerd
- ✅ **Backups**: Dagelijks automatisch
- ✅ **Monitoring**: Real-time dashboard

**Je GameCom applicatie draait nu volledig op je Ubuntu VPS!** 🚀 