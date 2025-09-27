import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import api from "./routes/index.js";
import errorHandler from "./middleware/error.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" })
);

app.use("/api", api);

// 404 for unknown api routes
app.use((_req, res, _next) => res.status(404).json({ message: "Not found" }));

// centralized error handler
app.use(errorHandler);

export default app;
