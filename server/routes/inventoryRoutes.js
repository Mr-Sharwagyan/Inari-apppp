import express from 'express';
import InventoryModel from '../models/Inventory.js';
import ProductModel from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all inventory batches for logged in farmer
// @route   GET /api/inventory
// @access  Private/Farmer
router.get('/', protect, authorize('farmer'), async (req, res) => {
  try {
    const inventory = await InventoryModel.find({ farmer: req.user._id });
    inventory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add new inventory batch
// @route   POST /api/inventory
// @access  Private/Farmer
router.post('/', protect, authorize('farmer'), async (req, res) => {
  const { product, productName, batchNumber, harvestDate, expiryDate, qualityGrade, location, quantity, notes } = req.body;

  try {
    // 1. Double check product exists
    const prod = await ProductModel.findById(product);
    if (!prod) {
      return res.status(404).json({ message: 'Marketplace product not found' });
    }

    // 2. Create inventory record
    const inventory = await InventoryModel.create({
      product,
      productName,
      farmer: req.user._id,
      batchNumber,
      harvestDate,
      expiryDate,
      qualityGrade: qualityGrade || 'A',
      location: location || 'Warehouse A',
      quantity: parseFloat(quantity) || 0,
      history: [{
        quantity: parseFloat(quantity) || 0,
        type: 'harvest',
        notes: notes || 'Initial harvest batch log'
      }]
    });

    // 3. Auto-sync Product master stock count
    // Sum up all inventory batches of this product
    const allBatches = await InventoryModel.find({ product });
    const totalStock = allBatches.reduce((acc, curr) => acc + curr.quantity, 0);

    await ProductModel.findByIdAndUpdate(product, {
      stock: totalStock,
      status: totalStock > 0 ? 'available' : 'out-of-stock'
    });

    res.status(201).json(inventory);
  } catch (error) {
    console.error('Inventory log error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update/Adjust batch quantity
// @route   PUT /api/inventory/:id
// @access  Private/Farmer
router.put('/:id', protect, authorize('farmer'), async (req, res) => {
  const { quantity, type, notes, qualityGrade, location } = req.body;

  try {
    const batch = await InventoryModel.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Inventory batch not found' });
    }

    if (batch.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Process new adjustments
    let newQuantity = batch.quantity;
    const historyItem = {
      quantity: parseFloat(quantity) || 0,
      type: type || 'adjustment',
      date: new Date(),
      notes: notes || 'Batch adjustment update'
    };

    if (type === 'spoilage' || type === 'sale') {
      newQuantity -= parseFloat(quantity);
    } else if (type === 'harvest' || type === 'adjustment') {
      newQuantity += parseFloat(quantity);
    }

    if (newQuantity < 0) newQuantity = 0;

    const updatedBatch = await InventoryModel.findByIdAndUpdate(req.params.id, {
      quantity: newQuantity,
      qualityGrade: qualityGrade || batch.qualityGrade,
      location: location || batch.location,
      $push: { history: historyItem }
    });

    // 2. Sum up all active batches of this product to update the master Product stock
    const allBatches = await InventoryModel.find({ product: batch.product });
    const totalStock = allBatches.reduce((acc, curr) => acc + curr.quantity, 0);

    await ProductModel.findByIdAndUpdate(batch.product, {
      stock: totalStock,
      status: totalStock > 0 ? 'available' : 'out-of-stock'
    });

    res.json(updatedBatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
