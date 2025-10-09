
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create new booking (user)
router.post('/book-rooms', bookingController.createBooking);

// Admin confirms booking
router.put('/confirm/:bookingId', bookingController.confirmBooking);
router.get('/pending', bookingController.getPendingBookings);
router.get('/confirmed', bookingController.getConfirmedBookings);
router.get('/search/:bookingNumber', bookingController.getBookingByNumber);
// Check-In route
router.put('/checkin/:bookingId', bookingController.checkInBooking);
// Get all bookings that are checked in
router.get('/checked-in', bookingController.getCheckedInBookings);
module.exports = router;
