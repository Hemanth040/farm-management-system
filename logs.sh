#!/bin/bash

# Color codes
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 Farm Management System - Management Console${NC}"
echo "============================================="

echo -e "\n${YELLOW}Select an option:${NC}"
echo "1. View System Status"
echo "2. Check Backend Health"
echo "3. Restart Services"
echo "4. View Running Processes"
echo "0. Exit\n"

read -p "Enter choice [0-4]: " choice

case $choice in
    1)
        echo -e "\n${GREEN}📊 System Status:${NC}"
        echo "-------------------"
        
        # Check MongoDB
        if pgrep -f mongod > /dev/null; then
            echo -e "MongoDB: ${GREEN}✓ Running${NC}"
        else
            echo -e "MongoDB: ${RED}✗ Stopped (Check your local installation)${NC}"
        fi
        
        # Check Backend
        if lsof -ti:5000 > /dev/null; then
            echo -e "Backend (Port 5000): ${GREEN}✓ Running${NC}"
        else
            echo -e "Backend (Port 5000): ${RED}✗ Stopped${NC}"
        fi
        
        # Check Frontend
        if lsof -ti:3000 > /dev/null; then
            echo -e "Frontend (Port 3000): ${GREEN}✓ Running${NC}"
        else
            echo -e "Frontend (Port 3000): ${RED}✗ Stopped${NC}"
        fi
        ;;
    2)
        echo -e "\n${GREEN}📁 Backend Health Check:${NC}"
        curl -s http://localhost:5000/api/health || echo -e "${RED}Backend is unreachable${NC}"
        ;;
    3)
        echo -e "\n${YELLOW}🔄 Restarting services...${NC}"
        ./stop.sh
        sleep 2
        ./start.sh
        ;;
    4)
        echo -e "\n${YELLOW}⚡ Running Project Processes:${NC}"
        ps aux | grep -E "(node|mongod)" | grep -v grep
        ;;
    0)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice!${NC}"
        ;;
esac
