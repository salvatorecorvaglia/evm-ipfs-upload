# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of EVM IPFS Upload seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via:
- Email: [your-email@example.com] (replace with actual contact)
- Or create a private security advisory on GitHub

Include the following information in your report:
- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- You should receive an acknowledgment within 48 hours of your report
- We will investigate the issue and confirm whether it's a vulnerability
- If confirmed, we will work on a fix and release it as soon as possible
- We will credit you for the discovery (unless you prefer to remain anonymous)

## Security Best Practices

### For Developers

1. **API Keys Protection**
   - Never commit API keys to the repository
   - Always use environment variables for sensitive data
   - Keep `.env` files in `.gitignore`

2. **Dependencies**
   - Regularly update npm packages: `npm audit fix`
   - Review security advisories for dependencies
   - Use `npm audit` to check for vulnerabilities

3. **Code Review**
   - All code changes should be reviewed before merging
   - Pay special attention to input validation and sanitization
   - Review error messages to avoid information leakage

4. **Input Validation**
   - Validate all user inputs on both client and server side
   - Sanitize file names and content
   - Implement rate limiting to prevent abuse

### For Users

1. **Wallet Security**
   - Never share your private keys or seed phrases
   - Use hardware wallets for large amounts of cryptocurrency
   - Verify the application URL before connecting MetaMask
   - Be cautious of phishing attempts

2. **File Upload**
   - Only upload files you trust
   - Be aware of file size limits
   - Remember that files uploaded to IPFS are public and permanent

3. **Environment Setup**
   - Keep your browser and MetaMask extension updated
   - Use strong, unique passwords for your wallet
   - Enable 2FA where applicable

## Known Security Considerations

### IPFS Public Nature
- All files uploaded to IPFS are **publicly accessible**
- Files are **permanent** and difficult to remove once pinned
- Do not upload sensitive or private information

### Smart Contract Interactions
- This application stores IPFS hashes on the blockchain via transactions
- Transactions are permanent and public
- Ensure you're connected to the correct network before transacting

### API Rate Limiting
- The backend implements rate limiting to prevent abuse
- Default: 100 requests per 15 minutes per IP
- Can be configured via environment variables

## Security Features

- ✅ Helmet.js for HTTP security headers
- ✅ CORS configuration with allowed origins
- ✅ Rate limiting to prevent brute-force attacks
- ✅ Input validation and sanitization
- ✅ File type and size validation
- ✅ API keys secured on backend
- ✅ Error handling without information leakage
- ✅ MongoDB injection prevention via Mongoose
- ✅ Request logging for audit trails

## Security Audit

This project has not yet undergone a formal security audit. Users should be aware of this and use caution when deploying in production environments.

## Compliance

This project aims to comply with:
- OWASP Top 10 security best practices
- Node.js security best practices
- React security best practices

## Updates

Security updates will be released as needed and documented in the [CHANGELOG](CHANGELOG.md).

## Contact

For security-related questions or concerns, please contact:
- Security Team: [security@example.com] (replace with actual contact)
- Project Maintainer: [maintainer@example.com] (replace with actual contact)

---

**Last Updated:** January 2026
