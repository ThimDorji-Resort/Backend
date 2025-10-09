
// const Booking = require('../models/bookingModels');
// const Room = require('../models/roomModel');
// const nodemailer = require('nodemailer');

// // Admin email from .env
// const adminEmail = process.env.ADMIN_EMAIL;

// // Configure Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER, // Gmail used to send
//     pass: process.env.EMAIL_PASS
//   }
// });

// // ✅ Function to generate a simple sequential booking number
// const generateBookingNumber = async () => {
//   const lastBooking = await Booking.findOne().sort({ createdAt: -1 });
//   let nextNumber = 1001; // starting point
//   if (lastBooking && lastBooking.bookingNumber) {
//     const lastNum = parseInt(lastBooking.bookingNumber.replace('BKN', ''));
//     if (!isNaN(lastNum)) nextNumber = lastNum + 1;
//   }
//   return `BKN${nextNumber}`;
// };

// // ---------------------- Create Booking ----------------------
// exports.createBooking = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       country,
//       phone,
//       checkIn,
//       checkOut,
//       roomSelection,
//       meals,
//       specialRequest
//     } = req.body;

//     // Validate required fields
//     if (!firstName || !lastName || !email || !checkIn || !checkOut || !roomSelection || roomSelection.length === 0) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     const checkInDate = new Date(checkIn);
//     const checkOutDate = new Date(checkOut);
//     const numberOfNights = Math.ceil(Math.abs(checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

//     let totalPrice = 0;
//     const roomsWithPrice = [];

//     // Calculate total price (without changing room availability)
//     for (const item of roomSelection) {
//       const roomTypeDoc = await Room.findOne({ roomType: item.roomType });
//       if (!roomTypeDoc) return res.status(404).json({ message: `Room type ${item.roomType} not found` });

//       totalPrice += roomTypeDoc.price * item.roomsRequested * numberOfNights;

//       roomsWithPrice.push({
//         roomType: item.roomType,
//         quantity: item.roomsRequested,
//         pricePerNight: roomTypeDoc.price
//       });
//     }

//     // ✅ Generate simple sequential booking number
//     const bookingNumber = await generateBookingNumber();

//     // Save booking as pending
//     const booking = new Booking({
//       bookingNumber, // <-- added here
//       firstName,
//       lastName,
//       email,
//       country,
//       phoneNumber: phone,
//       checkIn,
//       checkOut,
//       rooms: roomsWithPrice,
//       meals,
//       specialRequest,
//       totalPrice,
//       status: 'pending'
//     });

//     await booking.save();

//     // Email to user (from Admin)
//     const userMailOptions = {
//       from: adminEmail,
//       to: email,
//       subject: 'Booking Request Received',
//       html: `
//         <p>Hi ${firstName},</p>
//         <p>Your booking request has been received and is awaiting admin approval.</p>
//         <p><strong>Booking No:</strong> ${bookingNumber}</p>
//         <p><strong>Total Price:</strong> $${totalPrice}</p>
//         <p><strong>Check-In:</strong> ${checkIn}</p>
//         <p><strong>Check-Out:</strong> ${checkOut}</p>
//         <p>Thank you for choosing our service!</p>
//       `
//     };

//     // Email to admin (from Gmail, replies to user)
//     const adminMailOptions = {
//       from: process.env.EMAIL_USER,
//       to: adminEmail,
//       replyTo: email,
//       subject: `New Booking Request from ${firstName} ${lastName}`,
//       html: `
//         <p><strong>New booking request details:</strong></p>
//         <p><strong>Booking No:</strong> ${bookingNumber}</p>
//         <p><strong>Name:</strong> ${firstName} ${lastName}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Phone:</strong> ${phone}</p>
//         <p><strong>Country:</strong> ${country}</p>
//         <p><strong>Check-In:</strong> ${checkIn}</p>
//         <p><strong>Check-Out:</strong> ${checkOut}</p>
//         <p><strong>Rooms:</strong></p>
//         <ul>
//           ${roomsWithPrice.map(r => `<li>${r.roomType} × ${r.quantity} (Price per night: $${r.pricePerNight})</li>`).join('')}
//         </ul>
//         <p><strong>Meals:</strong> ${meals?.join(', ') || 'None'}</p>
//         <p><strong>Special Requests:</strong> ${specialRequest || 'None'}</p>
//         <p><strong>Total Price:</strong> $${totalPrice}</p>
//       `
//     };

//     await transporter.sendMail(userMailOptions);
//     await transporter.sendMail(adminMailOptions);

//     res.status(201).json({
//       message: 'Booking created successfully. Awaiting admin approval.',
//       bookingNumber: booking.bookingNumber,
//       booking
//     });

//   } catch (error) {
//     console.error('Error creating booking:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

// // ---------------------- Confirm Booking ----------------------
// exports.confirmBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;

//     const booking = await Booking.findById(bookingId);
//     if (!booking) return res.status(404).json({ message: 'Booking not found' });

//     // Record the booking in the room document — only for those dates
//     for (const bookedRoom of booking.rooms) {
//       const roomDoc = await Room.findOne({ roomType: bookedRoom.roomType });
//       if (!roomDoc) continue;

