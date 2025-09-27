
const Room = require('../models/roomModel');
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

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
            optional
        } = req.body;

        // Validate required fields
        if (!roomType || !numberOfRooms || !size || !beds || !occupancy || !location) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Upload images to Cloudinary directly from memory
        let images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files.slice(0, 3)) { // max 3 images
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
        }

        // Create new room
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
            images
        });

        await newRoom.save();
        res.status(201).json({ message: 'Room created successfully', room: newRoom });
    } catch (error) {
        console.error('CREATE ROOM ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find(); // fetch all rooms from the database
        res.status(200).json({ 
            message: 'All Rooms retrieved successfully', 
            rooms 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Server error', 
            error 
        });
    }
};
// Get a room by ID
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

// Update a room by ID
exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        console.log('REQ BODY:', req.body);
        console.log('REQ FILES:', req.files);

        const body = req.body || {};
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
            optional
        } = body;

        // Update fields if defined
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

        // Upload new images if provided
        if (req.files && req.files.length > 0) {
            const images = [];
            for (const file of req.files.slice(0, 3)) {
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
            room.images = images; // replace existing images
        }

        const updatedRoom = await room.save();
        res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
    } catch (error) {
        console.error('UPDATE ROOM ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// Delete a room by ID
exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        // Optionally: delete images from Cloudinary
        if (room.images && room.images.length > 0) {
            for (const url of room.images) {
                const publicId = url.split('/').pop().split('.')[0]; // extract public ID
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