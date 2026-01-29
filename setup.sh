#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ensure we are in the script's directory
cd "$(dirname "$0")"

echo -e "${GREEN}🚀 Farm Management System - Complete Setup${NC}"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js is installed${NC}"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Check if MongoDB is installed (optional)
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB is installed${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB is not installed${NC}"
    echo "You'll need MongoDB for the database. Options:"
    echo "1. Install MongoDB locally: https://www.mongodb.com/docs/manual/installation/"
    echo "2. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas"
    echo "3. Use Docker: docker run -d -p 27017:27017 --name farm-mongo mongo:latest"
fi

# Create project structure
echo -e "\n${GREEN}📁 Ensuring project structure...${NC}"
mkdir -p backend/models backend/routes backend/middleware frontend/src/components database/backups

# Setup Backend
echo -e "\n${GREEN}🔧 Setting up Backend...${NC}"
cd backend

# Initialize backend package.json if not exists
if [ ! -f "package.json" ]; then
    npm init -y
    echo -e "${GREEN}✓ Created package.json${NC}"
fi

# Install backend dependencies
echo "Installing backend dependencies..."
npm install express cors mongoose dotenv bcryptjs jsonwebtoken axios
npm install --save-dev nodemon

# Create .env file for backend if not exists
if [ ! -f ".env" ]; then
    cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/farm-management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
EOF
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

cd ..

# Setup Frontend
echo -e "\n${GREEN}🔧 Setting up Frontend...${NC}"
cd frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-date-pickers @date-io/date-fns
npm install axios react-router-dom recharts date-fns @mui/x-date-pickers-pro

# Create environment file if not exists
if [ ! -f ".env" ]; then
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
SKIP_PREFLIGHT_CHECK=true
EOF
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

cd ..

echo -e "\n${GREEN}✅ Setup completed!${NC}"
echo -e "\n${YELLOW}📋 Next steps:${NC}"
echo "1. Start MongoDB: mongod"
echo "2. Run './start.sh' to start the application"
echo "3. Visit http://localhost:3000"

# Make sure start.sh is executable
chmod +x start.sh 2>/dev/null || true
