import express from 'express';
import CategoryModel from '../models/Category.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await CategoryModel.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  const { name, description, image } = req.body;

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const exists = await CategoryModel.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await CategoryModel.create({
      name,
      slug,
      description: description || '',
      image: image || ''
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
