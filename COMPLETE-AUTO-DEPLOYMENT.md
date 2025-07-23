# 🚀 GameCom Platform - Complete Auto Deployment Guide

Complete deployment guide for GameCom Platform on Ubuntu Server 24.04 LTS with automatic CI/CD.

## 🎯 What this setup includes:
✅ Docker & Docker Compose installation  
✅ Nginx reverse proxy with SSL  
✅ Automatic SSL certificates (Let's Encrypt)  
✅ GitHub Actions for automatic deployment  
✅ Firewall & security configuration  
✅ Monitoring & health checks  
✅ Auto-restart on failure  

## 🖥️ VPS Requirements
- **OS**: Ubuntu Server 24.04 LTS (Noble Numbat) Minimal
- **IP**: 45.154.238.116
- **Domain**: com.midaweb.be
- **SSL Email**: info@midaweb.be
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB

---

## 🚀 Step 1: Initial VPS Setup

### 1.1 Connect to your VPS
```bash
ssh root@45.154.238.116
```

### 1.2 Download and run the deployment script
```bash
# Download the deployment script
wget https://raw.githubusercontent.com/Jjustmee23/gamecom/main/deploy-vps.sh

# Make it executable
chmod +x deploy-vps.sh

# Run the deployment script
./deploy-vps.sh
```
✅ Ready to run! GitHub repository URL is already configured.

---

## 🔧 Step 2: Configure GitHub Repository

### 2.1 Update your repository
```bash
# In your local repository
git remote set-url origin https://github.com/Jjustmee23/gamecom.git
git add .
git commit -m "Add VPS deployment configuration"
git push origin main
```

### 2.2 Set up GitHub Actions Secrets
Go to your GitHub repository: https://github.com/Jjustmee23/gamecom
Click Settings → Secrets and variables → Actions → New repository secret

Add these secrets:
- `VPS_HOST`: `45.154.238.116`
- `VPS_USERNAME`: `root` (or your VPS username)
- `VPS_PORT`: `22`
- `VPS_SSH_KEY`: Your private SSH key content

### 2.3 Generate SSH Key (if needed)
```bash
# Generate SSH key for deployment
ssh-keygen -t ed25519 -f ~/.ssh/gamecom_deploy -N "" -C "gamecom-deploy@github-actions"

# Display public key to add to VPS
cat ~/.ssh/gamecom_deploy.pub
```

Add the public key to your VPS:
```bash
# On your VPS
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
```

---

## 🌐 Step 3: Domain Configuration

### 3.1 DNS Records
Add these DNS records for com.midaweb.be:

| Type | Name | Value |
|------|------|-------|
| A | @ | 45.154.238.116 |
| A | www | 45.154.238.116 |

### 3.2 SSL Certificate
The script automatically sets up SSL certificates via Let's Encrypt.

---

## 📊 Step 4: Verification

### 4.1 Check application status
```bash
# On your VPS
cd /opt/gamecom
./status.sh
```

### 4.2 Test the application
- **Frontend**: https://com.midaweb.be
- **API Health**: https://com.midaweb.be/api/health
- **Database**: Connected to PostgreSQL
- **Redis**: Connected for caching

---

## 🔄 Step 5: Automatic Deployment

### 5.1 How it works
1. You push changes to GitHub main branch
2. GitHub Actions triggers automatically
3. VPS automatically pulls changes and redeploys
4. Application restarts with new code

### 5.2 Test automatic deployment
```bash
# Make a change locally
echo "# Test update" >> README.md
git add .
git commit -m "Test automatic deployment"
git push origin main

# Check deployment status
curl https://com.midaweb.be/api/health
```

---

## 🛠️ Management Commands

### Application Management
```bash
cd /opt/gamecom

# Check status
./status.sh

# Manual deployment
./deploy.sh

# View logs
docker compose logs -f

# Restart application
docker compose restart

# Stop application
docker compose down

# Start application
docker compose up -d
```

### System Management
```bash
# Check system status
systemctl status nginx
systemctl status postgresql
systemctl status redis

# View logs
journalctl -u nginx -f
journalctl -u postgresql -f

# SSL renewal
certbot renew

# Firewall status
ufw status
```

---

## 🔒 Security Features

### ✅ Implemented Security
- **Firewall**: UFW with minimal open ports
- **Fail2ban**: Protection against brute force attacks
- **SSL/TLS**: Automatic Let's Encrypt certificates
- **Rate limiting**: API protection
- **Security headers**: XSS, CSRF protection
- **Non-root containers**: Docker security best practices

### 🔧 Additional Security Recommendations
- Change default SSH port
- Use SSH keys instead of passwords
- Regular system updates
- Monitor logs regularly
- Backup database regularly

---

## 📈 Monitoring

### Health Checks
- **Application**: Every 30 seconds
- **System**: Every 5 minutes
- **SSL**: Automatic renewal

### Log Files
- **Application**: `/opt/gamecom/logs/`
- **System**: `/var/log/gamecom-*.log`
- **Nginx**: `/opt/gamecom/logs/nginx/`

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Application not starting
```bash
cd /opt/gamecom
docker compose logs backend
docker compose logs frontend
```

#### 2. SSL certificate issues
```bash
certbot certonly --nginx --domains com.midaweb.be
```

#### 3. GitHub Actions not working
```bash
# Check GitHub Actions logs in repository
# Verify secrets are correctly set
# Test SSH connection manually
```

#### 4. Database connection issues
```bash
# Check database connectivity
docker compose exec backend psql $DATABASE_URL -c "SELECT 1;"
```

### Emergency Commands
```bash
# Emergency restart
docker compose restart

# Emergency rollback
cd /opt/gamecom
git reset --hard HEAD~1
./deploy.sh

# Emergency access
docker compose exec backend sh
docker compose exec frontend sh
```

---

## 📞 Support

### Logs Location
- **Deployment**: `/var/log/gamecom-deployment.log`
- **Application**: `docker compose logs`
- **System**: `journalctl -u nginx`

### Useful URLs
- **Application**: https://com.midaweb.be
- **Health Check**: https://com.midaweb.be/api/health
- **GitHub**: https://github.com/Jjustmee23/gamecom
- **Admin**: https://com.midaweb.be/admin
- **Games**: https://com.midaweb.be/games
- **Wall of Gamers**: https://com.midaweb.be/wall-of-gamers

---

## ✅ Deployment Checklist

- [ ] VPS accessible via SSH
- [ ] Deployment script executed successfully
- [ ] GitHub repository updated
- [ ] GitHub Actions secrets configured
- [ ] DNS records pointing to VPS
- [ ] SSL certificate working
- [ ] Application accessible via domain
- [ ] Database connected
- [ ] Automatic deployment tested
- [ ] Monitoring working
- [ ] Security measures in place

---

## 🎉 Success!

Your GameCom Platform is now:

✅ **Live at**: https://com.midaweb.be  
✅ **Automatically deploying** from GitHub  
✅ **SSL secured** with Let's Encrypt  
✅ **Monitored** and auto-restarting  
✅ **Production ready** with security measures  

### Next steps:

1. Configure your API keys in `/opt/gamecom/.env`
2. Test all application features
3. Set up regular backups
4. Monitor performance and logs
5. Configure email notifications
6. Set up monitoring alerts

---

## 🔄 GitHub Actions Workflow

The automatic deployment uses this workflow:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        port: ${{ secrets.VPS_PORT }}
        script: |
          cd /opt/gamecom
          git pull origin main
          docker compose down
          docker compose up --build -d
          sleep 30
          docker compose ps
```

---

## 📊 Performance Monitoring

### System Resources
```bash
# Check CPU and memory usage
htop

# Check disk usage
df -h

# Check Docker resource usage
docker stats
```

### Application Metrics
- **Response time**: Monitor API endpoints
- **Error rate**: Check application logs
- **Database performance**: Monitor query times
- **Memory usage**: Track container memory

---

## 🔧 Maintenance

### Regular Tasks
- **Weekly**: Check system updates
- **Monthly**: Review security logs
- **Quarterly**: SSL certificate renewal
- **Annually**: Security audit

### Backup Strategy
```bash
# Daily database backup
docker compose exec -T backend pg_dump $DATABASE_URL > backup.sql

# Weekly full backup
tar -czf gamecom-backup-$(date +%Y%m%d).tar.gz /opt/gamecom
```

---

**🎮 GameCom Platform is now fully automated and production-ready!** 