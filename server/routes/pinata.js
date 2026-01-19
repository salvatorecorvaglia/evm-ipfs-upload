const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const path = require('path');

// Sanitize file name to prevent path traversal and other issues
const sanitizeFileName = (fileName) => {
    // Remove path separators and special chars, keep only safe characters
    return fileName
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .substring(0, 255); // Limit length
};

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100 MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, PNG, and JPEG files are allowed.'));
        }
    }
});

// Route to upload file to Pinata
router.post('/', upload.single('file'), async (req, res) => {
    try {
        // Validate API keys
        const PINATA_API_KEY = process.env.PINATA_API_KEY;
        const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

        if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
            console.error('Pinata API keys are not configured');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error: Pinata API keys not set'
            });
        }

        // Validate file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided'
            });
        }

        // Create FormData and append file with sanitized name
        const formData = new FormData();
        const sanitizedFileName = sanitizeFileName(req.file.originalname);

        formData.append('file', req.file.buffer, {
            filename: sanitizedFileName,
            contentType: req.file.mimetype
        });

        // Upload to Pinata with retry logic
        const pinataUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
        const timeout = parseInt(process.env.PINATA_TIMEOUT) || 60000; // 60 seconds default
        const maxRetries = parseInt(process.env.PINATA_MAX_RETRIES) || 2;

        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Upload attempt ${attempt}/${maxRetries} for file: ${sanitizedFileName}`);

                const response = await axios.post(pinataUrl, formData, {
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                    timeout: timeout,
                    headers: {
                        ...formData.getHeaders(),
                        'pinata_api_key': PINATA_API_KEY,
                        'pinata_secret_api_key': PINATA_SECRET_KEY,
                    }
                });

                // Validate response
                if (response.data && response.data.IpfsHash) {
                    console.log(`Upload successful on attempt ${attempt}: ${response.data.IpfsHash}`);
                    return res.status(200).json({
                        success: true,
                        message: 'File uploaded to IPFS successfully',
                        data: {
                            IpfsHash: response.data.IpfsHash,
                            PinSize: response.data.PinSize,
                            Timestamp: response.data.Timestamp
                        }
                    });
                } else {
                    throw new Error('Unexpected response from Pinata');
                }

            } catch (error) {
                lastError = error;
                console.error(`Pinata upload attempt ${attempt} failed: ${error.message}`);
                if (attempt === maxRetries) {
                    throw lastError; // Re-throw the last error if all retries fail
                }
                // Add a delay before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }

    } catch (error) {
        console.error('Pinata upload error:', error.message);

        // Handle specific errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds the maximum limit'
            });
        }

        if (error.response) {
            return res.status(error.response.status || 500).json({
                success: false,
                message: `Pinata upload failed: ${error.response.data?.error || error.message}`
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to upload file to IPFS'
        });
    }
});

module.exports = router;

