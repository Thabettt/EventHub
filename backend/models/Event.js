const mongoose = require('mongoose');

// Define the Event schema
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String, // URL to the event image
        default: '', // Optional: Default value if no image is provided
    },
    ticketPrice: {
        type: Number,
        required: true,
        min: 0, // Ticket price cannot be negative
    },
    totalTickets: {
        type: Number,
        required: true,
        min: 0, // Total tickets cannot be negative
    },
    remainingTickets: {
        type: Number,
        required: true,
        min: 0, // Remaining tickets cannot be negative
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model (Organizer)
        required: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create the Event model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;