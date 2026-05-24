import express from 'express';
import UserModel from '../models/User.js';
import NotificationModel from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all users (Farmers, Customers, Admins)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await UserModel.find({});
    // Remove passwords before sending
    const sanitizedUsers = users.map(user => {
      const u = typeof user.toObject === 'function' ? user.toObject() : user;
      delete u.password;
      return u;
    });
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Approve/Reject farmer application
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, {
      status
    });

    // Send notification to the user
    await NotificationModel.create({
      recipient: user._id,
      title: 'Farmer Profile Application',
      message: `Your application to register as a Farmer has been ${status.toUpperCase()} by the system administration.`,
      type: 'approval'
    });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
