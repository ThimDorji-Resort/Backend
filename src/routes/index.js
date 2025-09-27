import { Router } from "express";
import facilities from "./facilitiesRoutes.js";

const api = Router();

api.use("/facilities", facilities);

export default api;
