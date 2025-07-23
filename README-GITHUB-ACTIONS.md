# 🚀 GitHub Actions - Automatische VPS Deployment

## 📋 Overzicht
Automatische CI/CD pipeline die je GameCom applicatie deployt naar je VPS elke keer als je `git push` doet naar de main branch.

### 🎯 Wat Het Doet
- ✅ **Automatische deployment** bij elke push naar main
- ✅ **Build testing** voordat deployment
- ✅ **Health checks** na deployment
- ✅ **Database migrations** automatisch uitvoeren
- ✅ **Container management** (stop/start/rebuild)
- ✅ **Deployment logging** voor monitoring

---

## ⚡ Snelle Setup

### 1. Run Setup Script
```bash
# Maak script uitvoerbaar
chmod +x setup-github-actions.sh

# Run setup script
./setup-github-actions.sh
```

### 2. Volg de Instructies
Het script zal je vragen om:
- VPS IP adres (45.154.238.116)
- VPS username
- SSH port (22)

### 3. Commit en Push
```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

---

## 🔧 Hoe Het Werkt

### Workflow Trigger
```yaml
on:
  push:
    branches: [ main ]  # Trigger bij push naar main
  workflow_dispatch:    # Handmatige trigger mogelijk
```

### Deployment Process
1. **Code Checkout** - Haalt laatste code op
2. **Dependencies Install** - Installeert npm packages
3. **Build Process** - Bouwt frontend en backend
4. **SSH Connection** - Verbindt met VPS
5. **Deployment** - Pullt code, rebuildt containers
6. **Health Check** - Controleert of alles werkt
7. **Migration** - Voert database updates uit

### VPS Deployment Script
```bash
cd /opt/gamecom
git pull origin main
docker compose down
docker system prune -f
docker compose up --build -d
sleep 30
docker compose ps
docker compose exec -T backend npm run db:migrate
```

---

## 🔐 GitHub Secrets

Het script configureert automatisch deze secrets:

| Secret | Beschrijving | Voorbeeld |
|--------|--------------|-----------|
| `VPS_HOST` | VPS IP adres | `45.154.238.116` |
| `VPS_USERNAME` | SSH username | `ubuntu` |
| `VPS_PORT` | SSH port | `22` |
| `VPS_SSH_KEY` | Private SSH key | Automatisch gegenereerd |

### SSH Key Setup
```bash
# SSH key wordt automatisch gegenereerd
ssh-keygen -t ed25519 -f ~/.ssh/gamecom_deploy

# Public key wordt getoond om toe te voegen aan VPS
cat ~/.ssh/gamecom_deploy.pub
```

---

## 📊 Monitoring & Logs

### GitHub Actions Logs
- Ga naar je repository op GitHub
- Klik op "Actions" tab
- Bekijk deployment logs

### VPS Logs
```bash
# Deployment logs
ssh user@45.154.238.116 'tail -f /opt/gamecom/deployment.log'

# Container logs
ssh user@45.154.238.116 'cd /opt/gamecom && docker compose logs -f'

# Container status
ssh user@45.154.238.116 'cd /opt/gamecom && docker compose ps'
```

### Health Check Endpoints
- **Backend**: `http://localhost:3001/health`
- **Frontend**: `http://localhost:3000`
- **Production**: `https://com.midaweb.be`

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. SSH Connection Failed
```bash
# Test SSH connection
ssh -i ~/.ssh/gamecom_deploy -p 22 user@45.154.238.116

# Check if key is in authorized_keys
ssh user@45.154.238.116 'cat ~/.ssh/authorized_keys'
```

#### 2. Build Failed
```bash
# Check local build
cd backend && npm run build
cd ../frontend && npm run build

# Check package.json scripts
cat backend/package.json | grep -A 5 '"scripts"'
```

#### 3. Container Health Check Failed
```bash
# Check container logs
ssh user@45.154.238.116 'cd /opt/gamecom && docker compose logs backend'
ssh user@45.154.238.116 'cd /opt/gamecom && docker compose logs frontend'

# Check container status
ssh user@45.154.238.116 'cd /opt/gamecom && docker compose ps'
```

#### 4. Database Migration Failed
```bash
# Check database connection
ssh user@45.154.238.116 'cd /opt/gamecom && docker compose exec backend npm run db:status'

# Run migration manually
ssh user@45.154.238.116 'cd /opt/gamecom && docker compose exec backend npm run db:migrate'
```

