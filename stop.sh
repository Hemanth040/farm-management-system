#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}🛑 Stopping Farm Management System${NC}"
echo "======================================"

# Function to kill process by port
kill_port() {
    local port=$1
    local service=$2
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        echo -n "Stopping $service (Port $port, PID: $pid)... "
        kill -9 $pid 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗${NC}"
        fi
    else
        echo "$service is not running on port $port"
    fi
}

# Kill services
kill_port 5000 "Backend Server"
kill_port 3000 "Frontend Server"

# Clean up any orphaned node processes related to the project
echo -n "Cleaning up remaining project processes... "
pkill -f "node.*(backend|frontend)" 2>/dev/null
echo -e "${GREEN}✓${NC}"

echo -e "\n${GREEN}✅ All services stopped successfully!${NC}"

