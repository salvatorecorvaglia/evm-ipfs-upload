// Function to convert hex to a byte array
export function hexToByteArray(hex) {
    // Validate input
    if (typeof hex !== 'string' || hex.length % 2 !== 0) {
        throw new Error('Invalid hexadecimal string');
    }

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        // Parse hex pairs directly into the byte array
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
}

// Function to decode a hexadecimal string to UTF-8
export function decodeHexToUTF8(hex) {
    // Validate input
    if (typeof hex !== 'string') {
        throw new Error('Input must be a string');
    }

    const byteArray = hexToByteArray(hex);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(byteArray);
}

// Mask address
export const maskAddress = (address) => {
    if (!address) return '';
    const start = address.substring(0, 5); // First 5 characters
    const end = address.substring(address.length - 4); // Last 4 characters
    return `${start}...${end}`;
};

