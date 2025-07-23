# 👥 User Management voor VPS

## 📋 Overzicht
Complete user management systeem voor GameCom VPS met automatische SSH key generatie en permissions.

### 🎯 Features
- **Gebruiker aanmaken** met SSH keys
- **Gebruiker verwijderen** met cleanup
- **Password management** 
- **Group management** (sudo, docker, etc.)
- **SSH key management**
- **Application access** configuratie

---

## 🚀 Quick Start

### 1. Download Scripts
```bash
# Op je VPS
wget https://raw.githubusercontent.com/Jjustmee23/gamecom/main/create-user.sh
wget https://raw.githubusercontent.com/Jjustmee23/gamecom/main/remove-user.sh
wget https://raw.githubusercontent.com/Jjustmee23/gamecom/main/manage-users.sh

# Maak uitvoerbaar
chmod +x create-user.sh remove-user.sh manage-users.sh
```

### 2. Create User
```bash
# Run als root
sudo ./create-user.sh

# Of gebruik het management menu
sudo ./manage-users.sh
```

### 3. Test User
```bash
# SSH naar nieuwe gebruiker
ssh newuser@45.154.238.116

# Test sudo access
sudo whoami

# Check application access
cd /opt/gamecom
./status.sh
```

---

## 🔧 User Creation Process

### Wat Het Script Doet:
1. **Gebruiker aanmaken** met home directory
2. **Password instellen** (minimaal 8 karakters)
3. **SSH key genereren** (RSA 4096-bit)
4. **Groups toevoegen** (sudo, docker)
5. **Application access** configureren
6. **Management scripts** aanmaken

### Automatische Setup:
```bash
# Gebruiker krijgt automatisch:
- Home directory: /home/username
- SSH key: /home/username/.ssh/id_rsa
- Public key: /home/username/.ssh/id_rsa.pub
- Sudo access
- Docker access
- Application directory access
- Management scripts in ~/bin/
```

---

## 🛠️ Management Commands

### 1. Create User
```bash
sudo ./create-user.sh
```

**Input vereist:**
- Username
- Full Name
- Password (2x voor bevestiging)

**Output:**
- SSH private key (bewaar veilig)
- SSH public key
- Setup instructies

### 2. Remove User
```bash
sudo ./remove-user.sh
```

**Input vereist:**
- Username
- Bevestiging (y/N)

**Wat het doet:**
- Kill alle processen van gebruiker
- Remove uit alle groups
- Delete user en home directory
- Cleanup sudoers en andere references

### 3. User Management Menu
```bash
sudo ./manage-users.sh
```

**Menu opties:**
1. **List all users** - Toon alle gebruikers
2. **Show user details** - Details van specifieke gebruiker
3. **Create new user** - Nieuwe gebruiker aanmaken
4. **Remove user** - Gebruiker verwijderen
5. **Change user password** - Password wijzigen
6. **Add user to group** - Gebruiker aan group toevoegen
7. **Remove user from group** - Gebruiker uit group verwijderen
8. **Exit** - Menu verlaten

---

## 🔑 SSH Key Management

### Automatische SSH Key Setup
```bash
# Elke gebruiker krijgt automatisch:
/home/username/.ssh/id_rsa          # Private key
/home/username/.ssh/id_rsa.pub      # Public key
/home/username/.ssh/authorized_keys # Public key toegevoegd
```

### SSH Key Gebruik
```bash
# Voor GitHub Actions deployment
# Kopieer private key naar GitHub Secrets als VPS_SSH_KEY

# Voor lokale SSH access
# Voeg public key toe aan je lokale ~/.ssh/authorized_keys
```

### SSH Key Backup
```bash
# Backup SSH keys
sudo cp /home/username/.ssh/id_rsa /backup/username_private_key
sudo cp /home/username/.ssh/id_rsa.pub /backup/username_public_key

# Restore SSH keys
sudo cp /backup/username_private_key /home/username/.ssh/id_rsa
sudo cp /backup/username_public_key /home/username/.ssh/id_rsa.pub
sudo chown username:username /home/username/.ssh/id_rsa*
sudo chmod 600 /home/username/.ssh/id_rsa
sudo chmod 644 /home/username/.ssh/id_rsa.pub
```

---

## 🔐 Security Features

### Password Requirements
- **Minimaal 8 karakters**
- **Bevestiging vereist**
- **Automatische password expiry** (optioneel)

### SSH Security
- **RSA 4096-bit keys**
- **Secure permissions** (600 voor private, 644 voor public)
- **Authorized_keys setup**
- **No password SSH** mogelijk

### Group Permissions
```bash
# Standaard groups per gebruiker:
- username (primary group)
- sudo (administrative access)
- docker (container management)
- gamecom (application access)
```

---

## 📊 User Monitoring

### Check User Status
```bash
# List alle gebruikers
sudo ./manage-users.sh
# Kies optie 1: List all users

# Of handmatig
cut -d: -f1 /etc/passwd | grep -v "^#" | grep -v "^$"
```

