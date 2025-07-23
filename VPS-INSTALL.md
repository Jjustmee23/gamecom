# GameCom VPS Installatie

## 🚀 Snelle Installatie op Ubuntu VPS

### Stap 1: VPS Voorbereiden
```bash
# Verbind met je VPS
ssh root@your-vps-ip

# Update systeem
apt update && apt upgrade -y
```

### Stap 2: Script Downloaden
```bash
# Download installatie script
wget https://raw.githubusercontent.com/yourusername/gamecom/main/install-vps.sh
chmod +x install-vps.sh
```

### Stap 3: Domain DNS Instellen
```bash
# Stel A-record in bij je domain provider:
# gamecom.midaweb.be -> your-vps-ip
# www.gamecom.midaweb.be -> your-vps-ip
```

### Stap 4: Installatie Starten
```bash
# Start automatische installatie
sudo bash install-vps.sh
```

## 📋 Wat Wordt Geïnstalleerd

- ✅ **Docker & Docker Compose**
- ✅ **Node.js**
- ✅ **Nginx** (met SSL)
- ✅ **PostgreSQL Database**
- ✅ **Redis Cache**
- ✅ **SSL Certificaten** (Let's Encrypt)
- ✅ **Firewall** (UFW)
- ✅ **Backup Systeem**
- ✅ **Monitoring Tools**

## 🔧 Na Installatie

### Website Toegang
- **Website**: https://gamecom.midaweb.be
- **API**: https://gamecom.midaweb.be/api
- **Health Check**: https://gamecom.midaweb.be/health

### Beheer Commando's
```bash
# Status bekijken
docker-compose -f /opt/gamecom/docker-compose.prod.yml ps

# Logs bekijken
docker-compose -f /opt/gamecom/docker-compose.prod.yml logs

# Backup maken
/usr/local/bin/backup-gamecom

# Monitoring
/usr/local/bin/monitor-gamecom

# Applicatie herstarten
docker-compose -f /opt/gamecom/docker-compose.prod.yml restart
```

## 🆘 Troubleshooting

### SSL Problemen
```bash
# Certificaat status
certbot certificates

# Certificaat vernieuwen
certbot renew
```

### Container Problemen
```bash
# Container status
docker ps

# Container logs
docker-compose -f /opt/gamecom/docker-compose.prod.yml logs

# Container restart
docker-compose -f /opt/gamecom/docker-compose.prod.yml restart
```

### Nginx Problemen
```bash
# Nginx status
systemctl status nginx

# Nginx herstarten
systemctl restart nginx
```

## 📞 Support

- **Email**: info@midaweb.be
- **Domain**: gamecom.midaweb.be

---

**🎉 Klaar! Je GameCom applicatie draait nu op je VPS!** 