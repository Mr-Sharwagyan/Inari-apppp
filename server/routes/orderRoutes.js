import express from 'express';
import OrderModel from '../models/Order.js';
import ProductModel from '../models/Product.js';
import NotificationModel from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
router.post('/', protect, authorize('customer'), async (req, res) => {
  const { items, totalAmount, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }

  try {
    // 1. Verify stocks and deduct
    for (const item of items) {
      const product = await ProductModel.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${item.name}` });
      }

      const newStock = product.stock - item.quantity;

      await ProductModel.findByIdAndUpdate(item.product, {
        stock: newStock,
        status: newStock > 0 ? 'available' : 'out-of-stock'
      });
    }

    // 2. Create order
    const order = await OrderModel.create({
      customer: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentStatus: 'paid',
      orderStatus: 'pending'
    });

    const orderId = order._id.toString();

    // 3. Notify farmers
    const uniqueFarmers = [...new Set(items.map(item => item.farmer))];

    for (const farmerId of uniqueFarmers) {
      await NotificationModel.create({
        recipient: farmerId,
        title: 'New Customer Order Received',
        message: `You have received an order for crops. Order ID: ${orderId.substring(0, 8)}`,
        type: 'order'
      });
    }

    res.status(201).json(order);

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private/Customer
router.get('/', protect, authorize('customer'), async (req, res) => {
  try {
    const orders = await OrderModel.find({ customer: req.user._id });

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get farmer orders
// @route   GET /api/orders/farmer
// @access  Private/Farmer
router.get('/farmer', protect, authorize('farmer'), async (req, res) => {
  try {
    const orders = await OrderModel.find({});

    const farmerOrders = orders.filter(order =>
      order.items.some(item =>
        item.farmer.toString() === req.user._id.toString()
      )
    );

    const tailoredOrders = farmerOrders.map(order => {
      const orderObj =
        typeof order.toObject === 'function'
          ? order.toObject()
          : order;

      return {
        ...orderObj,
        items: orderObj.items.filter(
          item => item.farmer.toString() === req.user._id.toString()
        )
      };
    });

    tailoredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(tailoredOrders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Farmer/Admin
router.put('/:id/status', protect, authorize('farmer', 'admin'), async (req, res) => {
  const { status } = req.body;

  try {
    const order = await OrderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );

    const orderId = order._id.toString();

    await NotificationModel.create({
      recipient: order.customer,
      title: 'Order Status Update',
      message: `Your order status has been updated to: ${status}. Order ID: ${orderId.substring(0, 8)}`,
      type: 'order'
    });

    res.json(updatedOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;