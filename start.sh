#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Ensure we are in the script's directory
cd "$(dirname \"$0\")"

echo -e "${GREEN}🚀 Starting Farm Management System${NC}"
echo "========================================"

# Kill existing processes on ports 5000 and 3000
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 2

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB is not running${NC}"
    echo "Please ensure MongoDB is running locally or update .env with a cloud URI."
else
    echo -e "${GREEN}✓ MongoDB is running${NC}"
fi

# Start Backend
echo -e "\n${GREEN}Starting Backend...${NC}"
cd backend
npm start &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is running on http://localhost:5000${NC}"
else
    echo -e "${RED}Backend health check failed. Check logs.${NC}"
fi

# Start Frontend
echo -e "\n${GREEN}Starting Frontend...${NC}"
cd ../frontend
npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo -e "\n${GREEN}✅ All services started!${NC}"
echo -e "\n${YELLOW}Access URLs:${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"

echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"

# Trap Ctrl+C to cleanup
trap "echo -e '\n\n${RED}Stopping services...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT

# Wait
wait