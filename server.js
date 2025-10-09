
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require("./routes/adminRoutes"); // Make sure this exports a router
const roomRoutes = require('./routes/roomRoute'); // Corrected to match your file
const app = express();

// Middleware
app.use(express.json()); // For JSON requests
app.use(express.urlencoded({ extended: true })); // For form-data text fields

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ DB connection error:", err));

// Routes
app.use("/admin", adminRoutes); 
app.use('/rooms', roomRoutes);
app.use('/bookings', bookingRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
