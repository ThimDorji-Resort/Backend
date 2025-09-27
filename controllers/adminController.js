
// const Admin = require("../models/adminModel");
// const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");

// // Admin login
// exports.login = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     const admin = await Admin.findOne({ username });
//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid password" });

//     res.status(200).json({ message: "Admin logged in successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Create admin (one-time setup)
// exports.createAdminIfNotExists = async (req, res) => {
//   try {
//     const secretKey = req.headers["x-admin-key"];
//     if (secretKey !== process.env.ADMIN_SETUP_KEY) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const existingAdmin = await Admin.findOne({});
//     if (existingAdmin) {
//       return res.status(400).json({ message: "Admin already exists" });
//     }

//     const username = process.env.ADMIN_USERNAME ;
//     const email = process.env.ADMIN_EMAIL ;
//     const password = process.env.ADMIN_PASSWORD ;

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newAdmin = new Admin({ username, email, password: hashedPassword });
//     await newAdmin.save();

//     res.status(201).json({ message: "Admin created successfully!" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
// // Forgot password → generate OTP
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
//     const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

//     admin.resetOTP = otp;
//     admin.resetOTPExpiry = expiry;
//     await admin.save();

//     // Send OTP via email (using nodemailer)
//     const transporter = nodemailer.createTransport({
//       service: "gmail", // or your email service
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: admin.email,
//       subject: "Admin Password Reset OTP",
//       text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: "OTP sent to email" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
// exports.verifyOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     if (!admin.resetOTP || admin.resetOTP !== otp)
//       return res.status(400).json({ message: "Invalid OTP" });

//     if (admin.resetOTPExpiry < new Date())
//       return res.status(400).json({ message: "OTP expired" });

//     res.status(200).json({ message: "OTP verified successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, newPassword, confirmPassword } = req.body;

//     if (newPassword !== confirmPassword)
//       return res.status(400).json({ message: "Passwords do not match" });

//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     // Check if OTP is still valid
//     if (!admin.resetOTP || admin.resetOTPExpiry < new Date())
//       return res.status(400).json({ message: "OTP not verified or expired" });

//     admin.password = await bcrypt.hash(newPassword, 10);
//     admin.resetOTP = null;
//     admin.resetOTPExpiry = null;

//     await admin.save();

//     res.status(200).json({ message: "Password reset successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.changePassword = async (req, res) => {
//   try {
//     const { email, currentPassword, newPassword, confirmNewPassword } = req.body;

//     if (newPassword !== confirmNewPassword) {
//       return res.status(400).json({ message: "New passwords do not match" });
//     }

//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     // Verify current password
//     const isMatch = await bcrypt.compare(currentPassword, admin.password);
//     if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

//     // Update password
//     admin.password = await bcrypt.hash(newPassword, 10);
//     await admin.save();

//     res.status(200).json({ message: "Password changed successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ---------------- HELPER: Authenticate JWT ----------------
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    req.admin = admin; // attach admin to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token", error: err.message });
  }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Admin logged in successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- CREATE ADMIN (ONE-TIME) ----------------
exports.createAdminIfNotExists = async (req, res) => {
  try {
    const secretKey = req.headers["x-admin-key"];
    if (secretKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

    const username = process.env.ADMIN_USERNAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- FORGOT PASSWORD → GENERATE OTP ----------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    admin.resetOTP = otp;
    admin.resetOTPExpiry = expiry;
    await admin.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: "Admin Password Reset OTP",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- VERIFY OTP ----------------
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (!admin.resetOTP || admin.resetOTP !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (admin.resetOTPExpiry < new Date())
      return res.status(400).json({ message: "OTP expired" });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- RESET PASSWORD ----------------
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (!admin.resetOTP || admin.resetOTPExpiry < new Date())
      return res.status(400).json({ message: "OTP not verified or expired" });

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.resetOTP = null;
    admin.resetOTPExpiry = null;
    await admin.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- CHANGE PASSWORD (JWT PROTECTED) ----------------
exports.changePassword = [
  authenticateAdmin, // middleware inside controller
  async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmNewPassword } = req.body;
      const admin = req.admin; // from middleware

      if (newPassword !== confirmNewPassword)
        return res.status(400).json({ message: "New passwords do not match" });

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

      admin.password = await bcrypt.hash(newPassword, 10);
      await admin.save();

      res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
];
