import express from 'express';
import OrderModel from '../models/Order.js';
import ProductModel from '../models/Product.js';
import NotificationModel from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Verify Khalti payment
// @route   POST /api/orders/verify-khalti
// @access  Private/Customer
router.post('/verify-khalti', protect, authorize('customer'), async (req, res) => {
  const { token, amount } = req.body;
  try {
    const khaltiRes = await fetch('https://khalti.com/api/v2/payment/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY || 'test_secret_key_dc74e0fd57cb46cd93832aee0a390234'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, amount })
    });
    const data = await khaltiRes.json();
    if (!khaltiRes.ok) {
      return res.status(400).json({ message: 'Khalti payment verification failed', detail: data });
    }
    res.json({ verified: true, transaction_id: data.idx });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
router.post('/', protect, authorize('customer'), async (req, res) => {
  const { items, totalAmount, shippingAddress, paymentMethod, khaltiTransactionId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }
  if (!paymentMethod || !['cod', 'khalti'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method. Use cod or khalti.' });
  }
  if (paymentMethod === 'khalti' && !khaltiTransactionId) {
    return res.status(400).json({ message: 'Khalti transaction ID required for online payment.' });
  }

  try {
    // 1. Verify stocks and deduct
    for (const item of items) {
      const product = await ProductModel.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product ${item.name} not found` });
      if (product.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
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
      paymentMethod,
      khaltiTransactionId: khaltiTransactionId || null,
      paymentStatus: paymentMethod === 'khalti' ? 'paid' : 'pending',
      orderStatus: 'pending'
    });

    const orderId = order._id.toString();

    // 3. Notify farmers
    const uniqueFarmers = [...new Set(items.map(item => item.farmer))];
    for (const farmerId of uniqueFarmers) {
      await NotificationModel.create({
        recipient: farmerId,
        title: 'New Customer Order Received',
        message: `New order via ${paymentMethod === 'khalti' ? 'Online (Khalti)' : 'Cash on Delivery'}. Order ID: ${orderId.substring(0, 8)}`,
        type: 'order'
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged-in customer's own orders
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

// @desc    Get ALL orders on the platform (admin only)
// @route   GET /api/orders/all
// @access  Private/Admin
// IMPORTANT: must be defined BEFORE /farmer and any future /:id routes so
// Express does not treat the literal string "all" as a dynamic :id param.
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await OrderModel.find({});
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get orders containing the logged-in farmer's products
// @route   GET /api/orders/farmer
// @access  Private/Farmer
router.get('/farmer', protect, authorize('farmer'), async (req, res) => {
  try {
    const orders = await OrderModel.find({});
    const farmerOrders = orders.filter(order =>
      order.items.some(item => item.farmer.toString() === req.user._id.toString())
    );
    const tailoredOrders = farmerOrders.map(order => {
      const orderObj = typeof order.toObject === 'function' ? order.toObject() : order;
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
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );
    await NotificationModel.create({
      recipient: order.customer,
      title: 'Order Status Update',
      message: `Your order status updated to: ${status}. Order ID: ${order._id.toString().substring(0, 8)}`,
      type: 'order'
    });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// @desc    Update delivery location (ADMIN / FARMER)
// @route   PUT /api/orders/delivery/location/:id
// @access  Private/Admin/Farmer
router.put(
  '/delivery/location/:id',
  protect,
  authorize('admin', 'farmer'),
  async (req, res) => {
    const { lat, lng } = req.body;

    try {
      const order = await OrderModel.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const updatedOrder = await OrderModel.findByIdAndUpdate(
        req.params.id,
        {
          deliveryLocation: {
            lat,
            lng,
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;