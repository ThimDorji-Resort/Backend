
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  roomsBooked: { type: Number, required: true } // Track number of rooms booked in this booking
});

const roomSchema = new mongoose.Schema({
  roomType: { type: String, required: true },
  numberOfRooms: { type: Number, required: true }, // total rooms available of this type
  size: { type: Number, required: true },
  beds: { type: Number, required: true },
  occupancy: { type: Number, required: true }, // max people per room
  location: { type: String, required: true },
  roomDetails: { type: String, required: true },
  roomFeatures: { type: String },
  bathroomAmenities: { type: String },
  optional: { type: String },
  images: [{ type: String }],

  // 💰 Added price field
  price: { type: Number, required: true }, // price per night or per room

  status: {
    type: String,
    enum: ['available', 'booked'],
    default: 'available'
  },

  bookings: [bookingSchema]

}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
