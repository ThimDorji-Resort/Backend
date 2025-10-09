// Admin Permission
// import { Router } from "express";
// import { uploadTestimonialImage } from "../middleware/upload.js"; 
// import validate from "../middleware/validate.js";
// import { authenticateAdmin } from "../middleware/auth.js"; // ✅ ONLY ONE import

// import {
//   createTestimonialSchema,
//   updateTestimonialSchema,
// } from "../validators/testimonialSchema.js";

// import {
//   listTestimonials,
//   getTestimonial,
//   createTestimonial,
//   updateTestimonial,
//   deleteTestimonial,
//   archiveTestimonial,
//   unarchiveTestimonial,
// } from "../controllers/TestimonialController.js";

// const r = Router();

// // Public routes
// r.get("/", listTestimonials);
// r.get("/:id", getTestimonial);

// // Admin-only routes
// r.post(
//   "/",
//   authenticateAdmin,
//   uploadTestimonialImage.single("image"),
//   (req, _res, next) => {
//     if (req.file?.path) req.body.image = req.file.path;
//     next();
//   },
//   validate(createTestimonialSchema),
//   createTestimonial
// );

// r.patch(
//   "/:id",
//   authenticateAdmin,
//   uploadTestimonialImage.single("image"),
//   (req, _res, next) => {
//     if (req.file?.path) req.body.image = req.file.path;
//     next();
//   },
//   validate(updateTestimonialSchema),
//   updateTestimonial
// );

// r.patch("/:id/archive", authenticateAdmin, archiveTestimonial);
// r.patch("/:id/unarchive", authenticateAdmin, unarchiveTestimonial);
// r.delete("/:id", authenticateAdmin, deleteTestimonial);

// export default r;


// No admin permission needed
import { Router } from "express";
import { uploadTestimonialImage } from "../middleware/upload.js"; 
import validate from "../middleware/validate.js";
import {
  createTestimonialSchema,
  updateTestimonialSchema,
} from "../validators/testimonialSchema.js";
import {
  listTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  archiveTestimonial,
  unarchiveTestimonial,
} from "../controllers/TestimonialController.js";

const r = Router();

// Public reads
r.get("/", listTestimonials);
r.get("/:id", getTestimonial);

// Create (guest submits testimonial with optional image)
r.post(
  "/",
  uploadTestimonialImage.single("image"),
  (req, _res, next) => {
    if (req.file?.path) req.body.image = req.file.path; // Cloudinary secure_url
    next();
  },
  validate(createTestimonialSchema),
  createTestimonial
);

// Update (receptionist/admin only ideally)
r.patch(
  "/:id",
  uploadTestimonialImage.single("image"),
  (req, _res, next) => {
    if (req.file?.path) req.body.image = req.file.path;
    next();
  },
  validate(updateTestimonialSchema),
  updateTestimonial
);

// Archive testimonial
r.patch("/:id/archive", archiveTestimonial);

// Unarchive testimonial
r.patch("/:id/unarchive", unarchiveTestimonial);

// Delete (receptionist/admin only ideally)
r.delete("/:id", deleteTestimonial);

export default r;

