# EVM IPFS Upload - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Technology Stack](#technology-stack)
5. [Security Architecture](#security-architecture)
6. [Database Schema](#database-schema)
7. [API Design](#api-design)
8. [Deployment Architecture](#deployment-architecture)

---

## System Overview

EVM IPFS Upload is a full-stack decentralized application (dApp) that enables users to upload files to IPFS (InterPlanetary File System) via Pinata, record the transaction on an EVM-compatible blockchain (Ethereum), and store metadata in MongoDB.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  ┌───────────────────┐              ┌──────────────────┐   │
│  │   React Frontend  │              │    MetaMask      │   │
│  │   (Port 3000)     │◄────────────►│   Extension      │   │
│  └───────┬───────────┘              └──────────────────┘   │
└──────────┼──────────────────────────────────────────────────┘
           │
           │ HTTP/HTTPS
           │
┌──────────▼──────────────────────────────────────────────────┐
│                   Backend Server (Node.js)                   │
│                       Port 5001                              │
│  ┌─────────────┐  ┌────────────┐  ┌─────────────────────┐ │
│  │   Routes    │  │ Middleware │  │   Controllers       │ │
│  │  - Upload   │  │  - Helmet  │  │   - Validation      │ │
│  │  - Pinata   │  │  - CORS    │  │   - Error Handler   │ │
│  │  - Health   │  │  - Limiter │  │   - Request Logger  │ │
│  └─────────────┘  └────────────┘  └─────────────────────┘ │
└──────────┬──────────────────┬───────────────────────────────┘
           │                  │
           │                  │
   ┌───────▼────────┐  ┌──────▼────────┐
   │    MongoDB     │  │  Pinata IPFS  │
   │  (Port 27017)  │  │   Cloud API   │
   └────────────────┘  └───────────────┘
           │
           │
   ┌───────▼────────────────────────┐
   │  Ethereum Blockchain Network   │
   │  (via MetaMask RPC)            │
   └────────────────────────────────┘
```

---

## Component Architecture

### Frontend (React Application)

```
app/
├── src/
│   ├── components/
│   │   ├── UploadIPFSPinata.js    # Main upload component
│   │   ├── ErrorBoundary.js        # Error handling wrapper
│   │   └── ...
│   ├── hooks/
│   │   └── useWallet.js            # Wallet management hook
│   ├── api/
│   │   └── PinataAPI.js            # Backend API client
│   ├── connections/
│   │   └── MetamaskConnect.js      # MetaMask integration
│   ├── utils/
│   │   └── validation.js           # Client-side validation
│   ├── styles/                     # CSS files
│   └── App.js                      # Root component
```

**Key Responsibilities:**
- User interface and interaction
- MetaMask wallet connection and management
- File selection and validation (client-side)
- Progress tracking
- Error handling and user feedback

### Backend (Express.js Server)

```
server/
├── routes/
│   ├── pinata.js       # IPFS upload endpoint
│   └── upload.js       # MongoDB CRUD operations
├── models/
│   └── Upload.js       # Mongoose schema
├── middleware/
│   ├── errorHandler.js # Centralized error handling
│   └── requestLogger.js# Request logging and tracking
├── config/
│   └── db.js           # MongoDB connection
└── server.js           # Application entry point
```

**Key Responsibilities:**
- API endpoints for frontend
- Secure API key management (Pinata)
- File validation (server-side)
- IPFS upload via Pinata
- Database operations
- Security middleware (Helmet, CORS, Rate Limiting)

### Database (MongoDB)

**Schema Design:**
```javascript
Upload {
  cid: String (unique, indexed),
  fileName: String,
  fileSize: Number,
  fileType: String,
  walletAddress: String (indexed, lowercase),
  transactionHash: String (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `cid`: Unique index for fast CID lookups
- `walletAddress`: Index for user's uploads query
- `transactionHash`: Index for transaction-based queries
- Compound index: `(walletAddress, createdAt)` for user history

---

## Data Flow

### Upload Flow (Detailed)

```
1. User Selects File
   ├─> Frontend validates file (type, size)
   └─> File preview shown

2. User Connects Wallet
   ├─> MetaMask prompts for permission
   ├─> Frontend retrieves wallet address
   └─> UI updates to show connected state

3. User Initiates Upload
   ├─> Frontend sends file to backend
   │   └─> POST /api/upload/ipfs
   │
   ├─> Backend Validation
   │   ├─> File type check (PDF, PNG, JPEG)
   │   ├─> File size check (max 100MB)
   │   └─> File name sanitization
   │
   ├─> Backend uploads to Pinata
   │   ├─> Retry logic (2 attempts)
   │   ├─> Progress tracking
   │   └─> Returns IPFS CID (hash)
   │
   └─> Frontend receives CID

4. Blockchain Transaction
   ├─> Frontend creates transaction
   │   └─> To: user's own address
   │   └─> Data: IPFS CID (UTF-8 bytes)
   │
   ├─> MetaMask prompts for signature
   ├─> Transaction sent to network
   └─> Wait for confirmation

5. Database Storage
   ├─> Frontend sends metadata to backend
   │   └─> POST /api/upload
   │
   ├─> Backend saves to MongoDB
   │   ├─> cid: IPFS hash
   │   ├─> fileName: original filename
   │   ├─> fileSize: file size in bytes
   │   ├─> fileType: MIME type
   │   ├─> walletAddress: user wallet
   │   └─> transactionHash: blockchain tx
   │
   └─> Success response to frontend

6. Completion
   └─> User can view file on IPFS gateway
```

### Query Flow

```
GET /api/upload/cid/:cid
  └─> Retrieve single upload by IPFS CID

GET /api/upload/wallet/:address
  └─> Retrieve all uploads for a wallet
      └─> Supports pagination (limit, skip)

GET /api/upload
  └─> Retrieve all uploads (admin view)
      └─> Supports pagination
```

---

## Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| Ethers.js | 6.13.3 | Ethereum library for blockchain interaction |
| Web3 | 4.13.0 | Alternative Web3 provider |
| Axios | 1.7.7 | HTTP client for API requests |
| React Dropzone | 14.2.9 | File upload interface |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | Runtime environment |
| Express.js | 4.21.1 | Web framework |
| Mongoose | 8.7.1 | MongoDB ODM |
| Helmet | 8.1.0 | Security headers |
| Express Rate Limit | 8.2.1 | Request rate limiting |
| Multer | 2.0.2 | File upload handling |
| Morgan | 1.10.0 | HTTP request logging |

### Infrastructure
- **Database**: MongoDB (latest)
- **IPFS Service**: Pinata Cloud
- **Blockchain**: Ethereum (or any EVM-compatible chain)
- **Containerization**: Docker & Docker Compose

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────┐
│  Layer 1: Client-Side Validation    │
│  - File type/size checks            │
│  - Wallet address validation        │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│  Layer 2: Network Security          │
│  - HTTPS (production)               │
│  - CORS with allowed origins        │
│  - Rate limiting                    │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│  Layer 3: Application Security      │
│  - Helmet security headers          │
│  - Input validation & sanitization  │
│  - Error handling (no info leakage) │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│  Layer 4: Data Security             │
│  - API keys on backend only         │
│  - MongoDB injection prevention     │
│  - Wallet address validation        │
└─────────────────────────────────────┘
```

### Security Features

1. **Input Validation**
   - Client-side: File type, size, format
   - Server-side: Re-validation of all inputs
   - Sanitization: File names, addresses, CIDs

2. **Authentication & Authorization**
   - MetaMask for wallet authentication
   - Wallet ownership verification via signatures
   - No traditional user/password system

3. **API Security**
   - Pinata API keys stored server-side only
   - Environment variables for sensitive data
   - Never exposed to client

4. **Rate Limiting**
   - Default: 100 requests per 15 minutes
   - Configurable via environment variables
   - Prevents brute-force and DoS attacks

5. **Error Handling**
   - Centralized error middleware
   - Safe error messages (no stack traces in prod)
   - Request ID tracking for debugging

---

## Database Schema

### Upload Collection

```javascript
{
  _id: ObjectId("..."),
  cid: "QmX...", // IPFS CID (unique)
  fileName: "document.pdf",
  fileSize: 1234567, // bytes
  fileType: "application/pdf",
  walletAddress: "0x1234...abcd", // lowercase
  transactionHash: "0xabcd...1234",
  createdAt: ISODate("2026-01-19T..."),
  updatedAt: ISODate("2026-01-19T...")
}
```

### Virtual Fields

```javascript
{
  ipfsUrl: "https://gateway.pinata.cloud/ipfs/QmX...",
  explorerUrl: "https://etherscan.io/tx/0xabcd..."
}
```

---

## API Design

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/ipfs` | Upload file to IPFS |
| POST | `/api/upload` | Save upload metadata |
| GET | `/api/upload/cid/:cid` | Get upload by CID |
| GET | `/api/upload/wallet/:address` | Get uploads by wallet |
| GET | `/api/upload` | Get all uploads (paginated) |
| GET | `/health` | Health check endpoint |

### Request/Response Examples

**Upload to IPFS:**
```http
POST /api/upload/ipfs
Content-Type: multipart/form-data

file: [binary data]

Response:
{
  "success": true,
  "message": "File uploaded to IPFS successfully",
  "data": {
    "IpfsHash": "QmX...",
    "PinSize": 1234567,
    "Timestamp": "2026-01-19T..."
  }
}
```

### Error Responses

```json
{
  "success": false,
  "error": "File size exceeds the maximum limit",
  "requestId": "req_1234567890_abcd1234",
  "timestamp": "2026-01-19T..."
}
```

---

## Deployment Architecture

### Docker Compose Stack

```yaml
services:
  - mongodb (port 27017)
  - backend (port 5001)
  - frontend (port 3000)
```

### Production Considerations

1. **Environment Variables**
   - Use secrets management (AWS Secrets Manager, etc.)
   - Never commit .env files

2. **Scaling**
   - Backend: Horizontal scaling with load balancer
   - Database: MongoDB replica set for redundancy
   - Frontend: CDN for static assets

3. **Monitoring**
   - Health check endpoint for uptime monitoring
   - Request logging for audit trails
   - Error tracking (consider Sentry)

4. **Backup & Recovery**
   - Regular MongoDB backups
   - IPFS content pinned on Pinata (redundant)
   - Blockchain data publicly available

---

## Design Decisions

### Why Pinata for IPFS?
- Managed service (no IPFS node maintenance)
- Reliable pinning service
- Good performance and uptime
- Simple API

### Why MongoDB?
- Flexible schema for metadata
- Fast queries with indexes
- Good developer experience
- Easy to scale

### Why Store on Blockchain?
- Immutable proof of upload
- Decentralized verification
- Timestamp verification
- Ownership proof

### Why Store in Database?
- Fast queries (vs. blockchain)
- Rich metadata
- Pagination support
- Better UX for listing uploads

---

## Future Enhancements

1. **Multi-chain Support**
   - Add support for Polygon, BSC, etc.
   - Network detection and switching

2. **File Encryption**
   - Optional client-side encryption
   - Encrypted IPFS storage

3. **NFT Minting**
   - Convert uploads to NFTs
   - Smart contract integration

4. **Advanced Search**
   - Full-text search
   - File type filtering
   - Date range queries

5. **Bulk Operations**
   - Multiple file upload
   - Batch metadata retrieval

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Maintainer:** [Your name/team]
