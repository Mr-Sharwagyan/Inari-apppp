import express from "express";
import EventModel from "../models/Event.js";
import ProductModel from "../models/Product.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { type, search } = req.query;

    let events = await EventModel.find({ isActive: true })
      .populate("products");

    // filter by type
    if (type && type !== "all") {
      events = events.filter(e => e.type === type);
    }

    // search filter
    if (search) {
      const q = search.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.id)
      .populate("products");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post(
  "/",
  protect,
  authorize("farmer", "admin"),
  async (req, res) => {
    try {
      const event = await EventModel.create({
        ...req.body,
        createdBy: req.user._id,
      });

      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
router.put(
  "/:id",
  protect,
  authorize("farmer", "admin"),
  async (req, res) => {
    try {
      const event = await EventModel.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const updated = await EventModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
router.delete(
  "/:id",
  protect,
  authorize("farmer", "admin"),
  async (req, res) => {
    try {
      const event = await EventModel.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      await EventModel.findByIdAndDelete(req.params.id);

      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
export default router;