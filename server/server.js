const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const uploadRoutes = require('./routes/upload');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Log HTTP requests

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is healthy' });
});

// Routes
app.use('/api/upload', uploadRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 5001;
if (!process.env.PORT) {
    console.warn('Warning: PORT is not defined in environment variables, using default port 5001');
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
