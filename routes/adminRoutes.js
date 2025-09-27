// const express = require("express");
// const router = express.Router();
// const adminController = require("../controllers/adminController");

// // Admin login
// router.post("/login", adminController.login);

// // Create admin (one-time setup, secure)
// router.post("/setup", adminController.createAdminIfNotExists);
// router.post("/forgot-password", adminController.forgotPassword);
// // Step 2: Verify OTP
// router.post("/verify-otp", adminController.verifyOTP);

// // Step 3: Reset password after OTP verification
// router.post("/reset-password", adminController.resetPassword);
// // router.post("/reset-password", adminController.resetPassword);
// // Change password (requires current password)
// router.put("/change-password", adminController.changePassword);
// module.exports = router;
const express = require("express");
const router = express.Router();
const {
  login,
  createAdminIfNotExists,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword
} = require("../controllers/adminController");

// Public routes
router.post("/login", login);
router.post("/setup", createAdminIfNotExists);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Protected route
router.put("/change-password", changePassword); // middleware already inside controller

module.exports = router;