//       roomDoc.bookings.push({
//         checkIn: new Date(booking.checkIn),
//         checkOut: new Date(booking.checkOut),
//         roomsBooked: bookedRoom.quantity
//       });

//       await roomDoc.save();
//     }

//     booking.status = 'confirmed';
//     await booking.save();

//     // Send confirmation email to user
//     const mailOptions = {
//       from: process.env.ADMIN_EMAIL,
//       to: booking.email,
//       subject: 'Booking Confirmed',
//       html: `
//         <p>Hi ${booking.firstName},</p>
//         <p>Your booking has been <strong>confirmed</strong>.</p>
//         <p><strong>Booking No:</strong> ${booking.bookingNumber}</p>
//         <p><strong>Check-In:</strong> ${booking.checkIn}</p>
//         <p><strong>Check-Out:</strong> ${booking.checkOut}</p>
//         <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
//       `
//     };
//     await transporter.sendMail(mailOptions);

//     res.status(200).json({
//       message: 'Booking confirmed successfully. Room records updated only for booked dates.',
//       booking
//     });

//   } catch (error) {
//     console.error('Error confirming booking:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

// // ---------------------- Get Pending Bookings ----------------------
// exports.getPendingBookings = async (req, res) => {
//   try {
//     const pendingBookings = await Booking.find({ status: 'pending' }).sort({ createdAt: -1 });

//     res.status(200).json({
//       message: 'Pending bookings fetched successfully',
//       bookings: pendingBookings
//     });
//   } catch (error) {
//     console.error('Error fetching pending bookings:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

// // ---------------------- Get Confirmed Bookings ----------------------
// exports.getConfirmedBookings = async (req, res) => {
//   try {
//     const confirmedBookings = await Booking.find({ status: 'confirmed' }).sort({ createdAt: -1 });

//     res.status(200).json({
//       message: 'Confirmed bookings fetched successfully',
//       bookings: confirmedBookings
//     });
//   } catch (error) {
//     console.error('Error fetching confirmed bookings:', error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

// // ---------------search by BookingNumber--------
// // 🔍 Search booking by booking number
// exports.getBookingByNumber = async (req, res) => {
//   try {
//     const { bookingNumber } = req.params;
//     const booking = await Booking.findOne({ bookingNumber });

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     res.status(200).json(booking);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching booking", error });
//   }
// };
// // ----------checkin/assignrooms---------
// // Check-In Booking (Manual Room Assignment)
// exports.checkInBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params; // Get booking ID from URL
//     const { assignedRoom } = req.body; // Receptionist enters manually

//     // Find booking by ID
//     const booking = await Booking.findById(bookingId);
//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     // Ensure booking is confirmed before check-in
//     if (booking.status !== 'confirmed') {
//       return res.status(400).json({ message: 'Only confirmed bookings can be checked in.' });
//     }

//     // Update booking details
//     booking.status = 'checked_in';
//     booking.assignedRoom = assignedRoom || 'Not specified'; // Store assigned room
//     await booking.save();

//     res.status(200).json({
//       message: `Guest checked in successfully and assigned to room: ${booking.assignedRoom}`,
//       booking
//     });
//   } catch (error) {
//     console.error('Check-in error:', error);
//     res.status(500).json({ message: 'Error checking in guest', error });
//   }
// };
const Booking = require('../models/bookingModels');
const Room = require('../models/roomModel');
const nodemailer = require('nodemailer');
const cron = require('node-cron'); // for scheduled tasks

// Admin email
const adminEmail = process.env.ADMIN_EMAIL;

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ---------------------- Generate Booking Number ----------------------
const generateBookingNumber = async () => {
  const lastBooking = await Booking.findOne().sort({ createdAt: -1 });
  let nextNumber = 1001;
  if (lastBooking && lastBooking.bookingNumber) {
    const lastNum = parseInt(lastBooking.bookingNumber.replace('BKN', ''));
    if (!isNaN(lastNum)) nextNumber = lastNum + 1;
  }
  return `BKN${nextNumber}`;
};

