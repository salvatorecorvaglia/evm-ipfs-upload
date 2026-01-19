/**
 * Centralized Error Handler Middleware
 * Provides structured error responses and logging
 */

class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    // Default to 500 server error
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Log error details
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    console.error('Error:', {
        message: error.message,
        statusCode: error.statusCode,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        ...(isDevelopment && { stack: err.stack })
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error.message = 'Invalid resource ID';
        error.statusCode = 400;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        error.statusCode = 409;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error.message = `Validation Error: ${messages.join(', ')}`;
        error.statusCode = 400;
    }

    // CORS errors
    if (err.message && err.message.includes('CORS')) {
        error.statusCode = 403;
    }

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        error.message = 'File size exceeds the limit';
        error.statusCode = 400;
    }

    // Multer file type error
    if (err.message && err.message.includes('Invalid file type')) {
        error.statusCode = 400;
    }

    // Send error response
    res.status(error.statusCode).json({
        success: false,
        error: error.message,
        ...(isDevelopment && { stack: err.stack }),
        ...(req.requestId && { requestId: req.requestId }),
        timestamp: new Date().toISOString()
    });
};

module.exports = { errorHandler, AppError };
