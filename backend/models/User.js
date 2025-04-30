const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    profilePicture: {
        type: String, // URL to the profile picture
        default: '', // Optional: Default value if no profile picture is provided
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Standard User', 'Organizer', 'System Admin'], // Allowed roles
        default: 'Standard User', // Default role
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;