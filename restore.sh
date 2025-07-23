#!/bin/bash

# GameCom Restore Script
# Voor het herstellen van backups

set -e

# Kleuren voor output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuratie
APP_NAME="gamecom"
APP_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/backups/$APP_NAME"

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check of script als root wordt uitgevoerd
if [[ $EUID -ne 0 ]]; then
   error "Dit script moet als root worden uitgevoerd"
fi

log "🔄 GameCom Restore Script gestart"

# Backup bestand selecteren
if [ -z "$1" ]; then
    log "📋 Beschikbare backups:"
    ls -la $BACKUP_DIR/*.tar.gz 2>/dev/null || error "Geen backups gevonden in $BACKUP_DIR"
    
    echo -e "${BLUE}Gebruik: $0 <backup_file.tar.gz>${NC}"
    echo "Bijvoorbeeld: $0 backup_20241201_143022.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

if [ ! -f "$BACKUP_PATH" ]; then
    error "Backup bestand niet gevonden: $BACKUP_PATH"
fi

log "📦 Backup herstellen: $BACKUP_FILE"

# Bevestiging vragen
read -p "Weet je zeker dat je de applicatie wilt herstellen? Dit zal alle huidige data vervangen! (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Restore geannuleerd"
    exit 0
fi

# Applicatie stoppen
log "🛑 Applicatie stoppen..."
cd $APP_DIR
docker-compose -f docker-compose.prod.yml down

# Backup uitpakken
log "📦 Backup uitpakken..."
cd $APP_DIR
tar -xzf "$BACKUP_PATH"

# Database herstellen
if [ -f "backup.sql" ]; then
    log "🗄️ Database herstellen..."
    docker-compose -f docker-compose.prod.yml up -d postgres
    sleep 10
    
    # Database legen en herstellen
    docker-compose -f docker-compose.prod.yml exec -T postgres psql -U gamecom -d gamecom -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    docker-compose -f docker-compose.prod.yml exec -T postgres psql -U gamecom -d gamecom < backup.sql
    
    # Cleanup
    rm -f backup.sql
    log "✅ Database hersteld"
else
    warn "⚠️ Geen database backup gevonden"
fi

# Applicatie herstarten
log "🚀 Applicatie herstarten..."
docker-compose -f docker-compose.prod.yml up -d

# Wachten tot containers gestart zijn
log "⏳ Wachten tot containers gestart zijn..."
sleep 30

# Health check
log "🏥 Health check uitvoeren..."
if curl -s -f https://gamecom.midaweb.be/health > /dev/null; then
    log "✅ Restore succesvol! Applicatie is weer online"
else
    warn "⚠️ Health check gefaald, controleer de logs"
fi

log "✅ Restore voltooid!" 