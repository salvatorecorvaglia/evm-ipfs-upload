import React from 'react';
import './styles/app.css';
import UploadIPFSPinata from "./components/UploadIPFSPinata";

// Main application component
function App() {
    return (
        <div className="App">
            <header className="app-header">
                <h1 className="header-title">Document Upload with IPFS and MetaMask</h1>
            </header>
            <main>
                <UploadIPFSPinata />
            </main>
        </div>
    );
}

export default App;