### User Details
```bash
# Show user details
sudo ./manage-users.sh
# Kies optie 2: Show user details

# Of handmatig
id username
groups username
lastlog -u username
who | grep username
```

### SSH Key Status
```bash
# Check SSH key
ls -la /home/username/.ssh/

# Check authorized_keys
cat /home/username/.ssh/authorized_keys

# Test SSH connection
ssh username@45.154.238.116
```

---

## 🔍 Troubleshooting

### Common Issues

#### User Cannot SSH
```bash
# Check SSH key permissions
sudo chmod 700 /home/username/.ssh
sudo chmod 600 /home/username/.ssh/id_rsa
sudo chmod 644 /home/username/.ssh/id_rsa.pub
sudo chmod 600 /home/username/.ssh/authorized_keys

# Check ownership
sudo chown -R username:username /home/username/.ssh
```

#### User Cannot Use Sudo
```bash
# Add user to sudo group
sudo usermod -aG sudo username

# Check sudoers file
sudo visudo

# Test sudo access
sudo -u username sudo whoami
```

#### User Cannot Access Docker
```bash
# Add user to docker group
sudo usermod -aG docker username

# Restart Docker service
sudo systemctl restart docker

# Test Docker access
sudo -u username docker ps
```

#### User Cannot Access Application
```bash
# Check application directory permissions
ls -la /opt/gamecom

# Add user to application group
sudo usermod -aG gamecom username

# Or change ownership
sudo chown -R username:username /opt/gamecom
```

### Debug Commands
```bash
# Check user existence
id username

# Check user groups
groups username

# Check user home directory
ls -la /home/username

# Check SSH configuration
sudo -u username ssh -T localhost

# Check sudo access
sudo -u username sudo -l

# Check Docker access
sudo -u username docker info
```

---

## 📋 User Templates

### Standard User Template
```bash
# Gebruiker met standaard rechten
Username: username
Full Name: User Full Name
Groups: username, sudo, docker
Home: /home/username
Shell: /bin/bash
SSH: Enabled
Sudo: Enabled
Docker: Enabled
Application: Read-only access
```

### Admin User Template
```bash
# Gebruiker met admin rechten
Username: admin
Full Name: Administrator
Groups: admin, sudo, docker, gamecom
Home: /home/admin
Shell: /bin/bash
SSH: Enabled
Sudo: Enabled
Docker: Enabled
Application: Full access
```

### Developer User Template
```bash
# Gebruiker voor development
Username: developer
Full Name: Developer Name
Groups: developer, sudo, docker, gamecom
Home: /home/developer
Shell: /bin/bash
SSH: Enabled
Sudo: Enabled
Docker: Enabled
Application: Full access
Git: Configured
```

---

## 🎯 Best Practices

### User Creation
1. **Gebruik beschrijvende usernames** (niet admin, user, etc.)
2. **Stel sterke passwords in** (minimaal 12 karakters)
3. **Geef minimale rechten** (principle of least privilege)
4. **Documenteer user purposes**
5. **Backup SSH keys** veilig

### User Management
1. **Review users regelmatig** (maandelijks)
2. **Remove inactive users** na 90 dagen
3. **Rotate SSH keys** jaarlijks
4. **Monitor sudo usage**
5. **Log user activities**

### Security
1. **Disable password SSH** (alleen key-based)
2. **Use strong SSH keys** (RSA 4096-bit of Ed25519)
3. **Limit sudo access** waar mogelijk
4. **Monitor failed login attempts**
5. **Regular security updates**

---

## 📞 Support

### Quick Commands
```bash
# Create user
sudo ./create-user.sh

# Remove user
sudo ./remove-user.sh

# Manage users
sudo ./manage-users.sh

# Check all users
cut -d: -f1 /etc/passwd | grep -v "^#" | grep -v "^$"
```

### Contact Information
- **VPS**: 45.154.238.116
- **Domain**: com.midaweb.be
- **Repository**: https://github.com/Jjustmee23/gamecom

---

## ✅ Verification Checklist

Na user creation, controleer:

- [ ] **User exists** - `id username` werkt
- [ ] **Home directory** - `/home/username` bestaat
- [ ] **SSH key** - `/home/username/.ssh/id_rsa` bestaat
- [ ] **Sudo access** - `sudo whoami` werkt
- [ ] **Docker access** - `docker ps` werkt
- [ ] **Application access** - Kan `/opt/gamecom` benaderen
- [ ] **SSH connection** - Kan SSH'en naar VPS
- [ ] **Password** - Kan inloggen met password
- [ ] **Groups** - Staat in juiste groups

---

## 🎉 Resultaat

Na setup heb je:

✅ **Complete user management** systeem  
✅ **Automatische SSH key** generatie  
✅ **Secure permissions** en access control  
✅ **Easy user creation** en removal  
✅ **Monitoring** en troubleshooting tools  
✅ **Best practices** implementatie  

**👥 Je VPS heeft nu een professioneel user management systeem!** 