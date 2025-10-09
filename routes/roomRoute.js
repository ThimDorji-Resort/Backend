
const express = require('express');
const router = express.Router();
const multer = require('multer');
const roomController = require('../controllers/roomControler');

// Multer memory storage (no local folder needed)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max per file
});

// Create room (POST) with up to 3 images
router.post('/', upload.array('images', 3), roomController.createRoom);

// Get all rooms
router.get('/rooms', roomController.getAllRooms);
// ?=================\
// Route to get available rooms
// router.get('/room/available', roomController.checkAvailableRooms);
router.get('/rooms/available', roomController.checkAvailableRooms);

// Get single room by ID
router.get('/rooms/:id', roomController.getRoomById);

// Update room by ID (PUT) with up to 3 images
router.put('/rooms/:id', upload.array('images', 3), roomController.updateRoom);
// Delete room by ID (DELETE)
router.delete('/rooms/:id', roomController.deleteRoom);

router.get('/status', roomController.getRoomsStatusByDate);
router.get('/available', roomController.getAvailableRoomsByDate);
// Get availability for a specific room type
router.get('/room/:roomType/availability', roomController.getRoomAvailability);

module.exports = router;
