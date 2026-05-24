import express from 'express';
import NotificationModel from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await NotificationModel.find({ recipient: req.user._id });
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await NotificationModel.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await NotificationModel.findByIdAndUpdate(req.params.id, {
      read: true
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    const list = await NotificationModel.find({ recipient: req.user._id, read: false });
    for (let notif of list) {
      await NotificationModel.findByIdAndUpdate(notif._id, { read: true });
    }
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
