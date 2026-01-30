# Farm Management System

A full-stack web application for managing agricultural operations, built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- 🌾 **Field Management** - Track farm fields and their details
- 🌱 **Crop Health Monitoring** - Monitor and analyze crop conditions
- 👥 **Worker Management** - Manage farm workers and assignments
- 💰 **Financial Tracking** - Monitor expenses and revenue
- 📊 **Reports & Analytics** - Generate detailed reports
- 🔐 **User Authentication** - Secure login with JWT
- ⚠️ **Warnings & Reminders** - Automated alerts and notifications
- 🌿 **Weed Management** - Track and manage weed issues

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing

### Frontend
- **React** - UI library
- **Material UI** - Component library
- **Axios** - HTTP client
- **React Router** - Navigation
- **Recharts** - Data visualization

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   ```bash
   node --version
   npm --version
   ```

2. **MongoDB** (one of the following options):
   - Local installation: [Install MongoDB](https://www.mongodb.com/docs/manual/installation/)
   - MongoDB Atlas (Cloud): [Get Started](https://www.mongodb.com/cloud/atlas)
   - Docker: `docker run -d -p 27017:27017 --name farm-mongo mongo:latest`

3. **Git** (for cloning and pushing to repository)
   ```bash
   git --version
   ```

## Quick Start (Recommended)

The easiest way to get started is using the provided scripts:

### Step 1: Clone the Repository
```bash
git clone https://github.com/Hemanth040/farm-management-system.git
cd farm-management-system
```

### Step 2: Run Setup Script
This will install all dependencies and create necessary configuration files:
```bash
./setup.sh
```

### Step 3: Configure Environment
Edit the `.env` file in the `backend` directory if needed:
```bash
# Backend/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/farm-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Step 4: Start the Application
```bash
./start.sh
```

This will:
- Clean up any existing processes on ports 5000 and 3000
- Start the backend server on http://localhost:5000
- Start the frontend application on http://localhost:3000

### Step 5: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

Press `Ctrl+C` to stop all services.

## Manual Installation

If you prefer to set up manually:

### 1. Install Backend Dependencies
```bash
cd backend
npm install express cors mongoose dotenv bcryptjs jsonwebtoken axios
npm install --save-dev nodemon
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-date-pickers @date-io/date-fns
npm install axios react-router-dom recharts date-fns
```

### 3. Create Environment Files

Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/farm-management
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

Frontend (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
SKIP_PREFLIGHT_CHECK=true
```

### 4. Start Services
```bash
# Terminal 1 - Start MongoDB
mongod

# Terminal 2 - Start Backend
cd backend
npm start

# Terminal 3 - Start Frontend
cd frontend
npm start
```

## Available Scripts

### `setup.sh`
Complete setup script that:
- Checks prerequisites (Node.js, MongoDB)
- Installs all dependencies
- Creates project structure
- Sets up environment files

### `start.sh`
Development start script that:
- Kills existing processes on ports 5000/3000
- Checks MongoDB status
- Starts backend and frontend concurrently
- Waits for Ctrl+C to stop

### `start-app.sh`
Quick start script that:
- Installs dependencies if missing
- Starts both services
- Auto-detects dev vs production mode

### `stop.sh`
Clean shutdown script that:
- Gracefully stops all running services
- Kills processes on ports 5000 and 3000

### `logs.sh`
View running service logs:
```bash
./logs.sh
```

## Project Structure

```
farm-management-system/
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── server.js        # Entry point
│   ├── package.json     # Backend dependencies
│   └── .env            # Backend configuration
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   └── ...         # React app files
│   ├── package.json     # Frontend dependencies
│   └── .env            # Frontend configuration
├── database/
│   ├── schema.sql       # Database schema
│   └── backups/         # Backup directory
├── setup.sh            # Setup script
├── start.sh            # Start script
├── start-app.sh        # Quick start script
├── stop.sh             # Stop script
└── logs.sh             # Log viewer script
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Fields
- `GET /api/fields` - Get all fields
- `POST /api/fields` - Create new field
- `PUT /api/fields/:id` - Update field
- `DELETE /api/fields/:id` - Delete field

### Crops
- `GET /api/crops` - Get all crops
- `POST /api/crops` - Add new crop

### Workers
- `GET /api/workers` - Get all workers
- `POST /api/workers` - Add worker

### Financial
- `GET /api/financial` - Get financial data
- `POST /api/financial` - Add transaction

### Reports
- `GET /api/reports` - Generate reports

### Health Check
- `GET /api/health` - Check server status

## Common Issues

### MongoDB Connection Failed
**Problem**: `MongoNetworkError: failed to connect to server`

**Solutions**:
1. Ensure MongoDB is running: `mongod`
2. Check connection string in `backend/.env`
3. For MongoDB Atlas, whitelist your IP address

### Port Already in Use
**Problem**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
1. Run `./stop.sh` to kill existing processes
2. Or manually: `lsof -ti:5000 | xargs kill -9`

### CORS Errors
**Problem**: Frontend cannot connect to backend

**Solutions**:
1. Check `CORS_ORIGIN` in backend/.env matches frontend URL
2. Ensure backend is running before frontend

### Permission Denied on Scripts
**Problem**: `Permission denied` when running scripts

**Solutions**:
```bash
chmod +x setup.sh start.sh stop.sh logs.sh
```

## Development

### Running in Development Mode
```bash
# Backend with auto-reload
cd backend
npm run dev

# Frontend with hot reload
cd frontend
npm start
```

### Running Tests
```bash
cd backend
npm test
```

### Database Management
```bash
# Backup database
mongodump --db farm-management --out database/backups/

# Restore database
mongorestore --db farm-management database/backups/farm-management/
```

## Deployment

### Production Build
```bash
# Build frontend for production
cd frontend
npm run build

# Start backend in production mode
cd backend
NODE_ENV=production npm start
```

### Environment Variables for Production
```env
# backend/.env
PORT=5000
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-production-secret
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature-name`
6. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues or questions:
- Open an issue on GitHub
- Check the logs with `./logs.sh`
- Review the API documentation at `http://localhost:5000/api`

## Authors

- **Hemanth040** - Initial work

---

Made with ❤️ for farmers worldwide 🌾
