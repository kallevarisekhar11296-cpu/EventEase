import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign({ id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, email: admin.email });
  } catch (error) { next(error); }
});

export default router;
