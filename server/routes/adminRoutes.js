import express from 'express';
import UserModel from '../models/User.js';
import ProductModel from '../models/Product.js';
import NotificationModel from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET all users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await UserModel.find({});
    const sanitized = users.map(u => {
      const obj = typeof u.toObject === 'function' ? u.toObject() : { ...u };
      delete obj.password;
      return obj;
    });
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT approve/reject farmer
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status))
    return res.status(400).json({ message: 'Invalid status' });
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await UserModel.findByIdAndUpdate(req.params.id, { status });
    await NotificationModel.create({
      recipient: user._id,
      title: 'Farmer Application Update',
      message: `Your farmer application has been ${status.toUpperCase()} by the admin.`,
      type: 'approval'
    });
    res.json({ message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST send warning notification to a user
router.post('/users/:id/warn', protect, authorize('admin'), async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: 'Warning message required' });
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await NotificationModel.create({
      recipient: user._id,
      sender: req.user._id,
      title: '⚠️ Admin Warning',
      message: message.trim(),
      type: 'general'
    });
    res.json({ message: 'Warning sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all products for admin monitoring
router.get('/products', protect, authorize('admin'), async (req, res) => {
  try {
    const products = await ProductModel.find({});
    const users = await UserModel.find({});
    const farmerMap = {};
    users.forEach(u => { farmerMap[String(u._id)] = u.name; });
    const enriched = products.map(p => ({
      ...(typeof p.toObject === 'function' ? p.toObject() : { ...p }),
      farmerName: farmerMap[String(p.farmer)] || 'Unknown'
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET farmer eligibility check
router.get('/users/:id/eligibility', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const products = await ProductModel.find({ farmer: req.params.id });
    const joinedDaysAgo = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000);
    const activeProducts = products.filter(p => p.status === 'available');
    res.json({
      hasProducts: products.length > 0,
      productCount: products.length,
      activeProductCount: activeProducts.length,
      hasActiveProducts: activeProducts.length > 0,
      notRejected: user.status !== 'rejected',
      joinedDaysAgo,
      accountOldEnough: joinedDaysAgo >= 1,
      isEligible: products.length > 0 && user.status !== 'rejected' && joinedDaysAgo >= 1
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;