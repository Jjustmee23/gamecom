# GameCom Snelle Installatie

## 🚀 Volledig Geautomatiseerde Installatie

Gebruikt de officiële GameCom repository: [https://github.com/Jjustmee23/gamecom](https://github.com/Jjustmee23/gamecom)

## 📋 Vereisten

- **OS**: Ubuntu 20.04, 22.04, of 24.04
- **RAM**: 2GB minimum (4GB aanbevolen)
- **Storage**: 20GB SSD minimum
- **Domain**: Een geregistreerde domain (bijv. gamecom.midaweb.be)

## 🛠️ Snelle Installatie

### Stap 1: Script Downloaden
```bash
# Download het script
wget https://raw.githubusercontent.com/yourusername/gamecom/main/install-gamecom.sh
chmod +x install-gamecom.sh
```

### Stap 2: DNS Instellen
```bash
# Stel A-record in bij je domain provider:
# gamecom.midaweb.be -> your-vps-ip
# www.gamecom.midaweb.be -> your-vps-ip
```

### Stap 3: Script Uitvoeren
```bash
# Start automatische installatie
sudo bash install-gamecom.sh
```

## 🔧 Wat Wordt Geïnstalleerd

- ✅ **Docker & Docker Compose**
- ✅ **Node.js 18**
- ✅ **Nginx** (met SSL)
- ✅ **PostgreSQL Database** (officiële repo database)
- ✅ **Redis Cache**
- ✅ **SSL Certificaten** (Let's Encrypt)
- ✅ **Firewall** (UFW)
- ✅ **Backup Systeem**

## 📊 Na Installatie

### Website Toegang
- **Website**: https://gamecom.midaweb.be
- **API**: https://gamecom.midaweb.be/api
- **Health Check**: https://gamecom.midaweb.be/health

### Beheer Commando's
```bash
# Status bekijken
docker-compose -f /opt/gamecom/docker-compose.yml ps

# Logs bekijken
docker-compose -f /opt/gamecom/docker-compose.yml logs

# Backup maken
/usr/local/bin/backup-gamecom

# Applicatie herstarten
docker-compose -f /opt/gamecom/docker-compose.yml restart
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
docker-compose -f /opt/gamecom/docker-compose.yml logs

# Container restart
docker-compose -f /opt/gamecom/docker-compose.yml restart
```

### Nginx Problemen
```bash
# Nginx status
systemctl status nginx

# Nginx herstarten
systemctl restart nginx
```

## 📁 Bestandsstructuur

```
/opt/gamecom/
├── backend/           # Backend applicatie
├── frontend/          # Frontend applicatie
├── docker-compose.yml
├── .env              # Environment variabelen
└── ...

/opt/backups/gamecom/ # Backup bestanden
/usr/local/bin/backup-gamecom
```

## 🔒 Security

- **SSL/TLS**: Automatisch geconfigureerd
- **Firewall**: UFW met minimale poorten
- **Security Headers**: HSTS, X-Frame-Options, etc.
- **Database**: Officiële repo database gebruikt

## 📈 Performance

- **Nginx Caching**: Gzip compressie
- **Docker Optimization**: Multi-stage builds
- **SSL Optimization**: HTTP/2 support
- **Auto-renewal**: SSL certificaten

## 🆘 Support

- **Repository**: [https://github.com/Jjustmee23/gamecom](https://github.com/Jjustmee23/gamecom)
- **Email**: info@midaweb.be
- **Documentation**: Deze README

---

**🎉 Klaar! Je GameCom applicatie draait nu volledig automatisch op je VPS!** 