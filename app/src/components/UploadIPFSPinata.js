import React, { useCallback, useEffect, useState } from 'react';
import {
    cleanupAccountChangeListener,
    connectToMetamask,
    disconnectMetamask,
    isConnected,
    setupAccountChangeListener
} from '../connections/MetamaskConnect';
import { uploadToPinata } from '../api/PinataAPI';
import { ethers, toUtf8Bytes } from 'ethers';
import { useDropzone } from 'react-dropzone';
import '../styles/index.css';
import { decodeHexToUTF8, maskAddress } from "../functions";
import axios from 'axios';

const UploadIPFSPinata = () => {
    const [uploadState, setUploadState] = useState({
        file: null,
        uploadStatus: '',
        transactionHash: '',
        walletConnected: false,
        account: null,
        loading: false,
        utf8String: ''
    });

    const acceptedFileTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    const maxFileSize = 100 * 1024 * 1024; // 100 MB limit

    const onDrop = (acceptedFiles) => {
        const selectedFile = acceptedFiles[0];

        // Validate file type and size
        if (!acceptedFileTypes.includes(selectedFile.type)) {
            return setUploadState(prev => ({ ...prev, uploadStatus: 'Invalid file type. Please upload a PDF, PNG, or JPEG file.' }));
        }

        if (selectedFile.size > maxFileSize) {
            return setUploadState(prev => ({ ...prev, uploadStatus: 'File size exceeds the 100 MB limit.' }));
        }

        selectedFile.preview = URL.createObjectURL(selectedFile); // Set file preview
        setUploadState(prev => ({ ...prev, file: selectedFile, uploadStatus: '', transactionHash: '' }));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    useEffect(() => {
        const checkConnection = async () => {
            const alreadyConnected = await isConnected();
            if (alreadyConnected) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                setUploadState(prev => ({ ...prev, account: address, walletConnected: true }));
            }
        };

        checkConnection();
        setupAccountChangeListener(handleAccountsChanged);

        return () => {
            cleanupAccountChangeListener(handleAccountsChanged);
        };
    }, []);

    const handleDisconnect = useCallback(() => {
        disconnectMetamask();
        setUploadState(prev => ({
            ...prev,
            file: null,
            uploadStatus: '',
            transactionHash: '',
            walletConnected: false,
            account: null,
            loading: false,
        }));
    }, []);

    const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
            setUploadState(prev => ({ ...prev, account: accounts[0] }));
        } else {
            handleDisconnect();
        }
    };

    const handleConnect = useCallback(async () => {
        try {
            const signer = await connectToMetamask();
            if (signer) {
                const address = await signer.getAddress();
                setUploadState(prev => ({ ...prev, account: address, walletConnected: true, uploadStatus: '' }));
            }
        } catch (error) {
            console.error('Failed to connect to MetaMask:', error);
            setUploadState(prev => ({ ...prev, uploadStatus: error.message || 'Connection failed. Please try again.' }));
        }
    }, []);

    const handleUploadAndSave = useCallback(async () => {
        const { walletConnected, file } = uploadState;

        if (!walletConnected) {
            return setUploadState(prev => ({ ...prev, uploadStatus: 'Please connect your wallet.' }));
        }

        if (!file) {
            return setUploadState(prev => ({ ...prev, uploadStatus: 'Please upload a file.' }));
        }

        setUploadState(prev => ({ ...prev, loading: true, uploadStatus: 'Uploading to IPFS...' }));

        try {
            const pinataData = await uploadToPinata(file);

            if (pinataData?.IpfsHash) {
                setUploadState(prev => ({ ...prev, uploadStatus: 'File uploaded with Pinata. Saving transaction to Blockchain...' }));

                const signer = await connectToMetamask();
                const transaction = await signer.sendTransaction({
                    to: uploadState.account,
                    data: toUtf8Bytes(pinataData.IpfsHash),
                });

                const receipt = await transaction.wait();
                if (receipt.status === 1) {
                    setUploadState(prev => ({ ...prev, uploadStatus: 'Transaction confirmed. Saving to database...' }));

                    try {
                        // Save only CID to MongoDB via Express API using axios
                        await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/upload`, {
                            cid: pinataData.IpfsHash, // Only CID is being sent here
                        });

                        setUploadState(prev => ({
                            ...prev,
                            transactionHash: transaction.hash,
                            uploadStatus: 'Transaction and Database Save Successful!',
                            file: null,
                            utf8String: decodeHexToUTF8(transaction.data).replace(/\0/g, '')
                        }));
                    } catch (dbError) {
                        console.error('Database save failed:', dbError);
                        setUploadState(prev => ({
                            ...prev,
                            transactionHash: transaction.hash,
                            uploadStatus: 'Transaction successful, but failed to save to database.',
                            file: null,
                            utf8String: decodeHexToUTF8(transaction.data).replace(/\0/g, '')
                        }));
                    }

                } else {
                    setUploadState(prev => ({ ...prev, uploadStatus: 'Transaction failed. Please try again.' }));
                }
            } else {
                setUploadState(prev => ({ ...prev, uploadStatus: 'IPFS upload failed. Please try again.' }));
            }
        } catch (error) {
            console.error("Error during upload or transaction:", error);
            let errorMessage = 'An error occurred. Please try again.';

            if (error.code === 4001) {
                errorMessage = 'Transaction cancelled by user.';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds for transaction. Please fund your wallet.';
            }

            setUploadState(prev => ({ ...prev, uploadStatus: errorMessage }));
        } finally {
            setUploadState(prev => ({ ...prev, loading: false }));
        }
    }, [uploadState]);

    // Cleanup for object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (uploadState.file) {
                URL.revokeObjectURL(uploadState.file.preview);
            }
        };
    }, [uploadState.file]);

    return (
        <div className="document-upload-container">
            <div className="wallet-connection">
                {uploadState.walletConnected ? (
                    <div className="connected-account">
                        <p>
                            Connected Account: {maskAddress(uploadState.account)}
                        </p>
                        <button className="disconnect-button" onClick={handleDisconnect}>
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button className="connect-button" onClick={handleConnect}>Connect MetaMask</button>
                )}
            </div>

            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the files here ...</p>
                ) : (
                    <p>Drag & drop a file here, or click to select one</p>
                )}
            </div>

            {uploadState.file && (
                <div className="file-details">
                    <h3>Selected File:</h3>
                    <p>Name: {uploadState.file.name}</p>
                    <p>Type: {uploadState.file.type}</p>
                    <p>Size: {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {uploadState.file.type.startsWith('image/') && (
                        <div className="file-preview">
                            <img src={uploadState.file.preview} alt="Preview" style={{ width: '100px', height: 'auto' }} />
                        </div>
                    )}
                </div>
            )}

            <button
                className="upload-button"
                onClick={handleUploadAndSave}
                disabled={!uploadState.walletConnected || !uploadState.file || uploadState.loading}
            >
                {uploadState.loading ? 'Uploading...' : 'Upload and Save Transaction'}
            </button>

            {uploadState.uploadStatus && <p className="upload-status">{uploadState.uploadStatus}</p>}
            {uploadState.transactionHash && (
                <p className="transaction-hash">
                    <button
                        className="disconnect-button"
                        onClick={async () => {
                            const ipfsUrl = `${process.env.REACT_APP_PINATA_GATEWAY_URL}/ipfs/${uploadState.utf8String}`;
                            try {
                                // Open the local IPFS URL in a new tab
                                window.open(ipfsUrl, '_blank');
                            } catch (error) {
                                console.error('Error opening IPFS link:', error);
                                setUploadState(prev => ({ ...prev, uploadStatus: 'Failed to fetch the IPFS content.' }));
                            }
                        }}
                    >
                        View on IPFS
                    </button>
                </p>
            )}
        </div>
    );
};

export default UploadIPFSPinata;
