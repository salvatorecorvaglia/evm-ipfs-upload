import axios from 'axios';

export const uploadToLocalIPFS = async (file) => {
    // Check if the file is valid
    if (!file) {
        throw new Error('No file provided for upload.');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        // Upload to IPFS using local node
        const response = await axios.post('http://127.0.0.1:5001/api/v0/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 10000, // Set a timeout of 10 seconds
            onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`File upload progress: ${progress}%`);
                },
        });

        // Check for a valid response
        if (response.status !== 200) {
            throw new Error(`Failed to upload to IPFS, status code: ${response.status}`);
        }

        // Return the IPFS hash (CID) from the response
        return response.data; // The response includes the CID and other IPFS details
    } catch (error) {
        console.error('IPFS upload failed:', error.message);
        // Handle different types of errors based on the error object
        if (error.response) {
            // Server responded with a status outside 2xx
            throw new Error(`IPFS server error: ${error.response.status} ${error.response.statusText}`);
        } else if (error.request) {
            // The Request was made but no response received
            throw new Error('No response received from IPFS server.');
        } else {
            // Other errors during request setup
            throw new Error(`Error during IPFS upload: ${error.message}`);
        }
    }
};
