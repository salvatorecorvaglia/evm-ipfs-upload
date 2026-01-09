const mongoose = require('mongoose');

// Improved CID validation for both CIDv0 and CIDv1
const validateCID = (cid) => {
    // CIDv0: Qm + 44 base58 characters
    const cidV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    // CIDv1: starts with 'b' and contains base32/base58 characters
    const cidV1Regex = /^b[a-z2-7]{58,}$/;

    return cidV0Regex.test(cid) || cidV1Regex.test(cid);
};

const UploadSchema = new mongoose.Schema({
    cid: {
        type: String,
        required: [true, 'CID is required'],
        unique: true,
        index: true,
        trim: true,
        validate: {
            validator: validateCID,
            message: props => `${props.value} is not a valid IPFS CID (CIDv0 or CIDv1)`
        },
    },
    fileName: {
        type: String,
        trim: true,
    },
    fileSize: {
        type: Number,
        min: 0,
    },
    fileType: {
        type: String,
        trim: true,
    },
    walletAddress: {
        type: String,
        trim: true,
        lowercase: true,
        index: true, // Index for efficient queries by wallet
    },
    transactionHash: {
        type: String,
        trim: true,
        index: true, // Index for efficient queries by transaction
    },
}, {
    timestamps: true, // Automatically creates 'createdAt' and 'updatedAt'
});

// Compound index for common query patterns
UploadSchema.index({ walletAddress: 1, createdAt: -1 });

// Export the model
module.exports = mongoose.model('Upload', UploadSchema);

