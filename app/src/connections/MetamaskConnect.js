import { ethers } from 'ethers';

// Connect to MetaMask
export const connectToMetamask = async () => {
    if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        return await provider.getSigner();
    } catch (error) {
        console.error("Metamask connection failed:", error);
        throw new Error("Failed to connect to MetaMask. Please try again or check if it is installed.");
    }
};

// Simulate disconnect by clearing account from state
export const disconnectMetamask = () => {
    // MetaMask does not provide a disconnect method, but we can reset the state in the application
    return null; // You may want to manage the state in your application
};

// Check if MetaMask is already connected
export const isConnected = async () => {
    if (!window.ethereum) return false;

    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        return accounts.length > 0;
    } catch (error) {
        console.error("Failed to check MetaMask connection:", error);
        return false;
    }
};

// Add event listener for account changes
export const setupAccountChangeListener = (callback) => {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', callback);
    } else {
        console.warn('MetaMask is not installed, unable to set up account change listener.');
    }
};

// Clean up event listener
export const cleanupAccountChangeListener = (callback) => {
    if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', callback);
    } else {
        console.warn('MetaMask is not installed, unable to clean up account change listener.');
    }
};