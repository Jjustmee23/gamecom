#!/bin/bash

# Create User Script voor VPS
# Ubuntu 24.04 - com.midaweb.be

echo "👤 Create User Script voor VPS"
echo "=============================="
echo "VPS: 45.154.238.116"
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

# Get user input
echo "Enter user details:"
read -p "Username: " USERNAME
read -p "Full Name: " FULLNAME
read -s -p "Password: " PASSWORD
echo ""
read -s -p "Confirm Password: " PASSWORD2
echo ""

# Validate password
if [ "$PASSWORD" != "$PASSWORD2" ]; then
    print_error "Passwords do not match!"
    exit 1
fi

if [ ${#PASSWORD} -lt 8 ]; then
    print_error "Password must be at least 8 characters long!"
    exit 1
fi

# Check if user already exists
if id "$USERNAME" &>/dev/null; then
    print_error "User $USERNAME already exists!"
    exit 1
fi

print_status "Creating user $USERNAME..."

# Create user
useradd -m -s /bin/bash -c "$FULLNAME" "$USERNAME"

# Set password
echo "$USERNAME:$PASSWORD" | chpasswd

# Add user to sudo group
usermod -aG sudo "$USERNAME"

# Add user to docker group (if docker is installed)
if command -v docker &> /dev/null; then
    usermod -aG docker "$USERNAME"
    print_success "Added user to docker group"
fi

# Create SSH directory and set permissions
mkdir -p /home/$USERNAME/.ssh
chown $USERNAME:$USERNAME /home/$USERNAME/.ssh
chmod 700 /home/$USERNAME/.ssh

# Generate SSH key for the user
print_status "Generating SSH key for user..."
sudo -u $USERNAME ssh-keygen -t rsa -b 4096 -f /home/$USERNAME/.ssh/id_rsa -N "" -C "$USERNAME@com.midaweb.be"

# Add public key to authorized_keys
sudo -u $USERNAME cat /home/$USERNAME/.ssh/id_rsa.pub >> /home/$USERNAME/.ssh/authorized_keys
chown $USERNAME:$USERNAME /home/$USERNAME/.ssh/authorized_keys
chmod 600 /home/$USERNAME/.ssh/authorized_keys

# Give user access to application directory (if it exists)
if [ -d "/opt/gamecom" ]; then
    usermod -aG gamecom "$USERNAME" 2>/dev/null || usermod -aG root "$USERNAME"
    print_success "Added user to application directory group"
fi

# Create user management scripts
print_status "Creating user management scripts..."

# Create user's bin directory
mkdir -p /home/$USERNAME/bin
chown $USERNAME:$USERNAME /home/$USERNAME/bin

# Create user's management scripts
cat > /home/$USERNAME/bin/status.sh << 'EOF'
#!/bin/bash
echo "=== System Status ==="
echo "User: $(whoami)"
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo ""
echo "=== Docker Status ==="
docker ps 2>/dev/null || echo "Docker not available"
echo ""
echo "=== Application Status ==="
if [ -d "/opt/gamecom" ]; then
    cd /opt/gamecom
    docker compose ps 2>/dev/null || echo "Application not running"
else
    echo "Application directory not found"
fi
EOF

cat > /home/$USERNAME/bin/backup.sh << 'EOF'
#!/bin/bash
if [ -d "/opt/gamecom" ]; then
    cd /opt/gamecom
    ./backup.sh
else
    echo "Application directory not found"
fi
EOF

chmod +x /home/$USERNAME/bin/*.sh
chown -R $USERNAME:$USERNAME /home/$USERNAME/bin

# Add bin directory to PATH
echo 'export PATH="$HOME/bin:$PATH"' >> /home/$USERNAME/.bashrc

print_success "User $USERNAME created successfully!"

# Display user information
echo ""
echo "📋 User Information:"
echo "==================="
echo "Username: $USERNAME"
echo "Full Name: $FULLNAME"
echo "Home Directory: /home/$USERNAME"
echo "Shell: /bin/bash"
echo "Groups: sudo, docker"
echo ""

# Display SSH public key
echo "🔑 SSH Public Key:"
echo "=================="
cat /home/$USERNAME/.ssh/id_rsa.pub
echo "=================="

# Display SSH private key
echo ""
echo "🔑 SSH Private Key (save this securely):"
echo "========================================"
cat /home/$USERNAME/.ssh/id_rsa
echo "========================================"

echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Test SSH connection:"
echo "   ssh $USERNAME@45.154.238.116"
echo ""
echo "2. Test sudo access:"
echo "   sudo whoami"
echo ""
echo "3. Check application access:"
echo "   cd /opt/gamecom"
echo "   ./status.sh"
echo ""
echo "4. Add SSH key to your local machine:"
echo "   ssh-copy-id $USERNAME@45.154.238.116"
echo ""
echo "⚠️  Important:"
echo "   - Save the SSH private key securely"
echo "   - Change the password on first login"
echo "   - Set up SSH key authentication"
echo ""
print_success "User setup completed!" 