#!/bin/bash

# GameCom Monitoring Dashboard
# Real-time monitoring van de applicatie

# Configuratie
APP_NAME="gamecom"
APP_DIR="/opt/$APP_NAME"
DOMAIN="gamecom.midaweb.be"

# Kleuren
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Clear screen
clear

# Header
echo -e "${BLUE}"
echo "=========================================="
echo "        GAMECOM MONITORING DASHBOARD"
echo "=========================================="
echo -e "${NC}"

# Functie om status te tonen
show_status() {
    echo -e "${CYAN}🕐 Laatste update: $(date)${NC}"
    echo ""
    
    # Container status
    echo -e "${PURPLE}🐳 CONTAINER STATUS:${NC}"
    echo "----------------------------------------"
    cd $APP_DIR
    docker-compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    # Systeem resources
    echo -e "${PURPLE}💻 SYSTEEM RESOURCES:${NC}"
    echo "----------------------------------------"
    echo -e "CPU Usage: ${YELLOW}$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%${NC}"
    echo -e "Memory Usage: ${YELLOW}$(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')${NC}"
    echo -e "Disk Usage: ${YELLOW}$(df -h / | awk 'NR==2 {print $5}')${NC}"
    echo ""
    
    # Network status
    echo -e "${PURPLE}🌐 NETWORK STATUS:${NC}"
    echo "----------------------------------------"
    echo -e "Domain: ${GREEN}$DOMAIN${NC}"
    echo -e "HTTP Status: ${GREEN}$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN)${NC}"
    echo -e "HTTPS Status: ${GREEN}$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)${NC}"
    echo ""
    
    # SSL Certificate
    echo -e "${PURPLE}🔒 SSL CERTIFICATE:${NC}"
    echo "----------------------------------------"
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        EXPIRY=$(openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -enddate -noout | cut -d= -f2)
        echo -e "Expires: ${GREEN}$EXPIRY${NC}"
        
        # Check if certificate expires within 30 days
        EXPIRY_DATE=$(date -d "$EXPIRY" +%s)
        CURRENT_DATE=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_DATE - $CURRENT_DATE) / 86400 ))
        
        if [ $DAYS_LEFT -lt 30 ]; then
            echo -e "⚠️  Certificate expires in ${RED}$DAYS_LEFT days${NC}"
        else
            echo -e "✅ Certificate valid for ${GREEN}$DAYS_LEFT days${NC}"
        fi
    else
        echo -e "${RED}SSL certificate not found${NC}"
    fi
    echo ""
    
    # Application logs (laatste 5 regels)
    echo -e "${PURPLE}📋 RECENT LOGS:${NC}"
    echo "----------------------------------------"
    docker-compose -f docker-compose.prod.yml logs --tail=5 --no-color
    echo ""
    
    # Database status
    echo -e "${PURPLE}🗄️ DATABASE STATUS:${NC}"
    echo "----------------------------------------"
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U gamecom > /dev/null 2>&1; then
        echo -e "PostgreSQL: ${GREEN}Online${NC}"
        
        # Database grootte
        DB_SIZE=$(docker-compose -f docker-compose.prod.yml exec -T postgres psql -U gamecom -d gamecom -t -c "SELECT pg_size_pretty(pg_database_size('gamecom'));" | xargs)
        echo -e "Database Size: ${YELLOW}$DB_SIZE${NC}"
        
        # Aantal tabellen
        TABLE_COUNT=$(docker-compose -f docker-compose.prod.yml exec -T postgres psql -U gamecom -d gamecom -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
        echo -e "Tables: ${YELLOW}$TABLE_COUNT${NC}"
    else
        echo -e "PostgreSQL: ${RED}Offline${NC}"
    fi
    echo ""
    
    # Redis status
    echo -e "${PURPLE}🔴 REDIS STATUS:${NC}"
    echo "----------------------------------------"
    if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "Redis: ${GREEN}Online${NC}"
        
        # Redis info
        REDIS_INFO=$(docker-compose -f docker-compose.prod.yml exec -T redis redis-cli info memory | grep "used_memory_human" | cut -d: -f2)
        echo -e "Memory Usage: ${YELLOW}$REDIS_INFO${NC}"
    else
        echo -e "Redis: ${RED}Offline${NC}"
    fi
    echo ""
    
    # Backup status
    echo -e "${PURPLE}💾 BACKUP STATUS:${NC}"
    echo "----------------------------------------"
    BACKUP_DIR="/opt/backups/$APP_NAME"
    if [ -d "$BACKUP_DIR" ]; then
        LATEST_BACKUP=$(ls -t $BACKUP_DIR/*.tar.gz 2>/dev/null | head -1)
        if [ -n "$LATEST_BACKUP" ]; then
            BACKUP_DATE=$(stat -c %y "$LATEST_BACKUP" | cut -d' ' -f1)
            BACKUP_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
            echo -e "Latest Backup: ${GREEN}$BACKUP_DATE${NC}"
            echo -e "Backup Size: ${YELLOW}$BACKUP_SIZE${NC}"
        else
            echo -e "${RED}No backups found${NC}"
        fi
    else
        echo -e "${RED}Backup directory not found${NC}"
    fi
    echo ""
    
    # Service status
    echo -e "${PURPLE}🔧 SERVICE STATUS:${NC}"
    echo "----------------------------------------"
    echo -e "Docker: ${GREEN}$(systemctl is-active docker)${NC}"
    echo -e "Nginx: ${GREEN}$(systemctl is-active nginx)${NC}"
    echo -e "Firewall: ${GREEN}$(ufw status | grep "Status" | cut -d' ' -f2)${NC}"
    echo ""
}

# Functie om real-time monitoring te starten
start_monitoring() {
    echo -e "${GREEN}🚀 Real-time monitoring gestart (Ctrl+C om te stoppen)${NC}"
    echo ""
    
    while true; do
        show_status
        sleep 30
        clear
        echo -e "${BLUE}"
        echo "=========================================="
        echo "        GAMECOM MONITORING DASHBOARD"
        echo "=========================================="
        echo -e "${NC}"
    done
}

# Functie om logs te bekijken
show_logs() {
    echo -e "${PURPLE}📋 LOGS VIEWER:${NC}"
    echo "----------------------------------------"
    echo "1. Backend logs"
    echo "2. Frontend logs"
    echo "3. Database logs"
    echo "4. Nginx logs"
    echo "5. Alle logs"
    echo "0. Terug"
    echo ""
    read -p "Kies een optie: " choice
    
    case $choice in
        1)
            docker-compose -f $APP_DIR/docker-compose.prod.yml logs -f backend
            ;;
        2)
            docker-compose -f $APP_DIR/docker-compose.prod.yml logs -f frontend
            ;;
        3)
            docker-compose -f $APP_DIR/docker-compose.prod.yml logs -f postgres
            ;;
        4)
            journalctl -u nginx -f
            ;;
        5)
            docker-compose -f $APP_DIR/docker-compose.prod.yml logs -f
            ;;
        0)
            return
            ;;
        *)
            echo "Ongeldige optie"
            ;;
    esac
}

# Functie om applicatie te beheren
manage_app() {
    echo -e "${PURPLE}🔧 APPLICATION MANAGEMENT:${NC}"
    echo "----------------------------------------"
    echo "1. Start applicatie"
    echo "2. Stop applicatie"
    echo "3. Restart applicatie"
    echo "4. Rebuild containers"
    echo "5. Backup maken"
    echo "6. SSL certificaat vernieuwen"
    echo "0. Terug"
    echo ""
    read -p "Kies een optie: " choice
    
    case $choice in
        1)
            echo "🚀 Applicatie starten..."
            cd $APP_DIR
            docker-compose -f docker-compose.prod.yml up -d
            ;;
        2)
            echo "🛑 Applicatie stoppen..."
            cd $APP_DIR
            docker-compose -f docker-compose.prod.yml down
            ;;
        3)
            echo "🔄 Applicatie herstarten..."
            cd $APP_DIR
            docker-compose -f docker-compose.prod.yml restart
            ;;
        4)
            echo "🔨 Containers rebuilden..."
            cd $APP_DIR
            docker-compose -f docker-compose.prod.yml build --no-cache
            docker-compose -f docker-compose.prod.yml up -d
            ;;
        5)
            echo "💾 Backup maken..."
            /usr/local/bin/backup-$APP_NAME
            ;;
        6)
            echo "🔒 SSL certificaat vernieuwen..."
            certbot renew
            systemctl reload nginx
            ;;
        0)
            return
            ;;
        *)
            echo "Ongeldige optie"
            ;;
    esac
    
    echo "✅ Actie voltooid"
    sleep 2
}

# Hoofdmenu
while true; do
    clear
    echo -e "${BLUE}"
    echo "=========================================="
    echo "        GAMECOM MONITORING DASHBOARD"
    echo "=========================================="
    echo -e "${NC}"
    
    show_status
    
    echo -e "${PURPLE}📋 MENU:${NC}"
    echo "----------------------------------------"
    echo "1. Real-time monitoring starten"
    echo "2. Logs bekijken"
    echo "3. Applicatie beheren"
    echo "4. Status vernieuwen"
    echo "5. Systeem informatie"
    echo "0. Afsluiten"
    echo ""
    read -p "Kies een optie: " choice
    
    case $choice in
        1)
            start_monitoring
            ;;
        2)
            show_logs
            ;;
        3)
            manage_app
            ;;
        4)
            # Status wordt automatisch vernieuwd
            ;;
        5)
            echo -e "${PURPLE}💻 SYSTEEM INFORMATIE:${NC}"
            echo "----------------------------------------"
            echo -e "OS: ${YELLOW}$(lsb_release -d | cut -f2)${NC}"
            echo -e "Kernel: ${YELLOW}$(uname -r)${NC}"
            echo -e "Uptime: ${YELLOW}$(uptime -p)${NC}"
            echo -e "Load Average: ${YELLOW}$(uptime | awk -F'load average:' '{print $2}')${NC}"
            echo -e "Docker Version: ${YELLOW}$(docker --version)${NC}"
            echo -e "Nginx Version: ${YELLOW}$(nginx -v 2>&1)${NC}"
            echo ""
            read -p "Druk op Enter om door te gaan..."
            ;;
        0)
            echo "👋 Afsluiten..."
            exit 0
            ;;
        *)
            echo "Ongeldige optie"
            sleep 1
            ;;
    esac
done 