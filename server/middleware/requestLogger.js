/**
 * Request Logger Middleware
 * Adds request ID and enhanced logging
 */

const crypto = require('crypto');

// Generate unique request ID
const generateRequestId = () => {
    return `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};

// Add request ID to each request
const requestId = (req, res, next) => {
    req.requestId = generateRequestId();
    res.setHeader('X-Request-ID', req.requestId);
    next();
};

// Log request details
const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Log request
    const requestLog = {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
        console.log('📥 Incoming Request:', requestLog);
    }

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const responseLog = {
            requestId: req.requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        };

        const logLevel = res.statusCode >= 500 ? '❌' :
            res.statusCode >= 400 ? '⚠️' :
                '✅';

        if (process.env.NODE_ENV === 'development') {
            console.log(`${logLevel} Response:`, responseLog);
        } else if (res.statusCode >= 400) {
            // In production, only log errors
            console.error('Response Error:', responseLog);
        }
    });

    next();
};

module.exports = { requestId, requestLogger };
