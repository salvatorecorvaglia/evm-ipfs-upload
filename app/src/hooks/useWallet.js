import { useState, useEffect, useCallback } from 'react';
import {
    connectToMetamask,
    disconnectMetamask,
    isConnected,
    setupAccountChangeListener,
    cleanupAccountChangeListener
} from '../connections/MetamaskConnect';
import { ethers } from 'ethers';

/**
 * Custom hook for managing MetaMask wallet connection
 * @returns {object} - Wallet state and methods
 */
export const useWallet = () => {
    const [walletConnected, setWalletConnected] = useState(false);
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check if wallet is already connected on mount
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const alreadyConnected = await isConnected();
                if (alreadyConnected) {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();
                    const network = await provider.getNetwork();
                    const balance = await provider.getBalance(address);

                    setAccount(address);
                    setChainId(Number(network.chainId));
                    setBalance(ethers.formatEther(balance));
                    setWalletConnected(true);
                }
            } catch (err) {
                console.error('Error checking wallet connection:', err);
                setError(err.message);
            }
        };

        checkConnection();
    }, []);

    // Handle account changes
    const handleAccountsChanged = useCallback(async (accounts) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);

            // Update balance when account changes
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const balance = await provider.getBalance(accounts[0]);
                setBalance(ethers.formatEther(balance));
            } catch (err) {
                console.error('Error getting balance:', err);
            }
        } else {
            handleDisconnect();
        }
    }, []);

    // Handle chain changes
    const handleChainChanged = useCallback((chainIdHex) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        // Reload the page when chain changes (recommended by MetaMask)
        window.location.reload();
    }, []);

    // Setup event listeners
    useEffect(() => {
        if (window.ethereum) {
            setupAccountChangeListener(handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                cleanupAccountChangeListener(handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, [handleAccountsChanged, handleChainChanged]);

    // Connect wallet
    const connect = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const signer = await connectToMetamask();
            if (signer) {
                const address = await signer.getAddress();
                const provider = new ethers.BrowserProvider(window.ethereum);
                const network = await provider.getNetwork();
                const balance = await provider.getBalance(address);

                setAccount(address);
                setChainId(Number(network.chainId));
                setBalance(ethers.formatEther(balance));
                setWalletConnected(true);
            }
        } catch (err) {
            console.error('Failed to connect wallet:', err);
            setError(err.message || 'Failed to connect wallet');
        } finally {
            setLoading(false);
        }
    }, []);

    // Disconnect wallet
    const handleDisconnect = useCallback(() => {
        disconnectMetamask();
        setWalletConnected(false);
        setAccount(null);
        setChainId(null);
        setBalance(null);
        setError(null);
    }, []);

    // Request network switch
    const switchNetwork = useCallback(async (targetChainId) => {
        if (!window.ethereum) {
            setError('MetaMask is not installed');
            return;
        }

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            });
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902) {
                setError('This network is not available in your MetaMask, please add it');
            } else {
                setError(err.message);
            }
            console.error('Failed to switch network:', err);
        }
    }, []);

    // Refresh balance
    const refreshBalance = useCallback(async () => {
        if (!account || !window.ethereum) return;

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            setBalance(ethers.formatEther(balance));
        } catch (err) {
            console.error('Error refreshing balance:', err);
        }
    }, [account]);

    return {
        // State
        walletConnected,
        account,
        chainId,
        balance,
        loading,
        error,

        // Methods
        connect,
        disconnect: handleDisconnect,
        switchNetwork,
        refreshBalance
    };
};

export default useWallet;
