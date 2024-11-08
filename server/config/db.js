const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;

    // Check if MONGO_URI is available
    if (!mongoURI) {
        console.error('Error: MONGO_URI is not defined in environment variables');
        process.exit(1); // Exit with failure code
    }

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        try {
            await mongoose.connect(mongoURI);
            console.log('MongoDB connected');
            break; // Exit loop on successful connection
        } catch (error) {
            attempts++;
            console.error(`Error connecting to MongoDB (attempt ${attempts}):`, error.message);

            if (attempts >= maxAttempts) {
                console.error('Max connection attempts reached, exiting...');
                process.exit(1);
            }

            // Optional: add a delay between retries (e.g., 3 seconds)
            await new Promise(res => setTimeout(res, 3000));
        }
    }
};

module.exports = connectDB;
