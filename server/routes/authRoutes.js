import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'inari_secret_key_12345';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role, phone, address } = req.body;

  try {
    // Check if user exists
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Status: farmers are 'pending' for approval, others are 'approved'
    const status = role === 'farmer' ? 'pending' : 'approved';

    // Create user
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      phone: phone || '',
      address: address || '',
      status
    });

    if (user) {
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        address: user.address,
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check approval status (only let approved farmers log in, or alert them if pending)
    if (user.role === 'farmer' && user.status === 'pending') {
      return res.status(403).json({
        message: 'Your farmer profile is pending administrator approval. Please check back later.'
      });
    }
    if (user.role === 'farmer' && user.status === 'rejected') {
      return res.status(403).json({
        message: 'Your farmer profile approval request has been rejected.'
      });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      address: user.address,
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    status: req.user.status,
    phone: req.user.phone,
    address: req.user.address,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateFields = {
      name: req.body.name || user.name,
      phone: req.body.phone !== undefined ? req.body.phone : user.phone,
      address: req.body.address !== undefined ? req.body.address : user.address,
    };

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(req.user._id, updateFields);

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      phone: updatedUser.phone,
      address: updatedUser.address,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
