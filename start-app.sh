#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit
}

# Trap Ctrl+C
trap cleanup SIGINT

# Ensure we are in the script's directory
cd "$(dirname "$0")"

echo "==============================================="
echo "🌾 Starting Farm Management System Quick Start"
echo "==============================================="

# Backend Setup & Start
echo "🔧 [Backend] Checking configuration..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 [Backend] Installing dependencies (this may take a minute)..."
    npm install --silent
fi

echo "🚀 [Backend] Starting server on port 5000..."
# Prefer 'dev' script if available (usually runs nodemon), otherwise 'start'
if grep -q "\"dev\":" package.json; then
    npm run dev &
else
    npm start &
fi
BACKEND_PID=$!
cd ..

# Frontend Setup & Start
echo "🎨 [Frontend] Checking configuration..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 [Frontend] Installing dependencies (this may take a minute)..."
    npm install --silent
fi

echo "🚀 [Frontend] Starting React app on port 3000..."
# BROWSER=none prevents auto-opening if desired, remove if you want it to pop up
npm start &
FRONTEND_PID=$!
cd ..

echo "==============================================="
echo "✅ System Started Successfully!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "==============================================="
echo "📝 Logs will appear below."
echo "⌨️  Press Ctrl+C to stop all servers."
echo "==============================================="

# Wait for processes
wait
