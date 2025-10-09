
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true // ensures no duplicate booking numbers
  },

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  country: { type: String, required: true },
  phoneNumber: { type: String, required: true },

  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },

  rooms: [
    {
      roomType: { type: String, required: true },
      quantity: { type: Number, required: true }, // Number of rooms booked
      pricePerNight: { type: Number, required: true }, // Price per room per night
    }
  ],

  meals: [{ type: String }], // breakfast, lunch, dinner
  specialRequest: { type: String },

  totalPrice: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected','checked_in', 'checked_out'],
    default: 'pending'
  },
assignedRoom: { type: String, default: null } ,
  transactionNumber: { type: String }, 
}, { timestamps: true }); // automatically adds createdAt and updatedAt

module.exports = mongoose.model('Booking', bookingSchema);
