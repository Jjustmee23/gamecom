#!/bin/bash

# User Management Script voor VPS
# Ubuntu 24.04 - com.midaweb.be

echo "👥 User Management Script voor VPS"
echo "=================================="
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

# Function to list users
list_users() {
    echo "📋 Current Users:"
    echo "================"
    echo "Username | Full Name | Groups | Home Directory"
    echo "---------|-----------|--------|----------------"
    
    # Get all users with home directories
    for user in $(cut -d: -f1 /etc/passwd | grep -v "^#" | grep -v "^$"); do
        if [ -d "/home/$user" ]; then
            fullname=$(getent passwd "$user" | cut -d: -f5 | cut -d, -f1)
            groups=$(groups "$user" 2>/dev/null | cut -d: -f2- | tr ' ' ',' | sed 's/,$//')
            home=$(getent passwd "$user" | cut -d: -f6)
            echo "$user | $fullname | $groups | $home"
        fi
    done
    echo ""
}

# Function to show user details
show_user() {
    local username=$1
    
    if ! id "$username" &>/dev/null; then
        print_error "User $username does not exist!"
        return 1
    fi
    
    echo "📋 User Details for $username:"
    echo "=============================="
    echo "Username: $username"
    echo "Full Name: $(getent passwd "$username" | cut -d: -f5 | cut -d, -f1)"
    echo "Home Directory: $(getent passwd "$username" | cut -d: -f6)"
    echo "Shell: $(getent passwd "$username" | cut -d: -f7)"
    echo "UID: $(getent passwd "$username" | cut -d: -f3)"
    echo "GID: $(getent passwd "$username" | cut -d: -f4)"
    echo "Groups: $(groups "$username" 2>/dev/null | cut -d: -f2-)"
    echo "Last Login: $(lastlog -u "$username" 2>/dev/null | tail -n +2 | awk '{print $4, $5, $6, $7}')"
    
    # Check if user is currently logged in
    if who | grep -q "$username"; then
        echo "Status: 🟢 Currently logged in"
    else
        echo "Status: 🔴 Not logged in"
    fi
    
    # Check SSH key
    if [ -f "/home/$username/.ssh/id_rsa.pub" ]; then
        echo "SSH Key: ✅ Present"
    else
        echo "SSH Key: ❌ Not found"
    fi
    
    echo ""
}

# Function to change user password
change_password() {
    local username=$1
    
    if ! id "$username" &>/dev/null; then
        print_error "User $username does not exist!"
        return 1
    fi
    
    print_status "Changing password for user $username..."
    passwd "$username"
    
    if [ $? -eq 0 ]; then
        print_success "Password changed successfully!"
    else
        print_error "Failed to change password"
    fi
}

# Function to add user to group
add_to_group() {
    local username=$1
    local group=$2
    
    if ! id "$username" &>/dev/null; then
        print_error "User $username does not exist!"
        return 1
    fi
    
    if ! getent group "$group" &>/dev/null; then
        print_error "Group $group does not exist!"
        return 1
    fi
    
    print_status "Adding user $username to group $group..."
    usermod -aG "$group" "$username"
    
    if [ $? -eq 0 ]; then
        print_success "User added to group successfully!"
    else
        print_error "Failed to add user to group"
    fi
}

# Function to remove user from group
remove_from_group() {
    local username=$1
    local group=$2
    
    if ! id "$username" &>/dev/null; then
        print_error "User $username does not exist!"
        return 1
    fi
    
    if ! getent group "$group" &>/dev/null; then
        print_error "Group $group does not exist!"
        return 1
    fi
    
    print_status "Removing user $username from group $group..."
    gpasswd -d "$username" "$group"
    
    if [ $? -eq 0 ]; then
        print_success "User removed from group successfully!"
    else
        print_error "Failed to remove user from group"
    fi
}

# Main menu
while true; do
    echo ""
    echo "🔧 User Management Menu:"
    echo "========================"
    echo "1. List all users"
    echo "2. Show user details"
    echo "3. Create new user"
    echo "4. Remove user"
    echo "5. Change user password"
    echo "6. Add user to group"
    echo "7. Remove user from group"
    echo "8. Exit"
    echo ""
    read -p "Choose an option (1-8): " choice
    
    case $choice in
        1)
            list_users
            ;;
        2)
            read -p "Enter username: " username
            show_user "$username"
            ;;
        3)
            print_status "Running user creation script..."
            ./create-user.sh
            ;;
        4)
            read -p "Enter username to remove: " username
            print_warning "This will permanently delete the user and all their files!"
            read -p "Are you sure? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                ./remove-user.sh
            fi
            ;;
        5)
            read -p "Enter username: " username
            change_password "$username"
            ;;
        6)
            read -p "Enter username: " username
            read -p "Enter group name: " group
            add_to_group "$username" "$group"
            ;;
        7)
            read -p "Enter username: " username
            read -p "Enter group name: " group
            remove_from_group "$username" "$group"
            ;;
        8)
            print_success "Exiting user management..."
            exit 0
            ;;
        *)
            print_error "Invalid option. Please choose 1-8."
            ;;
    esac
    
    read -p "Press Enter to continue..."
done 