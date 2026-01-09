# EVM IPFS Upload

A full-stack decentralized application (dApp) that enables secure file uploads to IPFS via Pinata, stores transaction records on the blockchain, and maintains metadata in MongoDB. Built with React, Node.js, Express, and Web3 technologies.

## ✨ What's New

🔒 **Enhanced Security**: API keys now safely stored on backend  
📊 **Upload Progress**: Real-time progress tracking for file uploads  
🔍 **Advanced Queries**: Retrieve uploads by CID, wallet address, or pagination  
🐳 **Docker Ready**: Complete Docker setup for easy deployment  
📚 **Better Docs**: Comprehensive API documentation and contribution guidelines

## 🌟 Features

- **Decentralized File Storage**: Upload files to IPFS using Pinata's pinning service
- **Blockchain Integration**: Store file hashes on the blockchain using MetaMask transactions
- **Enhanced Security**: API keys secured on backend server
- **Database Persistence**: Maintain file metadata with additional fields (fileName, fileSize, fileType, wallet address, transaction hash)
- **Upload Progress Tracking**: Real-time progress bar for file uploads
- **Advanced Querying**: Query uploads by CID, wallet address, or retrieve all with pagination
- **Drag & Drop Interface**: User-friendly file upload with drag-and-drop functionality
- **File Validation**: Support for PDF, PNG, and JPEG files with size limits
- **Wallet Integration**: Seamless MetaMask connection and account management
- **Transaction Tracking**: Monitor upload progress and transaction status
- **IPFS Gateway Access**: Direct links to view files on IPFS
- **Docker Support**: Complete containerized setup for all services

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │    MongoDB      │
│                 │◄──►│                 │◄──►│                 │
│  - File Upload  │    │  - API Routes   │    │  - File CIDs    │
│  - MetaMask     │    │  - Pinata Proxy │    │  - Metadata     │
│  - Progress Bar │    │  - Validation   │    │  - Wallet Data  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌─────────────────┐
│     Pinata      │    │   Blockchain    │
│   IPFS Service  │    │   (Ethereum)    │
│                 │    │                 │
│  - File Storage │    │  - Tx Records   │
│  - Content Hash │    │  - Hash Storage │
└─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose
- MetaMask browser extension
- Pinata account with API keys

### Option 1: Docker (Recommended)

The easiest way to run the entire stack:

```bash
# 1. Clone the repository
git clone <repository-url>
cd evm-ipfs-upload

# 2. Copy and configure environment file
cp .env.docker .env

# 3. Edit .env and add your Pinata API keys
# PINATA_API_KEY=your_actual_api_key
# PINATA_SECRET_KEY=your_actual_secret_key

# 4. Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5001
# MongoDB: localhost:27017
```

### Option 2: Manual Setup

For development without Docker:
```

### 2. Manual Setup - Environment Variables

Create environment files using the provided examples:

**Frontend (app/.env):**
```bash
cp app/.env.example app/.env
# Edit app/.env and set:
# REACT_APP_SERVER_URL=http://localhost:5001
# REACT_APP_PINATA_GATEWAY_URL=https://gateway.pinata.cloud
```

**Backend (server/.env):**
```bash
cp server/.env.example server/.env
# Edit server/.env and set:
# PORT=5001
# MONGO_URI=mongodb://localhost:27017/ipfs-upload
# PINATA_API_KEY=your_pinata_api_key
# PINATA_SECRET_KEY=your_pinata_secret_key
# ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Manual Setup - Start Services

**Start MongoDB:**
```bash
cd db
docker-compose up -d
```

**Start Backend:**
```bash
cd server
npm install
npm start
```

**Start Frontend:**
```bash
cd app
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- MongoDB: localhost:27017

## 📁 Project Structure

```
evm-ipfs-upload/
├── app/                          # React frontend application
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── api/
│   │   │   └── PinataAPI.js     # IPFS upload via backend
│   │   ├── components/
│   │   │   ├── UploadIPFSPinata.js  # Main upload component
│   │   │   └── UploadIPFSNode.js    # Alternative IPFS node component
│   │   ├── connections/
│   │   │   └── MetamaskConnect.js   # MetaMask wallet integration
│   │   ├── nodes/
│   │   │   └── IPFSNode.js      # IPFS node configuration
│   │   ├── styles/              # CSS stylesheets
│   │   ├── constants.js         # Application constants
│   │   ├── config.js            # Configuration
│   │   ├── functions.js         # Utility functions
│   │   ├── App.js               # Main application component
│   │   └── index.js             # Application entry point
│   ├── Dockerfile               # Frontend Docker configuration
│   ├── .env.example             # Environment template
│   └── package.json
├── server/                       # Express.js backend
│   ├── config/
│   │   └── db.js               # Database connection with retry logic
│   ├── models/
│   │   └── Upload.js           # MongoDB upload schema (enhanced)
│   ├── routes/
│   │   ├── pinata.js           # Pinata IPFS upload endpoint
│   │   └── upload.js           # Upload CRUD routes
│   ├── Dockerfile              # Backend Docker configuration
│   ├── .env.example            # Environment template
│   ├── .eslintrc.json          # ESLint configuration
│   ├── server.js               # Server entry point
│   └── package.json
├── db/                          # Database configuration
│   └── docker-compose.yml      # MongoDB Docker setup
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── docker-compose.yml          # Unified stack orchestration
├── .prettierrc                 # Code formatting rules
├── API.md                      # API documentation
├── CONTRIBUTING.md             # Contribution guidelines
├── CHANGELOG.md                # Version history
└── README.md

