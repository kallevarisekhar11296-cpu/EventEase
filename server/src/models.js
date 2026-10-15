import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true, min: 1 },
  imageUrl: { type: String, default: "" }
}, { timestamps: true });

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  studentName: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true },
}, { timestamps: true });
registrationSchema.index({ event: 1, email: 1 }, { unique: true });

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true }
});

export const Event = mongoose.model("Event", eventSchema);
export const Registration = mongoose.model("Registration", registrationSchema);
export const Admin = mongoose.model("Admin", adminSchema);
