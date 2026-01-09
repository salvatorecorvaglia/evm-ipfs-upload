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
import {
    ACCEPTED_FILE_TYPES,
    MAX_FILE_SIZE,
    STATUS_MESSAGES,
    ERROR_CODES,
    TIMEOUTS
} from '../constants';

const UploadIPFSPinata = () => {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [transactionHash, setTransactionHash] = useState('');
    const [walletConnected, setWalletConnected] = useState(false);
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [utf8String, setUtf8String] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];

        // Validate file type and size
        if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
            return setUploadStatus(STATUS_MESSAGES.INVALID_FILE_TYPE);
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            return setUploadStatus(STATUS_MESSAGES.FILE_TOO_LARGE);
        }

        selectedFile.preview = URL.createObjectURL(selectedFile);
        setFile(selectedFile);
        setUploadStatus('');
        setTransactionHash('');
        setUploadProgress(0);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    useEffect(() => {
        const checkConnection = async () => {
            const alreadyConnected = await isConnected();
            if (alreadyConnected) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                setAccount(address);
                setWalletConnected(true);
            }
        };

        checkConnection();
        setupAccountChangeListener(handleAccountsChanged);

        return () => {
            cleanupAccountChangeListener(handleAccountsChanged);
        };
    }, []);

    const handleAccountsChanged = useCallback(async (accounts) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
        } else {
            handleDisconnect();
        }
    }, []);

    const handleDisconnect = useCallback(() => {
        disconnectMetamask();
        setFile(null);
        setUploadStatus('');
        setTransactionHash('');
        setWalletConnected(false);
        setAccount(null);
        setLoading(false);
        setUploadProgress(0);
    }, []);

    const handleConnect = useCallback(async () => {
        try {
            const signer = await connectToMetamask();
            if (signer) {
                const address = await signer.getAddress();
                setAccount(address);
                setWalletConnected(true);
                setUploadStatus('');
            }
        } catch (error) {
            console.error('Failed to connect to MetaMask:', error);
            setUploadStatus(error.message || 'Connection failed. Please try again.');
        }
    }, []);

    const handleUploadAndSave = useCallback(async () => {
        if (!walletConnected) {
            return setUploadStatus(STATUS_MESSAGES.CONNECT_WALLET);
        }

        if (!file) {
            return setUploadStatus(STATUS_MESSAGES.UPLOAD_FILE);
        }

        setLoading(true);
        setUploadStatus(STATUS_MESSAGES.UPLOADING_IPFS);
        setUploadProgress(0);

        try {
            // Upload to IPFS via backend
            const pinataData = await uploadToPinata(file, (progress) => {
                setUploadProgress(progress);
            });

            if (pinataData?.IpfsHash) {
                setUploadStatus(STATUS_MESSAGES.SAVING_BLOCKCHAIN);

                const signer = await connectToMetamask();
                const transaction = await signer.sendTransaction({
                    to: account,
                    data: toUtf8Bytes(pinataData.IpfsHash),
                });

                const receipt = await transaction.wait();
                if (receipt.status === 1) {
                    setUploadStatus(STATUS_MESSAGES.CONFIRMING_TX);

                    try {
                        // Save to MongoDB with additional metadata
                        const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5001';
                        await axios.post(`${serverUrl}/api/upload`, {
                            cid: pinataData.IpfsHash,
                            fileName: file.name,
                            fileSize: file.size,
                            fileType: file.type,
                            walletAddress: account,
                            transactionHash: transaction.hash
                        }, {
                            timeout: TIMEOUTS.DATABASE_SAVE
                        });

                        const decodedString = decodeHexToUTF8(transaction.data).replace(/\0/g, '');
                        setTransactionHash(transaction.hash);
                        setUploadStatus(STATUS_MESSAGES.SUCCESS);
                        setFile(null);
                        setUtf8String(decodedString);
                        setUploadProgress(100);
                    } catch (dbError) {
                        console.error('Database save failed:', dbError);
                        const decodedString = decodeHexToUTF8(transaction.data).replace(/\0/g, '');
                        setTransactionHash(transaction.hash);
                        setUploadStatus(STATUS_MESSAGES.TX_SUCCESS_DB_FAILED);
                        setFile(null);
                        setUtf8String(decodedString);
                    }

                } else {
                    setUploadStatus(STATUS_MESSAGES.TX_FAILED);
                }
            } else {
                setUploadStatus(STATUS_MESSAGES.IPFS_FAILED);
            }
        } catch (error) {
            console.error("Error during upload or transaction:", error);
            let errorMessage = STATUS_MESSAGES.ERROR;

            if (error.code === ERROR_CODES.USER_REJECTED) {
                errorMessage = STATUS_MESSAGES.TX_CANCELLED;
            } else if (error.message.includes(ERROR_CODES.INSUFFICIENT_FUNDS)) {
                errorMessage = STATUS_MESSAGES.INSUFFICIENT_FUNDS;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setUploadStatus(errorMessage);
            setUploadProgress(0);
        } finally {
            setLoading(false);
        }
    }, [walletConnected, file, account]);

    // Cleanup for object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (file?.preview) {
                URL.revokeObjectURL(file.preview);
            }
        };
    }, [file]);

    return (
        <div className="document-upload-container">
            <div className="wallet-connection">
                {walletConnected ? (
                    <div className="connected-account">
                        <p>
                            Connected Account: {maskAddress(account)}
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

            {file && (
                <div className="file-details">
                    <h3>Selected File:</h3>
                    <p>Name: {file.name}</p>
                    <p>Type: {file.type}</p>
                    <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {file.type.startsWith('image/') && (
                        <div className="file-preview">
                            <img src={file.preview} alt="Preview" style={{ width: '100px', height: 'auto' }} />
                        </div>
                    )}
                </div>
            )}

            <button
                className="upload-button"
                onClick={handleUploadAndSave}
                disabled={!walletConnected || !file || loading}
            >
                {loading ? 'Uploading...' : 'Upload and Save Transaction'}
            </button>

            {loading && uploadProgress > 0 && (
                <div className="upload-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p>{uploadProgress}% Uploaded</p>
                </div>
            )}

            {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
            {transactionHash && (
                <p className="transaction-hash">
                    <button
                        className="disconnect-button"
                        onClick={async () => {
                            const ipfsUrl = `${process.env.REACT_APP_PINATA_GATEWAY_URL}/ipfs/${utf8String}`;
                            try {
                                window.open(ipfsUrl, '_blank');
                            } catch (error) {
                                console.error('Error opening IPFS link:', error);
                                setUploadStatus('Failed to fetch the IPFS content.');
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