```

## 🔧 API Documentation

### Backend Endpoints

#### IPFS Upload
**POST** `/api/upload/ipfs`

Upload a file to IPFS via the backend (API keys secured server-side).

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "success": true,
  "message": "File uploaded to IPFS successfully",
  "data": {
    "IpfsHash": "QmYourIPFSHashHere",
    "PinSize": 123456,
    "Timestamp": "2026-01-09T..."
  }
}
```

#### Save Upload Record
**POST** `/api/upload`

Store upload metadata after successful IPFS upload and blockchain transaction.

**Request Body:**
```json
{
  "cid": "QmYourIPFSHashHere",
  "fileName": "document.pdf",
  "fileSize": 123456,
  "fileType": "application/pdf",
  "walletAddress": "0x1234...abcd",
  "transactionHash": "0xabcd...1234"
}
```

#### Get Upload by CID
**GET** `/api/upload/cid/:cid`

Retrieve upload record by IPFS CID.

#### Get Uploads by Wallet
**GET** `/api/upload/wallet/:address?limit=10&skip=0`

Retrieve all uploads for a wallet address with pagination.

#### Get All Uploads
**GET** `/api/upload?limit=10&skip=0`

Retrieve all uploads with pagination.

#### Health Check
**GET** `/health`

Check server and database status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-09T...",
  "uptime": 123.45,
  "database": "connected",
  "environment": "development"
}
```

📖 **See [API.md](API.md) for complete API documentation with examples.**

## 🔐 Security Features

- **Backend API Key Protection**: Pinata API keys stored securely on backend
- **File Validation**: Strict file type and size validation
- **Input Sanitization**: Server-side validation and sanitization
- **HTTP Security**: Helmet middleware for secure HTTP headers
- **Rate Limiting**: Protection against brute-force and DoS attacks (configurable)
- **CORS Configuration**: Configurable allowed origins
- **Error Handling**: Comprehensive error handling without information leakage
- **Transaction Verification**: Blockchain transaction confirmation
- **Atomic Operations**: Database records created only after blockchain confirmation
- **Memory Management**: Proper cleanup of file objects and URLs
- **CID Validation**: Robust validation for both CIDv0 and CIDv1 formats

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - UI framework
- **Ethers.js 6.13.3** - Ethereum library
- **Web3 4.13.0** - Web3 provider
- **React Dropzone 14.2.9** - File upload interface
- **Axios 1.7.7** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js 4.21.1** - Web framework
- **Helmet** - Security headers
- **Express Rate Limit** - Request limiting
- **Mongoose 8.7.1** - MongoDB ODM
- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing

### Database
- **MongoDB** - Document database
- **Docker** - Containerization

### External Services
- **Pinata** - IPFS pinning service
- **MetaMask** - Ethereum wallet
- **IPFS** - Distributed file system

## 🧪 File Upload Flow

1. **File Selection**: User selects or drops a file (PDF, PNG, JPEG)
2. **Validation**: Client-side validation for file type and size (max 100MB)
3. **Wallet Connection**: MetaMask connection required
4. **IPFS Upload**: File uploaded to IPFS via Pinata API
5. **Blockchain Transaction**: IPFS hash stored on blockchain
6. **Database Storage**: CID saved to MongoDB
7. **Confirmation**: User receives transaction hash and IPFS link

## 🔍 Supported File Types

- **PDF** (`application/pdf`)
- **PNG** (`image/png`)
- **JPEG** (`image/jpeg`)

**File Size Limit**: 100 MB

## 🚨 Error Handling

The application includes comprehensive error handling for:

- Invalid file types or sizes
- Network connectivity issues
- MetaMask connection failures
- Transaction rejections
- IPFS upload failures
- Database connection errors
- API rate limiting

## 🧰 Development Scripts

### Frontend (app/)
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Backend (server/)
```bash
npm start          # Start server with nodemon
```

### Database (db/)
```bash
docker-compose up -d     # Start MongoDB container
docker-compose down      # Stop MongoDB container
docker-compose logs      # View container logs
```

## 🌐 Environment Variables

### Required Frontend Variables
- `REACT_APP_PINATA_API_KEY` - Pinata API key
- `REACT_APP_PINATA_SECRET_API_KEY` - Pinata secret key
- `REACT_APP_PINATA_GATEWAY_URL` - IPFS gateway URL
- `REACT_APP_SERVER_URL` - Backend server URL

### Required Backend Variables
- `PORT` - Server port (default: 5001)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)

### Required Database Variables
- `MONGO_INITDB_ROOT_USERNAME` - MongoDB root username
- `MONGO_INITDB_ROOT_PASSWORD` - MongoDB root password

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Pinata](https://pinata.cloud/) for IPFS pinning services
- [MetaMask](https://metamask.io/) for Web3 wallet integration
- [IPFS](https://ipfs.io/) for decentralized storage protocol
- [Ethereum](https://ethereum.org/) for blockchain infrastructure

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for the decentralized web**