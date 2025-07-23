#!/bin/bash

# Remove User Script voor VPS
# Ubuntu 24.04 - com.midaweb.be

echo "🗑️ Remove User Script voor VPS"
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
read -p "Enter username to remove: " USERNAME

# Check if user exists
if ! id "$USERNAME" &>/dev/null; then
    print_error "User $USERNAME does not exist!"
    exit 1
fi

# Check if user is currently logged in
if who | grep -q "$USERNAME"; then
    print_warning "User $USERNAME is currently logged in!"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Operation cancelled"
        exit 1
    fi
fi

# Confirm deletion
print_warning "This will permanently delete user $USERNAME and all their files!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Operation cancelled"
    exit 1
fi

print_status "Removing user $USERNAME..."

# Kill all processes owned by the user
pkill -u "$USERNAME" 2>/dev/null || true

# Remove user from groups
usermod -G "" "$USERNAME" 2>/dev/null || true

# Remove user and home directory
userdel -r "$USERNAME"

if [ $? -eq 0 ]; then
    print_success "User $USERNAME removed successfully!"
else
    print_error "Failed to remove user $USERNAME"
    exit 1
fi

# Clean up any remaining references
print_status "Cleaning up..."

# Remove from sudoers if present
sed -i "/^$USERNAME/d" /etc/sudoers 2>/dev/null || true

# Remove from docker group if present
gpasswd -d "$USERNAME" docker 2>/dev/null || true

# Remove from any other groups
for group in $(groups "$USERNAME" 2>/dev/null | cut -d: -f2- | tr ' ' '\n'); do
    gpasswd -d "$USERNAME" "$group" 2>/dev/null || true
done

print_success "User cleanup completed!" 