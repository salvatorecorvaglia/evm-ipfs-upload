const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const uploadRoutes = require('./routes/upload');
const pinataRoutes = require('./routes/pinata');

// Load environment variables from root .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { errorHandler } = require('./middleware/errorHandler');
const { requestId, requestLogger } = require('./middleware/requestLogger');

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

// Request ID and Logger
app.use(requestId);
app.use(requestLogger);

// Middleware
app.use(express.json());

// Morgan logging configuration
if (process.env.NODE_ENV === 'production') {
    // In production, log only errors
    app.use(morgan('combined', {
        skip: (req, res) => res.statusCode < 400
    }));
} else {
    // In development, log all requests
    app.use(morgan('dev'));
}

// Health check route with enhanced details
app.get('/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const memoryUsage = process.memoryUsage();

    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        database: {
            status: dbStatus,
            name: mongoose.connection.name || 'N/A'
        },
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        memory: {
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
        }
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
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// Use centralized error handling middleware
app.use(errorHandler);


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

