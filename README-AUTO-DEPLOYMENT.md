# 🤖 Automatische VPS Deployment Setup

## 📋 Overzicht
Automatische deployment van GameCom naar VPS bij elke git push naar de main branch.

### 🎯 Wat Dit Doet
- **Automatische deployment** bij elke `git push` naar main branch
- **GitHub Actions workflow** die de VPS update
- **SSH key authenticatie** voor veilige deployment
- **Health check verificatie** na deployment
- **Database migrations** automatisch uitvoeren

---

## 🚀 Setup Stappen

### 1. VPS Setup (Eenmalig)

#### A. Run Setup Script op VPS
```bash
# SSH naar je VPS
ssh user@45.154.238.116

# Download en run setup script
wget https://raw.githubusercontent.com/Jjustmee23/gamecom/main/setup-github-actions.sh
chmod +x setup-github-actions.sh
./setup-github-actions.sh
```

#### B. Kopieer SSH Private Key
Het script toont een SSH private key. Kopieer deze volledig.

### 2. GitHub Repository Setup

#### A. Ga naar GitHub Repository
- Open: https://github.com/Jjustmee23/gamecom
- Ga naar **Settings** → **Secrets and variables** → **Actions**

#### B. Voeg Repository Secrets Toe
Klik op **"New repository secret"** en voeg toe:

**Secret 1:**
- **Name**: `VPS_SSH_KEY`
- **Value**: (plak de private key van stap 1B)

**Secret 2:**
- **Name**: `VPS_USER`
- **Value**: `github-actions`

### 3. Test Deployment

#### A. Push naar Main Branch
```bash
# Op je lokale machine
git add .
git commit -m "Add automatic deployment"
git push origin main
```

#### B. Check GitHub Actions
- Ga naar: https://github.com/Jjustmee23/gamecom/actions
- Je ziet de deployment workflow draaien
- Groene checkmark = succesvol deployment

---

## 🔧 Hoe Het Werkt

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:  # Manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
    - name: Setup SSH
    - name: Deploy to VPS
    - name: Verify deployment
```

### Deployment Proces
1. **Code checkout** - Haalt laatste code op
2. **SSH setup** - Configureert SSH verbinding naar VPS
3. **VPS deployment** - Voert deployment uit op VPS
4. **Verificatie** - Controleert of applicatie draait

### VPS Deployment Script
```bash
# Op VPS wordt uitgevoerd:
cd /opt/gamecom
git pull origin main
docker compose down
docker compose up --build -d
docker compose exec -T backend npm run db:migrate
docker compose ps
```

---

## 🛠️ Management

### Manual Deployment Trigger
```bash
# Via GitHub Actions UI
1. Ga naar: https://github.com/Jjustmee23/gamecom/actions
2. Klik op "Deploy to VPS"
3. Klik op "Run workflow"
```

### Check Deployment Status
```bash
# Op VPS
cd /opt/gamecom
./status.sh

# Of check GitHub Actions
https://github.com/Jjustmee23/gamecom/actions
```

### View Deployment Logs
```bash
# Op VPS
cd /opt/gamecom
docker compose logs -f

# Of in GitHub Actions
https://github.com/Jjustmee23/gamecom/actions
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. SSH Connection Failed
```bash
# Check SSH key in GitHub Secrets
# Verify VPS_SSH_KEY secret is correct
# Check VPS_USER secret is 'github-actions'
```

#### 2. Permission Denied
```bash
# Op VPS
sudo chown -R github-actions:github-actions /opt/gamecom
sudo usermod -aG docker github-actions
```

#### 3. Git Pull Failed
```bash
# Check repository access
# Verify git remote is correct
cd /opt/gamecom
git remote -v
```

#### 4. Docker Build Failed
```bash
# Check Docker logs
cd /opt/gamecom
docker compose logs -f

# Check disk space
df -h
```

### Debug Commands
```bash
# Test SSH connection
ssh github-actions@45.154.238.116

# Check GitHub Actions user permissions
sudo -u github-actions whoami
sudo -u github-actions docker ps

# Test deployment script
sudo -u github-actions /home/github-actions/deploy.sh
```

---

## 🔒 Security

### SSH Key Security
- **Private key** alleen in GitHub Secrets
- **Public key** op VPS in authorized_keys
- **Dedicated user** (github-actions) voor deployment
- **Limited permissions** voor deployment user

### Network Security
- **SSH key authentication** (geen passwords)
- **Firewall rules** alleen noodzakelijke poorten
- **Docker isolation** voor applicatie containers

---

## 📊 Monitoring

### Deployment Monitoring
- **GitHub Actions logs** - Volledige deployment logs
- **VPS logs** - Docker en applicatie logs
- **Health check** - Automatische verificatie na deployment

### Health Check Endpoint
```bash
# Test health check
curl https://com.midaweb.be/health

# Response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

---

## 🎯 Workflow

### Development Workflow
```bash
# 1. Maak wijzigingen
# 2. Test lokaal
# 3. Commit en push
git add .
git commit -m "Add new feature"
git push origin main

# 4. GitHub Actions deployt automatisch
# 5. Applicatie is live op https://com.midaweb.be
```

### Branch Strategy
- **main branch** - Automatische deployment naar productie
- **feature branches** - Geen automatische deployment
- **Manual trigger** - Mogelijk via GitHub Actions UI

---

## ✅ Verification

### Deployment Checklist
- [ ] **GitHub Actions** - Workflow succesvol
- [ ] **VPS Status** - Containers draaien
- [ ] **Health Check** - `/health` endpoint werkt
- [ ] **Application** - https://com.midaweb.be laadt
- [ ] **Database** - Migrations succesvol
- [ ] **Logs** - Geen errors in logs

### Quick Status Check
```bash
# Op VPS
cd /opt/gamecom
./status.sh

# Of check GitHub Actions
https://github.com/Jjustmee23/gamecom/actions
```

---

## 🆘 Support

### Quick Fixes
```bash
# Restart deployment
cd /opt/gamecom
./restart.sh

# Check logs
docker compose logs -f

# Manual deployment
sudo -u github-actions /home/github-actions/deploy.sh
```

### Contact
- **Repository**: https://github.com/Jjustmee23/gamecom
- **VPS**: 45.154.238.116
- **Domain**: https://com.midaweb.be
- **GitHub Actions**: https://github.com/Jjustmee23/gamecom/actions

---

## 🎉 Resultaat

Na setup:
- ✅ **Automatische deployment** bij elke push
- ✅ **Veilige SSH authenticatie**
- ✅ **Health check verificatie**
- ✅ **Database migrations**
- ✅ **Rollback mogelijkheid** (git revert)
- ✅ **Monitoring en logs**

**🚀 Je GameCom applicatie wordt nu automatisch gedeployed bij elke git push!** 