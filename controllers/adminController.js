// const Admin = require("../models/adminModel");
// const bcrypt = require("bcrypt");

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

//     const username = process.env.ADMIN_USERNAME || "admin";
//     const password = process.env.ADMIN_PASSWORD || "admin123";

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newAdmin = new Admin({ username, password: hashedPassword });
//     await newAdmin.save();

//     res.status(201).json({ message: "Admin created successfully!" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    res.status(200).json({ message: "Admin logged in successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create admin (one-time setup)
exports.createAdminIfNotExists = async (req, res) => {
  try {
    const secretKey = req.headers["x-admin-key"];
    if (secretKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const username = process.env.ADMIN_USERNAME || "admin";
    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