### Manual Deployment
```bash
# Als GitHub Actions faalt, deploy handmatig
ssh user@45.154.238.116 'cd /opt/gamecom && ./deploy-from-github.sh'
```

---

## 🔄 Workflow Customization

### Environment Variables
Voeg environment-specifieke variabelen toe:
```yaml
env:
  NODE_ENV: production
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  STEAM_API_KEY: ${{ secrets.STEAM_API_KEY }}
```

### Conditional Deployment
```yaml
# Alleen deployen bij specifieke branches
on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main ]
```

### Notification Integration
```yaml
# Discord webhook notification
- name: Notify Discord
  if: always()
  run: |
    curl -H "Content-Type: application/json" \
         -d '{"content":"Deployment ${{ job.status }} for ${{ github.repository }}"}' \
         ${{ secrets.DISCORD_WEBHOOK }}
```

---

## 📈 Performance Optimization

### Caching
```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: |
      backend/node_modules
      frontend/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Parallel Jobs
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run tests
        run: npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: echo "Deploy after tests pass"
```

---

## 🔒 Security Best Practices

### Secrets Management
- ✅ **No hardcoded secrets** in workflow files
- ✅ **Encrypted secrets** in GitHub repository
- ✅ **Minimal permissions** for deployment user
- ✅ **SSH key rotation** every 90 days

### VPS Security
```bash
# Limit deployment user permissions
sudo usermod -aG docker deployment-user
sudo chown -R deployment-user:deployment-user /opt/gamecom

# Restrict SSH access
sudo nano /etc/ssh/sshd_config
# Add: AllowUsers deployment-user
```

---

## 📊 Deployment Statistics

### Monitoring Dashboard
```bash
# Create monitoring script
cat > /opt/gamecom/monitor.sh << 'EOF'
#!/bin/bash
echo "=== GameCom Deployment Monitor ==="
echo "Last deployment: $(tail -n 1 /opt/gamecom/deployment.log)"
echo "Container status:"
docker compose ps
echo "System resources:"
df -h | grep /dev/vda1
free -h
EOF

chmod +x /opt/gamecom/monitor.sh
```

### Automated Health Checks
```bash
# Cron job voor dagelijkse health check
echo "0 6 * * * /opt/gamecom/monitor.sh >> /opt/gamecom/health.log" | crontab -
```

---

## 🎯 Resultaat

Na setup heb je:

### ✅ Automatische Deployment
- Elke `git push` naar main trigger deployment
- Build testing voordat deployment
- Health checks na deployment
- Database migrations automatisch

### ✅ Monitoring & Logs
- GitHub Actions logs voor deployment tracking
- VPS logs voor container monitoring
- Health check endpoints
- Deployment history

### ✅ Rollback Capability
```bash
# Rollback naar vorige versie
ssh user@45.154.238.116 'cd /opt/gamecom && git reset --hard HEAD~1 && docker compose up --build -d'
```

### ✅ Manual Override
- Workflow dispatch voor handmatige deployment
- SSH access voor directe VPS management
- Emergency deployment scripts

---

## 🚀 Next Steps

1. **Test de Pipeline**
   ```bash
   git add .
   git commit -m "Test GitHub Actions deployment"
   git push origin main
   ```

2. **Monitor First Deployment**
   - Check GitHub Actions tab
   - Monitor VPS logs
   - Verify application health

3. **Set Up Notifications**
   - Discord webhook voor deployment status
   - Email notifications voor failures
   - Slack integration voor team updates

4. **Optimize Performance**
   - Add caching layers
   - Optimize build times
   - Implement parallel jobs

---

## 📞 Support

### GitHub Actions Issues
- Check workflow logs in GitHub repository
- Verify secrets are correctly set
- Test SSH connection manually

### VPS Issues
- SSH into VPS and check logs
- Verify container status
- Check system resources

### Repository Issues
- Ensure repository is private (Jjustmee23/gamecom)
- Verify GitHub CLI authentication
- Check repository permissions

---

**🎉 Je hebt nu een volledig geautomatiseerde CI/CD pipeline!**

Elke keer als je `git push` doet, wordt je applicatie automatisch gedeployed naar je VPS op https://com.midaweb.be 