import express from 'express';
import OrderModel from '../models/Order.js';
import ProductModel from '../models/Product.js';
import InventoryModel from '../models/Inventory.js';
import UserModel from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get analytics for Farmer ERP
// @route   GET /api/analytics/farmer
// @access  Private/Farmer
router.get('/farmer', protect, authorize('farmer'), async (req, res) => {
  try {
    const farmerId = req.user._id.toString();

    // 1. Get farmer's products
    const products = await ProductModel.find({ farmer: farmerId });

    // 2. Get orders that contain this farmer's items
    const allOrders = await OrderModel.find({});
    const farmerOrders = allOrders.filter(order =>
      order.items.some(item => item.farmer.toString() === farmerId)
    );

    // 3. Calculate real revenue & units sold
    let totalRevenue = 0;
    let totalUnitsSold = 0;

    farmerOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.farmer.toString() === farmerId) {
          totalRevenue += item.price * item.quantity;
          totalUnitsSold += item.quantity;
        }
      });
    });

    // 4. Count inventory batches
    const batches = await InventoryModel.find({ farmer: farmerId });
    const totalInventoryCount = batches.reduce((acc, curr) => acc + curr.quantity, 0);

    // 5. Low stock alerts (products with stock <= 15)
    const lowStockCount = products.filter(p => p.stock <= 15).length;

    // 6. Category breakdown from real products only
    const categoryMap = {};
    products.forEach(p => {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + p.stock;
    });
    const categoryBreakdown = Object.keys(categoryMap).map(name => ({
      name,
      value: categoryMap[name]
    }));

    // 7. Build real monthly revenue chart from actual orders
    //    Groups orders by the month they were created, last 6 months.
    const now = new Date();
    const monthLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthLabels.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: d.toLocaleString('default', { month: 'short' }),
        Revenue: 0,
        Sales: 0,
      });
    }

    farmerOrders.forEach(order => {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = monthLabels.find(m => m.key === key);
      if (bucket) {
        order.items.forEach(item => {
          if (item.farmer.toString() === farmerId) {
            bucket.Revenue += item.price * item.quantity;
            bucket.Sales   += item.quantity;
          }
        });
      }
    });

    const monthlyRevenue = monthLabels.map(({ key, ...rest }) => ({
      ...rest,
      Revenue: Math.round(rest.Revenue),
    }));

    // 8. Real weekly sales (orders placed in the last 7 days)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyMap = {};
    dayNames.forEach(d => (weeklyMap[d] = 0));

    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    farmerOrders
      .filter(o => new Date(o.createdAt) >= sevenDaysAgo)
      .forEach(order => {
        const dayName = dayNames[new Date(order.createdAt).getDay()];
        order.items.forEach(item => {
          if (item.farmer.toString() === farmerId) {
            weeklyMap[dayName] += item.price * item.quantity;
          }
        });
      });

    const weeklySales = dayNames.map(name => ({
      name,
      Amount: Math.round(weeklyMap[name]),
    }));

    res.json({
      summary: {
        totalRevenue:         Math.round(totalRevenue),
        totalOrders:          farmerOrders.length,
        totalProducts:        products.length,
        totalInventoryCount:  totalInventoryCount,
        lowStockCount:        lowStockCount,
        unitsSold:            totalUnitsSold,
      },
      charts: {
        monthlyRevenue,
        weeklySales,
        categoryBreakdown,   // empty array [] when farmer has no products — handled on frontend
      },
    });
  } catch (error) {
    console.error('Farmer analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get analytics for Admin
// @route   GET /api/analytics/admin
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const users    = await UserModel.find({});
    const products = await ProductModel.find({});
    const orders   = await OrderModel.find({});

    const totalFarmers    = users.filter(u => u.role === 'farmer').length;
    const totalCustomers  = users.filter(u => u.role === 'customer').length;
    const pendingFarmers  = users.filter(u => u.role === 'farmer' && u.status === 'pending').length;
    const totalRevenue    = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

    res.json({
      summary: {
        totalFarmers,
        totalCustomers,
        totalProducts:    products.length,
        totalOrders:      orders.length,
        totalRevenue:     Math.round(totalRevenue),
        pendingApprovals: pendingFarmers,
      },
      recentOrders: orders.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;