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
    const retryDelay = 3000; // 3 seconds

    // MongoDB connection options
    const options = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    };

    while (attempts < maxAttempts) {
        try {
            await mongoose.connect(mongoURI, options);
            console.log('MongoDB connected successfully');
            break; // Exit loop on successful connection
        } catch (error) {
            attempts++;
            console.error(`Error connecting to MongoDB (attempt ${attempts}/${maxAttempts}):`, error.message);

            if (attempts >= maxAttempts) {
                console.error('Max connection attempts reached, exiting...');
                process.exit(1);
            }

            // Delay between retries
            console.log(`Retrying in ${retryDelay / 1000} seconds...`);
            await new Promise(res => setTimeout(res, retryDelay));
        }
    }

    // Connection event listeners
    mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
        console.error('Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('Mongoose disconnected from MongoDB');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('Mongoose connection closed due to application termination');
        process.exit(0);
    });
};

module.exports = connectDB;

