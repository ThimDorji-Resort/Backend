
const Room = require('../models/roomModel');
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Helper function to upload images to Cloudinary
const uploadImages = async (files) => {
    const images = [];
    for (const file of files.slice(0, 3)) { // max 3 images
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'rooms' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(file.buffer);
        });
        images.push(result.secure_url);
    }
    return images;
};

// Create a room
exports.createRoom = async (req, res) => {
    try {
        console.log("REQ BODY:", req.body);
        console.log("REQ FILES:", req.files);

        const {
            roomType,
            numberOfRooms,
            size,
            beds,
            occupancy,
            location,
            roomDetails,
            roomFeatures,
            bathroomAmenities,
            optional,
            price // ✅ Added price
        } = req.body;

        // Validate required fields including price
        if (!roomType || !numberOfRooms || !size || !beds || !occupancy || !location || !price) {
            return res.status(400).json({ message: 'Missing required fields including price' });
        }

        let images = [];
        if (req.files && req.files.length > 0) {
            images = await uploadImages(req.files);
        }

        const newRoom = new Room({
            roomType,
            numberOfRooms: Number(numberOfRooms),
            size: Number(size),
            beds: Number(beds),
            occupancy: Number(occupancy),
            location,
            roomDetails,
            roomFeatures,
            bathroomAmenities,
            optional,
            price: Number(price), // ensure price is a number
            images
        });

        await newRoom.save();
        res.status(201).json({ message: 'Room created successfully', room: newRoom });
    } catch (error) {
        console.error('CREATE ROOM ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a room by ID
exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        const {
            roomType,
            numberOfRooms,
            size,
            beds,
            occupancy,
            location,
            roomDetails,
            roomFeatures,
            bathroomAmenities,
            optional,
            price // ✅ Include price for update
        } = req.body;

        // Update fields if provided
        if (roomType !== undefined) room.roomType = roomType;
        if (numberOfRooms !== undefined) room.numberOfRooms = Number(numberOfRooms);
        if (size !== undefined) room.size = Number(size);
        if (beds !== undefined) room.beds = Number(beds);
        if (occupancy !== undefined) room.occupancy = Number(occupancy);
        if (location !== undefined) room.location = location;
        if (roomDetails !== undefined) room.roomDetails = roomDetails;
        if (roomFeatures !== undefined) room.roomFeatures = roomFeatures;
        if (bathroomAmenities !== undefined) room.bathroomAmenities = bathroomAmenities;
        if (optional !== undefined) room.optional = optional;
        if (price !== undefined) room.price = Number(price); // ✅ Update price

        // Upload new images if provided
        if (req.files && req.files.length > 0) {
            const images = await uploadImages(req.files);
            room.images = images; // replace existing images
        }

        const updatedRoom = await room.save();
        res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
    } catch (error) {
        console.error('UPDATE ROOM ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all rooms
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json({ message: 'All Rooms retrieved successfully', rooms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        res.status(200).json({ message: 'Room retrieved successfully', room });
    } catch (error) {
        console.error('GET ROOM BY ID ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a room by ID
exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        // Delete images from Cloudinary if exist
        if (room.images && room.images.length > 0) {
            for (const url of room.images) {
                const publicId = url.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`rooms/${publicId}`).catch(err => console.warn(err));
            }
        }

        await room.deleteOne();
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('DELETE ROOM ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.checkAvailableRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, adults, children, roomsRequested } = req.query;

    if (!checkIn || !checkOut || !adults || !children || !roomsRequested) {
      return res.status(400).json({
        message: "Please provide check-in, check-out, number of adults, number of children, and roomsRequested"
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const totalGuests = parseInt(adults) + parseInt(children);
    const roomsToBook = parseInt(roomsRequested);

    const rooms = await Room.find();

    const availableRooms = rooms.filter(room => {
      // Calculate number of rooms already booked in the requested dates
      let bookedRoomsInPeriod = 0;
      room.bookings.forEach(b => {
        if (b.checkIn < checkOutDate && b.checkOut > checkInDate) {
          bookedRoomsInPeriod += b.roomsBooked;
        }
      });

      const roomsAvailable = room.numberOfRooms - bookedRoomsInPeriod;
      const canAccommodate = (room.occupancy * roomsToBook) >= totalGuests;

      return roomsAvailable >= roomsToBook && canAccommodate;
    });

    if (availableRooms.length === 0) {
      return res.status(404).json({
        message: "No available rooms found for the selected dates and number of rooms"
      });
    }

    res.status(200).json({ message: "Available rooms fetched successfully", availableRooms });

  } catch (error) {
    console.error("CHECK AVAILABLE ROOMS ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getRoomsStatusByDate = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "Please provide check-in and check-out dates" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const rooms = await Room.find();

    const availableRooms = [];
    const fullyBookedRooms = [];

    rooms.forEach(room => {
      let roomsBookedInPeriod = 0;

      // Count only bookings that **overlap with the requested dates**
      room.bookings.forEach(b => {
        const bookingCheckIn = new Date(b.checkIn);
        const bookingCheckOut = new Date(b.checkOut);

        // Overlap check
        if (bookingCheckIn < checkOutDate && bookingCheckOut > checkInDate) {
          roomsBookedInPeriod += b.roomsBooked;
        }
      });

      // Calculate available rooms for this specific date range
      const roomsAvailableForRange = room.numberOfRooms - roomsBookedInPeriod;

      if (roomsAvailableForRange > 0) {
        availableRooms.push({
          roomType: room.roomType,
          roomsAvailable: roomsAvailableForRange,
          totalRooms: room.numberOfRooms,
          price: room.price,
          occupancy: room.occupancy,
          size: room.size,
          beds: room.beds,
          location: room.location,
          roomDetails: room.roomDetails,
          images: room.images
        });
      } else {
        fullyBookedRooms.push({
          roomType: room.roomType,
          roomsBooked: roomsBookedInPeriod,
          totalRooms: room.numberOfRooms,
          price: room.price,
          occupancy: room.occupancy,
          size: room.size,
          beds: room.beds,
          location: room.location,
          roomDetails: room.roomDetails,
          images: room.images
        });
      }
    });

    return res.status(200).json({
      message: "Room availability fetched for selected dates",
      availableRooms,
      fullyBookedRooms
    });

  } catch (error) {
    console.error("GET ROOMS STATUS ERROR:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
// // -------------get available rooms by date -------
// exports.getAvailableRoomsByDate = async (req, res) => {
//   try {
//     const { checkIn, checkOut } = req.query;

//     if (!checkIn || !checkOut) {
//       return res.status(400).json({ message: "Please provide check-in and check-out dates" });
//     }

//     const checkInDate = new Date(checkIn);
//     const checkOutDate = new Date(checkOut);

//     // Get all rooms
//     const rooms = await Room.find();

//     // Store only available rooms
//     const availableRooms = [];

//     rooms.forEach(room => {
//       let roomsBookedInPeriod = 0;

//       // Count how many of this room type are booked in the requested period
//       room.bookings.forEach(b => {
//         const bookingCheckIn = new Date(b.checkIn);
//         const bookingCheckOut = new Date(b.checkOut);

//         // If booking overlaps the selected date range
//         if (bookingCheckIn < checkOutDate && bookingCheckOut > checkInDate) {
//           roomsBookedInPeriod += b.roomsBooked;
//         }
//       });

//       // Remaining available rooms
//       const roomsAvailable = room.numberOfRooms - roomsBookedInPeriod;

//       // Include only if some rooms are still free
//       if (roomsAvailable > 0) {
//         availableRooms.push({
//           roomType: room.roomType,
//           roomsAvailable,
//           totalRooms: room.numberOfRooms,
//           price: room.price,
//           occupancy: room.occupancy,
//           size: room.size,
//           beds: room.beds,
//           location: room.location,
//           roomDetails: room.roomDetails,
//           images: room.images,
//         });
//       }
//     });

//     if (availableRooms.length === 0) {
//       return res.status(200).json({
//         message: "No rooms available for the selected dates.",
//         availableRooms: []
//       });
//     }

//     return res.status(200).json({
//       message: "Available rooms fetched successfully.",
//       availableRooms
//     });

//   } catch (error) {
//     console.error("GET AVAILABLE ROOMS ERROR:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
// // flow two-first room an then checking avai
// // Get availability for a specific room type
// exports.getRoomAvailability = async (req, res) => {
//   try {
//     const { roomType } = req.params; // room type from URL
//     const { checkIn, checkOut } = req.query; // dates from query

//     if (!checkIn || !checkOut) {
//       return res.status(400).json({ message: "Please provide check-in and check-out dates" });
//     }

//     const checkInDate = new Date(checkIn);
//     const checkOutDate = new Date(checkOut);

//     // Find the specific room type
//     const room = await Room.findOne({ roomType });
//     if (!room) {
//       return res.status(404).json({ message: `Room type ${roomType} not found` });
//     }

//     let roomsBookedInPeriod = 0;

//     // Count how many rooms are booked for the selected period
//     room.bookings.forEach(b => {
//       const bookingCheckIn = new Date(b.checkIn);
//       const bookingCheckOut = new Date(b.checkOut);

//       // If booking overlaps the selected date range
//       if (bookingCheckIn < checkOutDate && bookingCheckOut > checkInDate) {
//         roomsBookedInPeriod += b.roomsBooked;
//       }
//     });

//     const roomsAvailable = room.numberOfRooms - roomsBookedInPeriod;

//     if (roomsAvailable <= 0) {
//       return res.status(200).json({
//         message: `No ${roomType} rooms available for the selected dates.`,
//         roomType,
//         roomsAvailable: 0
//       });
//     }

//     res.status(200).json({
//       message: `${roomsAvailable} ${roomType} room(s) available.`,
//       roomType,
//       roomsAvailable,
//       totalRooms: room.numberOfRooms,
//       price: room.price,
//       occupancy: room.occupancy,
//       size: room.size,
//       beds: room.beds,
//       location: room.location,
//       roomDetails: room.roomDetails,
//       images: room.images
//     });

//   } catch (error) {
//     console.error("GET ROOM AVAILABILITY ERROR:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
// ---------------------- Get all available rooms by date (Flow 1) ----------------------
exports.getAvailableRoomsByDate = async (req, res) => {
  try {
    const { checkIn, checkOut, adults, children, roomsRequested } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "Please provide check-in and check-out dates" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const rooms = await Room.find();
    const availableRooms = [];

    rooms.forEach(room => {
      let roomsBookedInPeriod = 0;

      room.bookings.forEach(b => {
        const bookingCheckIn = new Date(b.checkIn);
        const bookingCheckOut = new Date(b.checkOut);

        if (bookingCheckIn < checkOutDate && bookingCheckOut > checkInDate) {
          roomsBookedInPeriod += b.roomsBooked;
        }
      });

      const roomsAvailable = room.numberOfRooms - roomsBookedInPeriod;

      if (roomsAvailable > 0) {
        // Filter by adults/children if needed
        if ((adults && adults > room.occupancy) || (children && children > room.beds)) {
          return; // skip this room
        }
        // Filter by rooms requested
        if (roomsRequested && roomsRequested > roomsAvailable) {
          return; // skip if not enough rooms
        }

        availableRooms.push({
          roomType: room.roomType,
          roomsAvailable,
          totalRooms: room.numberOfRooms,
          price: room.price,
          occupancy: room.occupancy,
          size: room.size,
          beds: room.beds,
          location: room.location,
          roomDetails: room.roomDetails,
          images: room.images,
        });
      }
    });

    res.status(200).json({
      message: availableRooms.length > 0 ? "Available rooms fetched successfully." : "No rooms available for the selected dates.",
      availableRooms
    });

  } catch (error) {
    console.error("GET AVAILABLE ROOMS ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------------- Get availability for a specific room type (Flow 2) ----------------------
exports.getRoomAvailability = async (req, res) => {
  try {
    const { roomType } = req.params;
    const { checkIn, checkOut, adults, children, roomsRequested } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "Please provide check-in and check-out dates" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const room = await Room.findOne({ roomType });
    if (!room) return res.status(404).json({ message: `Room type ${roomType} not found` });

    let roomsBookedInPeriod = 0;
    room.bookings.forEach(b => {
      const bookingCheckIn = new Date(b.checkIn);
      const bookingCheckOut = new Date(b.checkOut);
      if (bookingCheckIn < checkOutDate && bookingCheckOut > checkInDate) {
        roomsBookedInPeriod += b.roomsBooked;
      }
    });

    const roomsAvailable = room.numberOfRooms - roomsBookedInPeriod;

    if (roomsAvailable <= 0 || (roomsRequested && roomsRequested > roomsAvailable)) {
      return res.status(200).json({
        message: `No ${roomType} rooms available for the selected dates.`,
        roomType,
        roomsAvailable: 0
      });
    }

    // Filter by adults/children if provided
    if ((adults && adults > room.occupancy) || (children && children > room.beds)) {
      return res.status(200).json({
        message: `Room ${roomType} cannot accommodate the selected number of guests.`,
        roomType,
        roomsAvailable: 0
      });
    }

    res.status(200).json({
      message: `${roomsAvailable} ${roomType} room(s) available.`,
      roomType,
      roomsAvailable,
      totalRooms: room.numberOfRooms,
      price: room.price,
      occupancy: room.occupancy,
      size: room.size,
      beds: room.beds,
      location: room.location,
      roomDetails: room.roomDetails,
      images: room.images
    });

  } catch (error) {
    console.error("GET ROOM AVAILABILITY ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
