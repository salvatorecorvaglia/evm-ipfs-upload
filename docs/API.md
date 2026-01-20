# API Documentation

This document provides detailed information about the backend API endpoints for the EVM IPFS Upload application.

## Base URL

```
http://localhost:5001
```

---

## Health Check

### GET `/health`

Check the health status of the server and database connection.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-09T15:00:00.000Z",
  "uptime": 123.456,
  "database": "connected",
  "environment": "development"
}
```

**Status Codes:**
- `200 OK` - Server and database are healthy
- `503 Service Unavailable` - Database is disconnected

---

## IPFS Upload

### POST `/api/upload/ipfs`

Upload a file to IPFS via Pinata (server-side).

**Authentication:** None required (API keys are handled server-side)

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with a `file` field

**Supported File Types:**
- PDF (`application/pdf`)
- PNG (`image/png`)
- JPEG (`image/jpeg`)

**File Size Limit:** 100 MB

**Example Request (using curl):**

```bash
curl -X POST http://localhost:5001/api/upload/ipfs \
  -F "file=@/path/to/your/file.pdf"
```

**Response:**

```json
{
  "success": true,
  "message": "File uploaded to IPFS successfully",
  "data": {
    "IpfsHash": "QmYourIPFSHashHere",
    "PinSize": 123456,
    "Timestamp": "2026-01-09T15:00:00.000Z"
  }
}
```

**Error Responses:**

400 Bad Request - Invalid file type or no file:
```json
{
  "success": false,
  "message": "No file provided"
}
```

500 Internal Server Error - Server configuration error or upload failed:
```json
{
  "success": false,
  "message": "Failed to upload file to IPFS"
}
```

---

## Upload Records

### POST `/api/upload`

Save upload metadata to the database after successful IPFS upload and blockchain transaction.

**Request:**
- Content-Type: `application/json`

**Body:**

```json
{
  "cid": "QmYourIPFSHashHere",
  "fileName": "document.pdf",
  "fileSize": 123456,
  "fileType": "application/pdf",
  "walletAddress": "0x1234567890abcdef",
  "transactionHash": "0xabcdef1234567890"
}
```

**Required Fields:**
- `cid` (string) - IPFS Content Identifier

**Optional Fields:**
- `fileName` (string) - Original file name
- `fileSize` (number) - File size in bytes
- `fileType` (string) - MIME type of the file
- `walletAddress` (string) - Ethereum wallet address
- `transactionHash` (string) - Blockchain transaction hash

**Response:**

```json
{
  "success": true,
  "message": "Upload record created successfully",
  "upload": {
    "_id": "507f1f77bcf86cd799439011",
    "cid": "QmYourIPFSHashHere",
    "fileName": "document.pdf",
    "fileSize": 123456,
    "fileType": "application/pdf",
    "walletAddress": "0x1234567890abcdef",
    "transactionHash": "0xabcdef1234567890",
    "createdAt": "2026-01-09T15:00:00.000Z",
    "updatedAt": "2026-01-09T15:00:00.000Z"
  }
}
```

**Error Responses:**

400 Bad Request - Validation error:
```json
{
  "success": false,
  "errors": [
    {
      "msg": "CID is required",
      "param": "cid",
      "location": "body"
    }
  ]
}
```

409 Conflict - CID already exists:
```json
{
  "success": false,
  "message": "CID already exists"
}
```

---

### GET `/api/upload/cid/:cid`

Retrieve upload record by CID.

**Parameters:**
- `cid` (path parameter) - The IPFS Content Identifier

**Example Request:**

```bash
curl http://localhost:5001/api/upload/cid/QmYourIPFSHashHere
```

**Response:**

```json
{
  "success": true,
  "upload": {
    "_id": "507f1f77bcf86cd799439011",
    "cid": "QmYourIPFSHashHere",
    "fileName": "document.pdf",
    "createdAt": "2026-01-09T15:00:00.000Z",
    "updatedAt": "2026-01-09T15:00:00.000Z"
  }
}
```

**Error Responses:**

404 Not Found:
```json
{
  "success": false,
  "message": "Upload not found"
}
```

---

### GET `/api/upload/wallet/:address`

Retrieve all uploads for a specific wallet address with pagination.

**Parameters:**
- `address` (path parameter) - Ethereum wallet address

**Query Parameters:**
- `limit` (optional, number) - Number of results per page (1-100, default: 10)
- `skip` (optional, number) - Number of results to skip (default: 0)

**Example Request:**

```bash
curl "http://localhost:5001/api/upload/wallet/0x1234567890abcdef?limit=20&skip=0"
```

**Response:**

```json
{
  "success": true,
  "uploads": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "cid": "QmYourIPFSHashHere",
      "walletAddress": "0x1234567890abcdef",
      "createdAt": "2026-01-09T15:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "skip": 0,
    "hasMore": true
  }
}
```

---

### GET `/api/upload`

Retrieve all uploads with pagination.

**Query Parameters:**
- `limit` (optional, number) - Number of results per page (1-100, default: 10)
- `skip` (optional, number) - Number of results to skip (default: 0)

**Example Request:**

```bash
curl "http://localhost:5001/api/upload?limit=10&skip=0"
```

**Response:**

```json
{
  "success": true,
  "uploads": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "cid": "QmYourIPFSHashHere",
      "createdAt": "2026-01-09T15:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "skip": 0,
    "hasMore": true
  }
}
```

---

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `403 Forbidden` - CORS policy violation
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Database unavailable

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window:** 15 minutes (configurable via `RATE_LIMIT_WINDOW_MS`)
- **Max Requests:** 100 per IP (configurable via `RATE_LIMIT_MAX_REQUESTS`)

When rate limit is exceeded:

```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

---

## CORS Policy

The server supports Cross-Origin Resource Sharing (CORS). Allowed origins can be configured via the `ALLOWED_ORIGINS` environment variable (comma-separated list).

Default allowed origin: `http://localhost:3000`

CORS error response:

```json
{
  "message": "The CORS policy for this site does not allow access from the specified Origin."
}
```

---

## Security

- **Helmet.js** - Sets secure HTTP headers
- **Rate Limiting** - Prevents brute-force attacks
- **Input Validation** - All inputs are validated using express-validator
- **API Key Protection** - Pinata API keys are stored server-side only
- **CID Validation** - Ensures valid IPFS CIDv0 and CIDv1 formats

---

## Examples

### Complete Upload Flow

1. **Upload file to IPFS:**

```javascript
const formData = new FormData();
formData.append('file', fileObject);

const ipfsResponse = await fetch('http://localhost:5001/api/upload/ipfs', {
  method: 'POST',
  body: formData
});

const { data } = await ipfsResponse.json();
// data.IpfsHash contains the CID
```

2. **Create blockchain transaction** (frontend with ethers.js):

```javascript
const transaction = await signer.sendTransaction({
  to: walletAddress,
  data: ethers.toUtf8Bytes(data.IpfsHash)
});

const receipt = await transaction.wait();
```

3. **Save metadata to database:**

```javascript
const dbResponse = await fetch('http://localStorage:5001/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cid: data.IpfsHash,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    walletAddress: walletAddress,
    transactionHash: transaction.hash
  })
});
```

---

## Support

For issues or questions, please open an issue in the GitHub repository.
