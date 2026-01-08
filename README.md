# EVM IPFS Upload

A full-stack decentralized application (dApp) that enables secure file uploads to IPFS via Pinata, stores transaction records on the blockchain, and maintains metadata in MongoDB. Built with React, Node.js, Express, and Web3 technologies.

## 🌟 Features

- **Decentralized File Storage**: Upload files to IPFS using Pinata's pinning service
- **Blockchain Integration**: Store file hashes on the blockchain using MetaMask transactions
- **Database Persistence**: Maintain file metadata in MongoDB
- **Drag & Drop Interface**: User-friendly file upload with drag-and-drop functionality
- **File Validation**: Support for PDF, PNG, and JPEG files with size limits
- **Wallet Integration**: Seamless MetaMask connection and account management
- **Transaction Tracking**: Monitor upload progress and transaction status
- **IPFS Gateway Access**: Direct links to view files on IPFS

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │    MongoDB      │
│                 │◄──►│                 │◄──►│                 │
│  - File Upload  │    │  - API Routes   │    │  - File CIDs    │
│  - MetaMask     │    │  - Validation   │    │  - Timestamps   │
│  - UI/UX        │    │  - Error Handle │    │                 │
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

### 1. Clone the Repository

```bash
git clone <repository-url>
cd evm-ipfs-upload
```

### 2. Environment Setup

Create environment files:

**Frontend (.env in /app directory):**
```env
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_API_KEY=your_pinata_secret_key
REACT_APP_PINATA_GATEWAY_URL=https://gateway.pinata.cloud
REACT_APP_SERVER_URL=http://localhost:5001
```

**Backend (.env in /server directory):**
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ipfs-upload
NODE_ENV=development
```

**Database (.env in /db directory):**
```env
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
```

### 3. Start the Database

```bash
cd db
docker-compose up -d
```

### 4. Install Dependencies & Start Services

**Backend Server:**
```bash
cd server
npm install
npm start
```

**Frontend Application:**
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
│   │   │   └── PinataAPI.js     # Pinata service integration
│   │   ├── components/
│   │   │   ├── UploadIPFSPinata.js  # Main upload component
│   │   │   └── UploadIPFSNode.js    # Alternative IPFS node component
│   │   ├── connections/
│   │   │   └── MetamaskConnect.js   # MetaMask wallet integration
│   │   ├── nodes/
│   │   │   └── IPFSNode.js      # IPFS node configuration
│   │   ├── styles/              # CSS stylesheets
│   │   ├── App.js               # Main application component
│   │   ├── config.js            # Configuration constants
│   │   ├── functions.js         # Utility functions
│   │   └── index.js             # Application entry point
│   └── package.json
├── server/                       # Express.js backend
│   ├── config/
│   │   └── db.js               # Database connection
│   ├── models/
│   │   └── Upload.js           # MongoDB upload schema
│   ├── routes/
│   │   └── upload.js           # Upload API routes
│   ├── server.js               # Server entry point
│   └── package.json
├── db/                          # Database configuration
│   └── docker-compose.yml      # MongoDB Docker setup
└── README.md
```

## 🔧 API Documentation

### Upload Endpoint

**POST** `/api/upload`

Stores file CID after successful IPFS upload and blockchain transaction.

**Request Body:**
```json
{
  "cid": "QmYourIPFSHashHere"
}
```

**Response:**
```json
{
  "message": "Upload record created successfully",
  "upload": {
    "_id": "...",
    "cid": "QmYourIPFSHashHere",
    "createdAt": "2025-10-09T...",
    "updatedAt": "2025-10-09T..."
  }
}
```

### Health Check

**GET** `/health`

Returns server status.

**Response:**
```json
{
  "message": "Server is healthy"
}
```

## 🔐 Security Features

- **File Validation**: Strict file type and size validation
- **API Key Protection**: Environment-based API key management
- **Input Sanitization**: Server-side validation and sanitization
- **HTTP Security**: Helmet middleware for secure HTTP headers
- **Rate Limiting**: Protection against brute-force and DoS attacks
- **Error Handling**: Comprehensive error handling and user feedback
- **Transaction Verification**: Blockchain transaction confirmation
- **Atomic Operations**: Database records created only after guaranteed blockchain transaction
- **Memory Management**: Proper cleanup of file objects and URLs

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