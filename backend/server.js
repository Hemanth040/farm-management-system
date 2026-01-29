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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/farm-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Import Routes
const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmer');
const supervisorRoutes = require('./routes/supervisor');
const workerRoutes = require('./routes/worker');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/crops', require('./routes/crop'));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Farm Management System API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
