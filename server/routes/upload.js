const express = require('express');
const router = express.Router();
const Upload = require('../models/Upload');
const { body, query, validationResult } = require('express-validator');

// POST - Save CID and metadata to MongoDB
router.post(
    '/',
    // Validate inputs
    [
        body('cid').notEmpty().withMessage('CID is required').isString().trim(),
        body('fileName').optional().isString().trim(),
        body('fileSize').optional().isInt({ min: 0 }).withMessage('File size must be a positive number'),
        body('fileType').optional().isString().trim(),
        body('walletAddress').optional().isString().trim(),
        body('transactionHash').optional().isString().trim(),
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { cid, fileName, fileSize, fileType, walletAddress, transactionHash } = req.body;

        try {
            const uploadData = { cid };

            // Add optional fields if provided
            if (fileName) uploadData.fileName = fileName;
            if (fileSize) uploadData.fileSize = fileSize;
            if (fileType) uploadData.fileType = fileType;
            if (walletAddress) uploadData.walletAddress = walletAddress.toLowerCase();
            if (transactionHash) uploadData.transactionHash = transactionHash;

            const newUpload = new Upload(uploadData);
            await newUpload.save();

            return res.status(201).json({
                success: true,
                message: 'Upload record created successfully',
                upload: newUpload
            });
        } catch (error) {
            console.error('Error saving to MongoDB:', error.message);

            // Handle duplicate key error
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'CID already exists'
                });
            }

            // Handle validation errors
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: Object.values(error.errors).map(e => e.message)
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }
);

// GET - Retrieve upload by CID
router.get(
    '/cid/:cid',
    async (req, res) => {
        try {
            const { cid } = req.params;
            const upload = await Upload.findOne({ cid });

            if (!upload) {
                return res.status(404).json({
                    success: false,
                    message: 'Upload not found'
                });
            }

            return res.status(200).json({
                success: true,
                upload
            });
        } catch (error) {
            console.error('Error retrieving upload:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }
);

// GET - Retrieve uploads by wallet address
router.get(
    '/wallet/:address',
    [
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a positive number'),
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const { address } = req.params;
            const limit = parseInt(req.query.limit) || 10;
            const skip = parseInt(req.query.skip) || 0;

            const uploads = await Upload.find({ walletAddress: address.toLowerCase() })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);

            const total = await Upload.countDocuments({ walletAddress: address.toLowerCase() });

            return res.status(200).json({
                success: true,
                uploads,
                pagination: {
                    total,
                    limit,
                    skip,
                    hasMore: skip + uploads.length < total
                }
            });
        } catch (error) {
            console.error('Error retrieving uploads:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }
);

// GET - Retrieve all uploads (with pagination)
router.get(
    '/',
    [
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a positive number'),
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const limit = parseInt(req.query.limit) || 10;
            const skip = parseInt(req.query.skip) || 0;

            const uploads = await Upload.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);

            const total = await Upload.countDocuments();

            return res.status(200).json({
                success: true,
                uploads,
                pagination: {
                    total,
                    limit,
                    skip,
                    hasMore: skip + uploads.length < total
                }
            });
        } catch (error) {
            console.error('Error retrieving uploads:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }
);

module.exports = router;

