#!/bin/bash

# GitHub Actions VPS Setup Script
# Voor automatische deployment bij git push

echo "🔧 GitHub Actions VPS Setup Script"
echo "=================================="
echo "VPS: 45.154.238.116"
echo "Repository: https://github.com/Jjustmee23/gamecom"
echo "Email: info@midaweb.be"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

print_status "Setting up GitHub Actions deployment..."

# Step 1: Create deployment user
print_status "Step 1: Creating deployment user..."
if ! id "github-actions" &>/dev/null; then
    useradd -m -s /bin/bash github-actions
    print_success "Created github-actions user"
else
    print_warning "github-actions user already exists"
fi

# Step 2: Generate SSH key for GitHub Actions
print_status "Step 2: Generating SSH key for GitHub Actions..."
sudo -u github-actions mkdir -p /home/github-actions/.ssh
sudo -u github-actions ssh-keygen -t rsa -b 4096 -f /home/github-actions/.ssh/id_rsa -N "" -C "github-actions@com.midaweb.be"

# Step 3: Add public key to authorized_keys
print_status "Step 3: Adding public key to authorized_keys..."
sudo -u github-actions cat /home/github-actions/.ssh/id_rsa.pub >> /home/github-actions/.ssh/authorized_keys
sudo chmod 600 /home/github-actions/.ssh/authorized_keys
sudo chmod 700 /home/github-actions/.ssh

# Step 4: Give github-actions user access to application directory
print_status "Step 4: Setting up application directory permissions..."
sudo usermod -aG docker github-actions
sudo usermod -aG sudo github-actions
sudo mkdir -p /opt/gamecom
sudo chown -R github-actions:github-actions /opt/gamecom

# Step 5: Create deployment script for github-actions user
print_status "Step 5: Creating deployment script..."
sudo tee /home/github-actions/deploy.sh > /dev/null << 'EOF'
#!/bin/bash
cd /opt/gamecom

# Pull latest changes
git pull origin main

# Stop current containers
docker compose down

# Rebuild and start containers
docker compose up --build -d

# Run database migrations if needed
docker compose exec -T backend npm run db:migrate || echo "No migrations needed"

# Check deployment status
docker compose ps

echo "Deployment completed!"
EOF

sudo chmod +x /home/github-actions/deploy.sh
sudo chown github-actions:github-actions /home/github-actions/deploy.sh

# Step 6: Display the private key for GitHub Secrets
print_status "Step 6: Displaying SSH private key for GitHub Secrets..."
echo ""
echo "🔑 SSH Private Key (add to GitHub Secrets as VPS_SSH_KEY):"
echo "=========================================================="
sudo cat /home/github-actions/.ssh/id_rsa
echo ""
echo "=========================================================="

# Step 7: Display the public key
print_status "Step 7: SSH Public Key:"
echo ""
echo "🔑 SSH Public Key:"
echo "=================="
sudo cat /home/github-actions/.ssh/id_rsa.pub
echo "=================="

# Step 8: Instructions
echo ""
echo "📋 GitHub Setup Instructions:"
echo "============================="
echo ""
echo "1. Go to your GitHub repository: https://github.com/Jjustmee23/gamecom"
echo ""
echo "2. Go to Settings > Secrets and variables > Actions"
echo ""
echo "3. Add these repository secrets:"
echo "   - VPS_SSH_KEY: (paste the private key above)"
echo "   - VPS_USER: github-actions"
echo "   - GITHUB_TOKEN: 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"
echo ""
echo "4. The GitHub Actions workflow is already configured in .github/workflows/deploy.yml"
echo ""
echo "5. Push to main branch to trigger complete deployment:"
echo "   git add ."
echo "   git commit -m 'Trigger complete VPS deployment'"
echo "   git push origin main"
echo ""
echo "✅ Setup completed! Your VPS will now automatically deploy on every push to main branch."
echo ""
echo "🌐 Application will be available at: https://com.midaweb.be"
echo ""
echo "📋 What will be installed automatically:"
echo "   - All system packages (Docker, Nginx, PostgreSQL, etc.)"
echo "   - SSL certificate for com.midaweb.be"
echo "   - Complete application setup"
echo "   - Management scripts"
echo "   - Backup system" 