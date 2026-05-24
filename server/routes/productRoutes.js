import express from 'express';
import ProductModel from '../models/Product.js';
import UserModel from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, farmer, sort, minPrice, maxPrice } = req.query;
    
    // We fetch all products and filter them in memory/db query depending on mode
    let products = await ProductModel.find({});

    // Filter by farmer
    if (farmer) {
      products = products.filter(p => p.farmer === farmer);
    }

    // Filter by category
    if (category && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by search query (case-insensitive)
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // Filter by price range
    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }

    // Apply sorting
    if (sort) {
      if (sort === 'price-low') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-high') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'newest') {
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    // Map farmer name to the product for UI display
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        // Find farmer info
        const farmerUser = await UserModel.findById(product.farmer);
        const productObj = typeof product.toObject === 'function' ? product.toObject() : product;
        return {
          ...productObj,
          farmerName: farmerUser ? farmerUser.name : 'Independent Farmer',
          farmerAddress: farmerUser ? farmerUser.address : ''
        };
      })
    );

    res.json(enrichedProducts);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const farmerUser = await UserModel.findById(product.farmer);
    const productObj = typeof product.toObject === 'function' ? product.toObject() : product;
    
    res.json({
      ...productObj,
      farmerName: farmerUser ? farmerUser.name : 'Independent Farmer',
      farmerEmail: farmerUser ? farmerUser.email : '',
      farmerPhone: farmerUser ? farmerUser.phone : '',
      farmerAddress: farmerUser ? farmerUser.address : ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Farmer/Admin
router.post('/', protect, authorize('farmer', 'admin'), async (req, res) => {
  const { name, description, price, unit, category, stock, images } = req.body;

  try {
    const product = await ProductModel.create({
      name,
      description,
      price: parseFloat(price),
      unit: unit || 'kg',
      category,
      farmer: req.user._id,
      stock: parseInt(stock) || 0,
      images: images || [],
      status: (parseInt(stock) || 0) > 0 ? 'available' : 'out-of-stock'
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Farmer/Admin
router.put('/:id', protect, authorize('farmer', 'admin'), async (req, res) => {
  const { name, description, price, unit, category, stock, images } = req.body;

  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership
    if (req.user.role !== 'admin' && product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    const updateFields = {
      name: name || product.name,
      description: description || product.description,
      price: price !== undefined ? parseFloat(price) : product.price,
      unit: unit || product.unit,
      category: category || product.category,
      stock: stock !== undefined ? parseInt(stock) : product.stock,
      images: images || product.images,
      status: (stock !== undefined ? parseInt(stock) : product.stock) > 0 ? 'available' : 'out-of-stock'
    };

    const updatedProduct = await ProductModel.findByIdAndUpdate(req.params.id, updateFields);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Farmer/Admin
router.delete('/:id', protect, authorize('farmer', 'admin'), async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership
    if (req.user.role !== 'admin' && product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await ProductModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Upload product images (multiple support)
// @route   POST /api/products/upload
// @access  Private/Farmer/Admin
router.post('/upload', protect, authorize('farmer', 'admin'), upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // Return the URLs of uploaded files
    const urls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
