import { Router } from "express";
import { Event, Registration } from "../models.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
router.get("/stats", requireAdmin, async (_req, res, next) => {
  try {
    const [eventCount, registrationCount, events] = await Promise.all([
      Event.countDocuments(),
      Registration.countDocuments(),
      Event.find().sort({ date: 1 }).lean()
    ]);
    const registrationsByEvent = await Registration.aggregate([
      { $group: { _id: "$event", count: { $sum: 1 } } }
    ]);
    const counts = new Map(registrationsByEvent.map(x => [String(x._id), x.count]));
    const popularEvents = events.map(e => ({ title: e.title, registrations: counts.get(String(e._id)) || 0 }))
      .sort((a, b) => b.registrations - a.registrations).slice(0, 5);
    res.json({ eventCount, registrationCount, popularEvents });
  } catch (error) { next(error); }
});
export default router;
