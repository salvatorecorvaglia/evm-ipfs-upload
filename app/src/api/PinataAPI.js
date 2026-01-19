import axios from 'axios';

/**
 * Upload a file to IPFS via backend endpoint
 * This is more secure as API keys are stored on the backend
 * @param {File} file - File to upload
 * @param {Function} onProgress - Progress callback
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise} - Upload response data
 */
export const uploadToPinata = async (file, onProgress, signal = null) => {
    // Validate file
    if (!file) {
        throw new Error('No file provided for upload.');
    }

    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5001';
    const url = `${serverUrl}/api/upload/ipfs`;

    // Create FormData object and append the file
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(url, formData, {
            timeout: 120000, // 120 seconds timeout for large files
            signal: signal, // Support for request cancellation
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`File upload progress: ${progress}%`);

                    // Call the callback if provided
                    if (onProgress && typeof onProgress === 'function') {
                        onProgress(progress);
                    }
                }
            },
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Validate the response
        if (response.data?.success && response.data?.data?.IpfsHash) {
            return response.data.data;
        } else {
            throw new Error('Unexpected response from server: ' + JSON.stringify(response.data));
        }
    } catch (error) {
        // Handle request cancellation
        if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
            throw new Error('Upload cancelled');
        }

        // Log the error response if available
        if (error.response) {
            console.error('Upload failed:', error.response.data);
            const errorMessage = error.response.data?.message || error.response.data?.error || error.message;
            throw new Error(`Upload failed: ${errorMessage}`);
        } else if (error.request) {
            console.error('No response from server:', error.message);
            throw new Error('No response from server. Please check your connection.');
        } else {
            console.error('Upload failed:', error.message);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }
};

/**
 * Create an abort controller for canceling uploads
 * @returns {AbortController} - Abort controller instance
 */
export const createAbortController = () => {
    return new AbortController();
};
