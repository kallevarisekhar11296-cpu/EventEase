import { Router } from "express";
import mongoose from "mongoose";
import { Event, Registration } from "../models.js";
import { requireAdmin } from "../middleware/auth.js";
import { normalizeRegistrationInput, isAtCapacity } from "../validation.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
    if (req.query.search) {
      const safe = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ title: new RegExp(safe, "i") }, { venue: new RegExp(safe, "i") }];
    }
    const events = await Event.find(filter).sort({ date: 1 }).lean();
    const ids = events.map(e => e._id);
    const counts = await Registration.aggregate([
      { $match: { event: { $in: ids } } },
      { $group: { _id: "$event", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map(c => [String(c._id), c.count]));
    res.json(events.map(e => ({ ...e, registered: countMap.get(String(e._id)) || 0,
      availableSeats: Math.max(0, e.capacity - (countMap.get(String(e._id)) || 0)) })));
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid event ID." });
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: "Event not found." });
    const registered = await Registration.countDocuments({ event: event._id });
    res.json({ ...event, registered, availableSeats: Math.max(0, event.capacity - registered) });
  } catch (error) { next(error); }
});

router.post("/:id/register", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid event ID." });
    const validation = normalizeRegistrationInput(req.body.studentName, req.body.email);
    if (!validation.ok) return res.status(400).json({ message: validation.message });
    const { studentName, email } = validation;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    if (new Date(event.date) < new Date()) return res.status(400).json({ message: "Registration is closed for past events." });
    const registered = await Registration.countDocuments({ event: event._id });
    if (isAtCapacity(event.capacity, registered)) return res.status(409).json({ message: "This event is full." });
    await Registration.create({ event: event._id, studentName, email });
    res.status(201).json({ message: "Registration successful." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "This email is already registered for the event." });
    next(error);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const { title, description, category, date, venue, capacity, imageUrl = "" } = req.body;
    if (!title || !description || !category || !date || !venue || !Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      return res.status(400).json({ message: "Complete all fields and enter a valid capacity." });
    }
    const event = await Event.create({ title, description, category, date, venue, capacity: Number(capacity), imageUrl });
    res.status(201).json(event);
  } catch (error) { next(error); }
});

router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid event ID." });
    const update = { ...req.body };
    if (update.capacity !== undefined) {
      update.capacity = Number(update.capacity);
      const count = await Registration.countDocuments({ event: req.params.id });
      if (!Number.isInteger(update.capacity) || update.capacity < count) {
        return res.status(400).json({ message: `Capacity cannot be lower than existing registrations (${count}).` });
      }
    }
    const event = await Event.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: "Event not found." });
    res.json(event);
  } catch (error) { next(error); }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    await Registration.deleteMany({ event: event._id });
    res.json({ message: "Event and associated registrations deleted." });
  } catch (error) { next(error); }
});

export default router;
