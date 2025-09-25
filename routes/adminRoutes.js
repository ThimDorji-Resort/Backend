const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Admin login
router.post("/login", adminController.login);

// Create admin (one-time setup, secure)
router.post("/setup", adminController.createAdminIfNotExists);

module.exports = router;
