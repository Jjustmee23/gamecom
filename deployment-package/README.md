# GameCom Deployment Package

## 📦 Volledig Automatische Deployment Scripts

Dit package bevat alle scripts voor het automatisch deployen van GameCom op een Ubuntu/Debian server.

## 📁 Bestanden

- `deploy.sh` - Hoofd deployment script
- `restore.sh` - Backup restore script  
- `monitor.sh` - Monitoring dashboard
- `DEPLOYMENT.md` - Uitgebreide documentatie

## 🚀 Snelle Start

### 1. Upload naar Server
```bash
# Upload alle bestanden naar je server
scp -r deployment-package/ root@your-server-ip:/root/
```

### 2. Scripts Uitvoerbaar Maken
```bash
# Op de server
chmod +x deploy.sh restore.sh monitor.sh
```

### 3. Deployment Starten
```bash
# Als root uitvoeren
sudo ./deploy.sh
```

## ⚙️ Configuratie

Het script vraagt automatisch om:
- **Domain**: gamecom.midaweb.be
- **Email**: info@midaweb.be

## 📊 Wat Wordt Geïnstalleerd

- ✅ Docker & Docker Compose
- ✅ Node.js
- ✅ Nginx (met SSL)
- ✅ PostgreSQL Database
- ✅ Redis Cache
- ✅ SSL Certificaten (Let's Encrypt)
- ✅ Firewall Configuratie
- ✅ Backup Systeem
- ✅ Monitoring Dashboard

## 🔧 Na Deployment

### Monitoring Dashboard
```bash
sudo /usr/local/bin/monitor-gamecom
```

### Backup Maken
```bash
sudo /usr/local/bin/backup-gamecom
```

### Logs Bekijken
```bash
cd /opt/gamecom
docker-compose -f docker-compose.prod.yml logs
```

## 📞 Support

Voor vragen of problemen:
- **Email**: info@midaweb.be
- **Documentation**: DEPLOYMENT.md

---

**🎉 Klaar voor deployment!** 