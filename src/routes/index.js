import { Router } from "express";
import facilities from "./facilitiesRoutes.js";
import testimonials from "./testimonialRoutes.js";
import receptionistRoutes from "./ReceptionistRoutes.js";

const api = Router();

api.use("/facilities", facilities);
api.use("/testimonials", testimonials);
api.use("/receptionists", receptionistRoutes);
export default api;
