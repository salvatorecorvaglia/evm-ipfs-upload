# Contributing to EVM IPFS Upload

Thank you for your interest in contributing to the EVM IPFS Upload project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js v14 or higher
- npm or yarn
- Docker and Docker Compose (for full stack development)
- MetaMask browser extension
- Pinata account with API keys

### Setup

1. **Fork and clone the repository:**

```bash
git clone https://github.com/YOUR_USERNAME/evm-ipfs-upload.git
cd evm-ipfs-upload
```

2. **Set up environment variables:**

Copy the example environment files and fill in your values:

```bash
# Frontend
cp app/.env.example app/.env

# Backend
cp server/.env.example server/.env
```

3. **Install dependencies:**

```bash
# Frontend
cd app
npm install

# Backend
cd ../server
npm install
```

4. **Start development servers:**

```bash
# Database (from root directory)
cd db
docker-compose up -d

# Backend (from server directory)
cd ../server
npm start

# Frontend (from app directory)
cd ../app
npm start
```

## Development Workflow

1. **Create a feature branch:**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes:**

- Write clean, readable code
- Follow the coding standards
- Add tests for new features
- Update documentation as needed

3. **Test your changes:**

```bash
# Run linting
npm run lint

# Run tests
npm test

# Format code
npm run format
```

4. **Commit your changes:**

```bash
git add .
git commit -m "feat: add new feature"
```

5. **Push to your fork:**

```bash
git push origin feature/your-feature-name
```

6. **Create a Pull Request**

## Coding Standards

### JavaScript/React

- Use ES6+ features
- Use functional components with hooks for React
- Follow the Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic

### File Structure

```
app/src/
├── api/          # API integration functions
├── components/   # React components
├── connections/  # Blockchain/wallet connections
├── constants.js  # Application constants
├── config.js     # Configuration
└── styles/       # CSS files

server/
├── config/       # Configuration files
├── models/       # Mongoose models
├── routes/       # Express routes
└── server.js     # Entry point
```

### Naming Conventions

- **Components:** PascalCase (e.g., `UploadIPFSPinata.js`)
- **Functions:** camelCase (e.g., `connectToMetamask`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Files:** camelCase for utilities, PascalCase for components
- **CSS Classes:** kebab-case (e.g., `upload-button`)

### Code Quality

- Use ESLint to catch errors and enforce style
- Use Prettier for consistent formatting
- Avoid deeply nested code
- Handle errors gracefully
- Validate all inputs
- Use TypeScript if adding new major features (optional but recommended)

## Commit Messages

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(upload): add progress bar for file uploads

fix(api): handle pinata upload timeout errors

docs(readme): update installation instructions

refactor(components): simplify UploadIPFSPinata state management
```

## Pull Request Process

1. **Update documentation:**
   - Update README.md if needed
   - Update API.md for API changes
   - Add inline code comments

2. **Ensure all tests pass:**
   - Run `npm test` in both frontend and backend
   - Manually test the feature

3. **Update the CHANGELOG:**
   - Add an entry describing your changes

4. **Code review:**
   - Respond to reviewer feedback
   - Make requested changes
   - Keep the PR focused on a single feature/fix

5. **Merge requirements:**
   - All CI checks pass
   - At least one approval from maintainers
   - No unresolved conversations

## Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd app
npm test
```

### Manual Testing Checklist

- [ ] File upload works for PDF, PNG, and JPEG
- [ ] File size validation (100 MB limit)
- [ ] MetaMask connection/disconnection
- [ ] Blockchain transaction succeeds
- [ ] Database record created
- [ ] IPFS link accessible
- [ ] Error messages display correctly
- [ ] Progress bar shows upload progress

## Common Issues

### MetaMask Not Connecting

- Ensure MetaMask is installed
- Check that you're on a supported network
- Try refreshing the page

### Upload Fails

- Check Pinata API keys are correctly configured
- Verify file size is under 100 MB
- Check file type is supported

### Database Connection Errors

- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- Verify database credentials

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing! 🎉
