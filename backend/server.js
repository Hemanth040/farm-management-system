const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/farm-management')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmer');
const workerRoutes = require('./routes/worker');
const supervisorRoutes = require('./routes/supervisor');
const cropRoutes = require('./routes/crop');
const timelineRoutes = require('./routes/timeline');
const resourcesRoutes = require('./routes/resources');
const financialRoutes = require('./routes/financial');
const cropHealthRoutes = require('./routes/cropHealth');

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/crop-health', cropHealthRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
