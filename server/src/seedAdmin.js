import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Admin, Event } from "./models.js";

await mongoose.connect(process.env.MONGO_URI);
const email = (process.env.ADMIN_EMAIL || "admin@eventease.local").toLowerCase();
const password = process.env.ADMIN_PASSWORD || "ChangeThisPassword123!";
if (password.length < 12) {
  console.error("Set ADMIN_PASSWORD to at least 12 characters in .env before seeding.");
  process.exit(1);
}
const passwordHash = await bcrypt.hash(password, 12);
await Admin.findOneAndUpdate({ email }, { email, passwordHash }, { upsert: true, new: true });
if (await Event.countDocuments() === 0) {
  await Event.insertMany([
    { title: "Web Development Workshop", description: "Hands-on workshop covering modern web application fundamentals.", category: "Workshop", date: new Date(Date.now()+7*86400000), venue: "Computer Lab 2", capacity: 60 },
    { title: "Campus Innovation Meetup", description: "Share ideas, meet teams, and explore student projects.", category: "Meetup", date: new Date(Date.now()+14*86400000), venue: "Seminar Hall", capacity: 120 },
    { title: "Coding Challenge", description: "A friendly coding challenge for students of all skill levels.", category: "Competition", date: new Date(Date.now()+21*86400000), venue: "Main Auditorium", capacity: 80 }
  ]);
}
console.log(`Admin ready: ${email}. Keep the password private.`);
await mongoose.disconnect();
