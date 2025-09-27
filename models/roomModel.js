const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomType: { type: String, required: true },
    numberOfRooms: { type: Number, required: true },
    size: { type: Number, required: true },
    beds: { type: String, required: true },
    occupancy: { type: Number, required: true },
    location: { type: String, required: true },
    roomDetails: { type: String, required: true },
    roomFeatures: { type: String },
    bathroomAmenities: { type: String },
    optional: { type: String },
    images: [{ type: String }] // store image file paths
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
