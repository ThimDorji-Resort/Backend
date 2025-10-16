// // auth.js
// import jwt from "jsonwebtoken";
// import Admin from "../models/adminModel.js";

// export const authenticateAdmin = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer "))
//       return res.status(401).json({ message: "No token provided" });

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const admin = await Admin.findById(decoded.id);
//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     req.admin = admin;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// };
