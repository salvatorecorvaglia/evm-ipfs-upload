const express = require('express');
const router = express.Router();
const Upload = require('../models/Upload');
const { body, validationResult } = require('express-validator');

// Route to save CID to MongoDB
router.post(
    '/',
    // Validate CID
    body('cid').notEmpty().withMessage('CID is required.').isString().withMessage('CID must be a string.'),
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { cid } = req.body;

        try {
            const newUpload = new Upload({ cid });

            await newUpload.save();
            return res.status(201).json({ message: 'Data saved successfully!', upload: newUpload });
        } catch (error) {
            console.error('Error saving to MongoDB:', error.message);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
);

module.exports = router;
