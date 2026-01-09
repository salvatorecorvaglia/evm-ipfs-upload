const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const uploadRoutes = require('./routes/upload');
const pinataRoutes = require('./routes/pinata');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Rate Limiting
const windowMs = process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000; // 15 minutes
const maxRequests = process.env.RATE_LIMIT_MAX_REQUESTS || 100;

const limiter = rateLimit({
    windowMs: parseInt(windowMs),
    max: parseInt(maxRequests),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Log HTTP requests

// Health check route with database status
app.get('/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
        environment: process.env.NODE_ENV || 'development'
    };

    if (dbStatus === 'connected') {
        res.status(200).json(health);
    } else {
        res.status(503).json({ ...health, status: 'degraded' });
    }
});

// Routes
app.use('/api/upload/ipfs', pinataRoutes); // New Pinata upload endpoint
app.use('/api/upload', uploadRoutes);       // MongoDB CID storage endpoint

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);

    // Handle CORS errors
    if (err.message.includes('CORS')) {
        return res.status(403).json({ message: err.message });
    }

    res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 5001;
if (!process.env.PORT) {
    console.warn('Warning: PORT is not defined in environment variables, using default port 5001');
}

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

