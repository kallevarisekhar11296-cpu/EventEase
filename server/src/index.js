import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import eventRoutes from "./routes/events.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "EventEase API" }));
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error. Check server logs." });
});

const port = process.env.PORT || 5000;
try {
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, () => console.log(`EventEase API running on http://localhost:${port}`));
} catch (error) {
  console.error("Could not connect to MongoDB. Check MONGO_URI.", error.message);
  process.exit(1);
}
