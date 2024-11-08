const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
    cid: {
        type: String,
        required: true,
        unique: true, // Ensure 'cid' is unique
        index: true,  // Index the 'cid' field for better performance
        validate: {
            validator: function(v) {
                // Validate that the CID follows the expected format (you can adjust this regex based on the CID structure)
                return /^[a-zA-Z0-9]+$/.test(v);
            },
            message: props => `${props.value} is not a valid CID!`
        },
    },
}, {
    timestamps: true, // Automatically creates 'createdAt' and 'updatedAt'
});

// Export the model
module.exports = mongoose.model('Upload', UploadSchema);
