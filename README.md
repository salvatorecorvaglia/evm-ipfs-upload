# Document Upload with IPFS and MetaMask

The workflow should be as follows:

- File Upload: The user uploads a file through a React application (or other) connected to MetaMask for authentication.


- IPFS Storage: The file is uploaded to IPFS, which returns a CID hash.


- Metadata Storage: The CID hash, along with metadata such as the file name, description, and timestamp, is stored in MongoDB.


- Blockchain Transaction: The user signs a transaction via MetaMask that stores the CID hash on a Blockchain (e.g., Ethereum), ensuring proof of ownership and the immutability of the file.


- Retrieval: The app can use MongoDB to search for the file using the metadata and then retrieve the file from IPFS using the CID hash.