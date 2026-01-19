const mongoose = require('mongoose');
const { isAddress } = require('ethers');

// Improved CID validation for both CIDv0 and CIDv1
const validateCID = (cid) => {
    // CIDv0: Qm + 44 base58 characters
    const cidV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    // CIDv1: starts with 'b' and contains base32/base58 characters
    const cidV1Regex = /^b[a-z2-7]{58,}$/;

    return cidV0Regex.test(cid) || cidV1Regex.test(cid);
};

// Validate Ethereum address using ethers
const validateEthereumAddress = (address) => {
    if (!address) return true; // Optional field
    return isAddress(address);
};

// Validate transaction hash (0x + 64 hex characters)
const validateTransactionHash = (hash) => {
    if (!hash) return true; // Optional field
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    return txHashRegex.test(hash);
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
        validate: {
            validator: validateEthereumAddress,
            message: props => `${props.value} is not a valid Ethereum address`
        }
    },
    transactionHash: {
        type: String,
        trim: true,
        index: true, // Index for efficient queries by transaction
        validate: {
            validator: validateTransactionHash,
            message: props => `${props.value} is not a valid Ethereum transaction hash`
        }
    },
}, {
    timestamps: true, // Automatically creates 'createdAt' and 'updatedAt'
});

// Compound index for common query patterns
UploadSchema.index({ walletAddress: 1, createdAt: -1 });

// Virtual field: IPFS URL
UploadSchema.virtual('ipfsUrl').get(function () {
    const gateway = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud';
    return `${gateway}/ipfs/${this.cid}`;
});

// Virtual field: Blockchain explorer URL (Etherscan by default)
UploadSchema.virtual('explorerUrl').get(function () {
    if (!this.transactionHash) return null;
    const network = process.env.ETH_NETWORK || 'mainnet';
    const baseUrl = network === 'mainnet'
        ? 'https://etherscan.io'
        : `https://${network}.etherscan.io`;
    return `${baseUrl}/tx/${this.transactionHash}`;
});

// Instance method: Get IPFS URL
UploadSchema.methods.getIpfsUrl = function (customGateway) {
    const gateway = customGateway || process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud';
    return `${gateway}/ipfs/${this.cid}`;
};

// Instance method: Get explorer URL
UploadSchema.methods.getExplorerUrl = function (network) {
    if (!this.transactionHash) return null;
    const net = network || process.env.ETH_NETWORK || 'mainnet';
    const baseUrl = net === 'mainnet'
        ? 'https://etherscan.io'
        : `https://${net}.etherscan.io`;
    return `${baseUrl}/tx/${this.transactionHash}`;
};

// Include virtuals in JSON and Object representations
UploadSchema.set('toJSON', { virtuals: true });
UploadSchema.set('toObject', { virtuals: true });

// Export the model
module.exports = mongoose.model('Upload', UploadSchema);
