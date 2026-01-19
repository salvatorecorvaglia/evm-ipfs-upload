/**
 * Validation utilities for client-side validation
 */

/**
 * Validate Ethereum address format (basic check)
 * @param {string} address - Ethereum address to validate
 * @returns {boolean} - True if valid format
 */
export const isValidEthereumAddress = (address) => {
    if (!address) return false;
    // Basic format check: 0x + 40 hex characters
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
};

/**
 * Validate IPFS CID (both CIDv0 and CIDv1)
 * @param {string} cid - IPFS CID to validate
 * @returns {boolean} - True if valid format
 */
export const isValidIPFSCID = (cid) => {
    if (!cid) return false;
    // CIDv0: Qm + 44 base58 characters
    const cidV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    // CIDv1: starts with 'b' and contains base32/base58 characters
    const cidV1Regex = /^b[a-z2-7]{58,}$/;
    return cidV0Regex.test(cid) || cidV1Regex.test(cid);
};

/**
 * Validate transaction hash format
 * @param {string} hash - Transaction hash to validate
 * @returns {boolean} - True if valid format
 */
export const isValidTransactionHash = (hash) => {
    if (!hash) return false;
    // 0x + 64 hex characters
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    return txHashRegex.test(hash);
};

/**
 * Validate file type
 * @param {File} file - File object to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {object} - { valid: boolean, error?: string }
 */
export const validateFileType = (file, allowedTypes) => {
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        };
    }

    return { valid: true };
};

/**
 * Validate file size
 * @param {File} file - File object to validate
 * @param {number} maxSizeBytes - Maximum file size in bytes
 * @returns {object} - { valid: boolean, error?: string }
 */
export const validateFileSize = (file, maxSizeBytes) => {
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    if (file.size > maxSizeBytes) {
        const maxSizeMB = (maxSizeBytes / 1024 / 1024).toFixed(2);
        return {
            valid: false,
            error: `File size exceeds the maximum limit of ${maxSizeMB} MB`
        };
    }

    return { valid: true };
};

/**
 * Validate file completely (type and size)
 * @param {File} file - File object to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @param {number} maxSizeBytes - Maximum file size in bytes
 * @returns {object} - { valid: boolean, error?: string }
 */
export const validateFile = (file, allowedTypes, maxSizeBytes) => {
    const typeValidation = validateFileType(file, allowedTypes);
    if (!typeValidation.valid) {
        return typeValidation;
    }

    const sizeValidation = validateFileSize(file, maxSizeBytes);
    if (!sizeValidation.valid) {
        return sizeValidation;
    }

    return { valid: true };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
