// Admin permission needed
// import { Router } from "express";
// import { authenticateAdmin } from "../middleware/auth.js";

// import {
//   listReceptionists,
//   getReceptionist,
//   createReceptionist,
//   updateReceptionist,
//   deleteReceptionist,
// } from "../controllers/ReceptionistController.js";

// const r = Router();

// // ---------------- Admin-only routes ----------------
// r.get("/", authenticateAdmin, listReceptionists);
// r.get("/:id", authenticateAdmin, getReceptionist);
// r.post("/", authenticateAdmin, createReceptionist);
// r.patch("/:id", authenticateAdmin, updateReceptionist); // admin can change password here
// r.delete("/:id", authenticateAdmin, deleteReceptionist);

// export default r;

// No admin permission
import { Router } from "express";
import {
  listReceptionists,
  getReceptionist,
  createReceptionist,
  updateReceptionist,
  deleteReceptionist,
} from "../controllers/ReceptionistController.js";

const r = Router();

// Admin-only routes
r.get("/", listReceptionists);
r.get("/:id", getReceptionist);
r.post("/", createReceptionist);
r.patch("/:id", updateReceptionist); // admin can change password here
r.delete("/:id", deleteReceptionist);

export default r;

