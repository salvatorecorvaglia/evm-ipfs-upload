import axios from 'axios';
import {API_URLS} from '../config';

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.REACT_APP_PINATA_SECRET_API_KEY;

// Upload a file to Pinata
export const uploadToPinata = async (file) => {
    // Validate API keys
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY || PINATA_API_KEY.trim() === '' || PINATA_SECRET_API_KEY.trim() === '') {
        console.error('Pinata API keys are not defined or are empty.');
        throw new Error('Pinata API keys are not configured properly.');
    }

    // Validate file (optional)
    if (!file) {
        throw new Error('No file provided for upload.');
    }

    const url = API_URLS.pinata; // Use the URL from the config

    // Create FormData object and append the file
    const data = new FormData();
    data.append('file', file);

    try {
        const response = await axios.post(url, data, {
            maxContentLength: 'Infinity',
            timeout: 30000, // Increased timeout to 30 seconds
            onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`File upload progress: ${progress}%`);
                // You could update a state here if you want to show progress in the UI
            },
            headers: {
                'Content-Type': 'multipart/form-data',
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_API_KEY,
            },
        });

        // Validate the response
        if (response.data && response.data.IpfsHash) {
            return response.data;
        } else {
            throw new Error('Unexpected response from Pinata: ' + JSON.stringify(response.data));
        }
    } catch (error) {
        // Log the error response if available
        if (error.response) {
            console.error('Pinata upload failed:', error.response.data);
            throw new Error(`Pinata upload failed: ${error.response.data.error || error.message}`);
        } else {
            console.error('Pinata upload failed:', error);
            throw new Error(`Pinata upload failed: ${error.message || error}`);
        }
    }
};
