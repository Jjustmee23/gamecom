# GameCom Auto Deployment Guide

## 🚀 Volledig Automatische Deployment

Dit script installeert en configureert automatisch:
- ✅ Docker & Docker Compose
- ✅ Node.js
- ✅ Nginx (met SSL)
- ✅ PostgreSQL Database
- ✅ Redis Cache
- ✅ SSL Certificaten (Let's Encrypt)
- ✅ Firewall Configuratie
- ✅ Backup Systeem
- ✅ Monitoring Dashboard

## 📋 Vereisten

### Server Vereisten
- **OS**: Ubuntu 20.04+ of Debian 11+
- **RAM**: Minimaal 2GB (4GB aanbevolen)
- **Storage**: Minimaal 20GB vrije ruimte
- **CPU**: 2 cores minimum
- **Domain**: Een geregistreerde domain (bijv. gamecom.midaweb.be)

### Voorbereiding
1. **Domain DNS**: Stel A-record in naar je server IP
2. **Server Access**: Root toegang tot de server
3. **Firewall**: Poort 22 (SSH) moet open zijn

## 🛠️ Installatie

### 1. Script Downloaden
```bash
# Download het deployment script
wget https://raw.githubusercontent.com/yourusername/gamecom/main/deploy.sh
chmod +x deploy.sh
```

### 2. Script Uitvoeren
```bash
# Als root uitvoeren
sudo ./deploy.sh
```

### 3. Configuratie Aanpassen
Het script vraagt automatisch om:
- **Domain naam** (bijv. gamecom.midaweb.be)
- **Email adres** (voor SSL certificaten)

## 📁 Bestandsstructuur

Na deployment wordt de volgende structuur aangemaakt:

```
/opt/gamecom/
├── backend/           # Backend applicatie
├── frontend/          # Frontend applicatie
├── docker-compose.prod.yml
├── .env              # Environment variabelen
└── backup/           # Database backups

/opt/backups/gamecom/ # Backup bestanden
/etc/nginx/sites-available/gamecom
/usr/local/bin/backup-gamecom
/usr/local/bin/monitor-gamecom
```

## 🔧 Configuratie

### Environment Variabelen
Het script maakt automatisch een `.env` bestand aan:

```env
# Database
DATABASE_URL=postgresql://gamecom:gamecom_password@localhost:5432/gamecom

# Redis
REDIS_URL=redis://localhost:6379

# Steam API (optioneel)
STEAM_API_KEY=your_steam_api_key_here

# JWT Secret
JWT_SECRET=auto_generated_secret

# Domain
DOMAIN=gamecom.midaweb.be

# Email
EMAIL=info@midaweb.be

# Environment
NODE_ENV=production
```

### SSL Certificaten
- **Automatisch**: Let's Encrypt certificaten
- **Auto-renewal**: Dagelijks cron job
- **Security Headers**: HSTS, X-Frame-Options, etc.

## 📊 Monitoring & Beheer

### Monitoring Dashboard
```bash
# Start monitoring dashboard
sudo /usr/local/bin/monitor-gamecom
```

### Backup Systeem
```bash
# Handmatige backup
sudo /usr/local/bin/backup-gamecom

# Automatische backups: Dagelijks om 02:00
# Backups worden 30 dagen bewaard
```

### Logs Bekijken
```bash
# Alle logs
docker-compose -f /opt/gamecom/docker-compose.prod.yml logs

# Specifieke service
docker-compose -f /opt/gamecom/docker-compose.prod.yml logs backend
docker-compose -f /opt/gamecom/docker-compose.prod.yml logs frontend
```

## 🔄 Backup & Restore

### Backup Maken
```bash
sudo /usr/local/bin/backup-gamecom
```

### Backup Herstellen
```bash
# Beschikbare backups bekijken
sudo ./restore.sh

# Specifieke backup herstellen
sudo ./restore.sh backup_20241201_143022.tar.gz
```

## 🛠️ Onderhoud

### Updates
```bash
# Code updaten
cd /opt/gamecom
git pull origin main

# Containers rebuilden
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### SSL Certificaat Vernieuwen
```bash
# Handmatig vernieuwen
sudo certbot renew

# Nginx herladen
sudo systemctl reload nginx
```

### Database Onderhoud
```bash
# Database backup
docker-compose -f /opt/gamecom/docker-compose.prod.yml exec postgres pg_dump -U gamecom gamecom > backup.sql

# Database restore
docker-compose -f /opt/gamecom/docker-compose.prod.yml exec -T postgres psql -U gamecom -d gamecom < backup.sql
```

## 🔍 Troubleshooting

### Veelvoorkomende Problemen

#### 1. SSL Certificaat Problemen
```bash
# Certificaat status bekijken
sudo certbot certificates

# Certificaat vernieuwen
sudo certbot renew --force-renewal
```

#### 2. Container Problemen
```bash
# Container status
docker-compose -f /opt/gamecom/docker-compose.prod.yml ps

# Container logs
docker-compose -f /opt/gamecom/docker-compose.prod.yml logs

# Container restart
docker-compose -f /opt/gamecom/docker-compose.prod.yml restart
```

#### 3. Database Problemen
```bash
# Database connectie testen
docker-compose -f /opt/gamecom/docker-compose.prod.yml exec postgres pg_isready -U gamecom

# Database grootte bekijken
docker-compose -f /opt/gamecom/docker-compose.prod.yml exec postgres psql -U gamecom -d gamecom -c "SELECT pg_size_pretty(pg_database_size('gamecom'));"
```

#### 4. Nginx Problemen
```bash
# Nginx configuratie testen
sudo nginx -t

# Nginx status
sudo systemctl status nginx

# Nginx herstarten
sudo systemctl restart nginx
```

### Log Bestanden
- **Nginx**: `/var/log/nginx/`
- **Docker**: `docker-compose -f /opt/gamecom/docker-compose.prod.yml logs`
- **System**: `journalctl -u nginx`, `journalctl -u docker`

## 🔒 Security

### Firewall
```bash
# Firewall status
sudo ufw status

# Poorten bekijken
sudo ufw status numbered
```

### SSL Security Headers
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

### Backup Security
- Backups worden lokaal opgeslagen
- Automatische cleanup na 30 dagen
- Encrypted database connections

## 📈 Performance

### Monitoring Metrics
- CPU Usage
- Memory Usage
- Disk Usage
- Database Performance
- SSL Certificate Status
- Container Health

### Optimization Tips
1. **Database Indexing**: Automatisch geconfigureerd
2. **Nginx Caching**: Gzip compressie ingeschakeld
3. **Docker Optimization**: Multi-stage builds
4. **SSL Optimization**: HTTP/2 support

## 🆘 Support

### Contact Informatie
- **Email**: info@midaweb.be
- **Domain**: gamecom.midaweb.be
- **Documentation**: Deze README

### Noodprocedures
1. **Server Down**: Controleer `systemctl status nginx docker`
2. **Database Issues**: Check `docker-compose logs postgres`
3. **SSL Problems**: Run `certbot certificates`
4. **Backup Issues**: Verify `/opt/backups/gamecom/`

## 📝 Changelog

### v1.0.0 (2024-12-01)
- ✅ Volledige automatische deployment
- ✅ Docker & Docker Compose setup
- ✅ Nginx met SSL configuratie
- ✅ PostgreSQL & Redis setup
- ✅ Backup & restore systeem
- ✅ Monitoring dashboard
- ✅ Firewall configuratie
- ✅ Auto-renewal SSL certificaten

---

**🎉 Deployment voltooid! Je GameCom applicatie draait nu op https://gamecom.midaweb.be** 