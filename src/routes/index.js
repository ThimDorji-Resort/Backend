import { Router } from "express";
import facilities from "./facilitiesRoutes.js";
import testimonials from "./testimonialRoutes.js";

const api = Router();

api.use("/facilities", facilities);
api.use("/testimonials", testimonials);
export default api;
