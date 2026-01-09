// Application Constants

// Accepted file types for upload
export const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

// File type labels for UI
export const FILE_TYPE_LABELS = {
    'application/pdf': 'PDF',
    'image/png': 'PNG',
    'image/jpeg': 'JPEG/JPG'
};

// Maximum file size in bytes (100 MB)
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Maximum file size label for UI
export const MAX_FILE_SIZE_LABEL = '100 MB';

// Status messages
export const STATUS_MESSAGES = {
    CONNECT_WALLET: 'Please connect your wallet.',
    UPLOAD_FILE: 'Please upload a file.',
    UPLOADING_IPFS: 'Uploading to IPFS...',
    SAVING_BLOCKCHAIN: 'File uploaded with Pinata. Saving transaction to Blockchain...',
    CONFIRMING_TX: 'Transaction confirmed. Saving to database...',
    SUCCESS: 'Transaction and Database Save Successful!',
    TX_SUCCESS_DB_FAILED: 'Transaction successful, but failed to save to database.',
    TX_FAILED: 'Transaction failed. Please try again.',
    IPFS_FAILED: 'IPFS upload failed. Please try again.',
    TX_CANCELLED: 'Transaction cancelled by user.',
    INSUFFICIENT_FUNDS: 'Insufficient funds for transaction. Please fund your wallet.',
    ERROR: 'An error occurred. Please try again.',
    INVALID_FILE_TYPE: `Invalid file type. Please upload a PDF, PNG, or JPEG file.`,
    FILE_TOO_LARGE: `File size exceeds the ${MAX_FILE_SIZE_LABEL} limit.`
};

// Error codes
export const ERROR_CODES = {
    USER_REJECTED: 4001,
    INSUFFICIENT_FUNDS: 'insufficient funds'
};

// Blockchain network configuration
export const NETWORK_CONFIG = {
    // Add your preferred network configuration here
    // Example for Ethereum mainnet
    // chainId: '0x1',
    // chainName: 'Ethereum Mainnet'
};

// API timeout settings (in milliseconds)
export const TIMEOUTS = {
    IPFS_UPLOAD: 60000,      // 60 seconds
    BLOCKCHAIN_TX: 120000,   // 2 minutes
    DATABASE_SAVE: 10000     // 10 seconds
};
