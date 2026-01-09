# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Security**: Moved Pinata API keys to backend for improved security
- **Backend**: New `/api/upload/ipfs` endpoint for secure IPFS uploads via backend
- **Backend**: GET endpoints for retrieving uploads by CID, wallet address, or all with pagination
- **Backend**: Enhanced upload model with additional metadata fields (fileName, fileSize, fileType, walletAddress, transactionHash)
- **Backend**: Improved CID validation supporting both CIDv0 and CIDv1 formats
- **Backend**: MongoDB event listeners for better connection monitoring
- **Backend**: Graceful shutdown handling for server and database
- **Backend**: Configurable CORS with environment variable support
- **Backend**: Enhanced health check endpoint with database status
- **Frontend**: Progress bar for file upload feedback
- **Frontend**: Constants file to centralize application constants
- **Frontend**: Enhanced error handling with specific error messages
- **DevOps**: Docker setup with multi-stage builds for frontend and backend
- **DevOps**: Unified docker-compose.yml for entire stack
- **DevOps**: ESLint and Prettier configuration for code quality
- **Documentation**: Comprehensive API documentation (API.md)
- **Documentation**: Contributing guidelines (CONTRIBUTING.md)
- **Documentation**: Environment variable example files (.env.example)

### Changed
- **Frontend**: Refactored UploadIPFSPinata component to fix circular dependencies
- **Frontend**: Updated to use backend endpoint for IPFS uploads instead of direct Pinata calls
- **Frontend**: Removed backend dependencies (Express, Mongoose, CORS) from package.json
- **Backend**: Enhanced server.js with improved logging and error handling
- **Backend**: Improved database connection with retry logic and timeout configuration
- **Backend**: Updated upload routes to support additional metadata

### Fixed
- Circular dependency issue in UploadIPFSPinata component
- Memory leaks from unreleased object URLs
- Missing validation for optional upload metadata fields

### Security
- API keys no longer exposed in frontend code
- Improved input validation on all backend endpoints
- Better error messages that don't leak sensitive information

## [0.1.0] - Initial Release

### Added
- Basic IPFS file upload functionality via Pinata
- MetaMask wallet integration
- Blockchain transaction recording
- MongoDB database for CID storage
- React frontend with drag-and-drop file upload
- Express backend with basic API
- File type and size validation
- Support for PDF, PNG, and JPEG files
