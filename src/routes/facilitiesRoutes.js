import { Router } from "express";
import { uploadImage } from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import {
  createFacilitySchema,
  updateFacilitySchema,
} from "../validators/facilitiesSchema.js";
import {
  listFacilities,
  getFacility,
  createFacility,
  updateFacility,
  deleteFacility,
} from "../controllers/facilitiesController.js";

// If you have auth/roles middleware, import and add to POST/PATCH/DELETE.
// import auth from "../middleware/auth.js";
// import allowRoles from "../middleware/roles.js";

const r = Router();

// Public reads
r.get("/", listFacilities);
r.get("/:id", getFacility);

// Create (multipart OR JSON). In real app: add auth/roles.
r.post(
  "/",
  uploadImage.single("image"),
  (req, _res, next) => {
    if (req.file?.path) req.body.image = req.file.path; // Cloudinary secure_url
    next();
  },
  validate(createFacilitySchema),
  createFacility
);

// Update (optionally replace image)
r.patch(
  "/:id",
  uploadImage.single("image"),
  (req, _res, next) => {
    if (req.file?.path) req.body.image = req.file.path;
    next();
  },
  validate(updateFacilitySchema),
  updateFacility
);

// Delete
r.delete("/:id", deleteFacility);

export default r;