// ---------------------- Create Booking ----------------------
exports.createBooking = async (req, res) => {
  try {
    const { firstName, lastName, email, country, phone, checkIn, checkOut, roomSelection, meals, specialRequest } = req.body;

    if (!firstName || !lastName || !email || !checkIn || !checkOut || !roomSelection || roomSelection.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const numberOfNights = Math.ceil(Math.abs(checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    let totalPrice = 0;
    const roomsWithPrice = [];

    for (const item of roomSelection) {
      const roomTypeDoc = await Room.findOne({ roomType: item.roomType });
      if (!roomTypeDoc) return res.status(404).json({ message: `Room type ${item.roomType} not found` });

      totalPrice += roomTypeDoc.price * item.roomsRequested * numberOfNights;
      roomsWithPrice.push({
        roomType: item.roomType,
        quantity: item.roomsRequested,
        pricePerNight: roomTypeDoc.price
      });
    }

    const bookingNumber = await generateBookingNumber();

    const booking = new Booking({
      bookingNumber,
      firstName,
      lastName,
      email,
      country,
      phoneNumber: phone,
      checkIn,
      checkOut,
      rooms: roomsWithPrice,
      meals,
      specialRequest,
      totalPrice,
      status: 'pending'
    });

    await booking.save();

    // Email to user
    await transporter.sendMail({
      from: adminEmail,
      to: email,
      subject: 'Booking Request Received',
      html: `
        <p>Hi ${firstName},</p>
        <p>Your booking request has been received and is awaiting admin approval.</p>
        <p><strong>Booking No:</strong> ${bookingNumber}</p>
        <p><strong>Total Price:</strong> $${totalPrice}</p>
        <p><strong>Check-In:</strong> ${checkIn}</p>
        <p><strong>Check-Out:</strong> ${checkOut}</p>
        <p>Thank you!</p>
      `
    });

    // Email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      replyTo: email,
      subject: `New Booking Request from ${firstName} ${lastName}`,
      html: `<p>Booking No: ${bookingNumber}<br/>Name: ${firstName} ${lastName}<br/>Check-In: ${checkIn}<br/>Check-Out: ${checkOut}</p>`
    });

    res.status(201).json({ message: 'Booking created successfully. Awaiting admin approval.', bookingNumber, booking });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ---------------------- Confirm Booking ----------------------
// exports.confirmBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const booking = await Booking.findById(bookingId);
//     if (!booking) return res.status(404).json({ message: 'Booking not found' });

//     for (const bookedRoom of booking.rooms) {
//       const roomDoc = await Room.findOne({ roomType: bookedRoom.roomType });
//       if (!roomDoc) continue;

//       roomDoc.bookings.push({
//         checkIn: new Date(booking.checkIn),
//         checkOut: new Date(booking.checkOut),
//         roomsBooked: bookedRoom.quantity
//       });
//       await roomDoc.save();
//     }

//     booking.status = 'confirmed';
//     await booking.save();

//     await transporter.sendMail({
//       from: adminEmail,
//       to: booking.email,
//       subject: 'Booking Confirmed',
//       html: `<p>Hi ${booking.firstName}, your booking ${booking.bookingNumber} is confirmed!</p>`
//     });

//     res.status(200).json({ message: 'Booking confirmed successfully.', booking });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };
exports.confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { transactionNumber } = req.body; // Get transaction number from request body

    if (!transactionNumber) {
      return res.status(400).json({ message: "Transaction number is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Update room bookings
    for (const bookedRoom of booking.rooms) {
      const roomDoc = await Room.findOne({ roomType: bookedRoom.roomType });
      if (!roomDoc) continue;

      roomDoc.bookings.push({
        checkIn: new Date(booking.checkIn),
        checkOut: new Date(booking.checkOut),
        roomsBooked: bookedRoom.quantity
      });
      await roomDoc.save();
    }

    // Save transaction number and status
    booking.status = 'confirmed';
    booking.transactionNumber = transactionNumber; // ✅ Save it
    await booking.save();

    // Send confirmation email
    await transporter.sendMail({
      from: adminEmail,
      to: booking.email,
      subject: 'Booking Confirmed',
      html: `<p>Hi ${booking.firstName}, your booking ${booking.bookingNumber} is confirmed! Transaction Number: ${transactionNumber}</p>`
    });

    res.status(200).json({ message: 'Booking confirmed successfully.', booking });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ---------------------- Check-In ----------------------
exports.checkInBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { assignedRoom } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be checked in.' });
    }

    booking.status = 'checked_in';
    booking.assignedRoom = assignedRoom || 'Not specified';
    await booking.save();

    res.status(200).json({ message: `Guest checked in successfully. Room: ${booking.assignedRoom}`, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error checking in guest', error });
  }
};

// ---------------------- Auto Check-Out ----------------------
// Runs daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date();
    const bookingsToCheckOut = await Booking.find({
      status: 'checked_in',
      checkOut: { $lt: today }
    });

    for (const booking of bookingsToCheckOut) {
      booking.status = 'checked_out';
      await booking.save();
      console.log(`Booking ${booking.bookingNumber} auto-checked out.`);
    }
  } catch (error) {
    console.error('Error in auto check-out cron job:', error);
  }
});

// ---------------------- Search Booking ----------------------
exports.getBookingByNumber = async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const booking = await Booking.findOne({ bookingNumber });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error });
  }
};

// ---------------------- Get Pending / Confirmed ----------------------
exports.getPendingBookings = async (req, res) => {
  try {
    const pendingBookings = await Booking.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Pending bookings fetched', bookings: pendingBookings });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.getConfirmedBookings = async (req, res) => {
  try {
    const confirmedBookings = await Booking.find({ status: 'confirmed' }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Confirmed bookings fetched', bookings: confirmedBookings });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ---------------------- Get Checked-In Bookings ----------------------
exports.getCheckedInBookings = async (req, res) => {
  try {
    const checkedInBookings = await Booking.find({ status: 'checked_in' }).sort({ checkIn: 1 });
    res.status(200).json({
      message: 'Checked-in bookings fetched successfully',
      bookings: checkedInBookings
    });
  } catch (error) {
    console.error('Error fetching checked-in bookings:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
