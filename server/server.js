
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { seedData } from './utils/seeder.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

// Load ENV
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database & Auto Seed
const startServer = async () => {
  await connectDB();
  await seedData();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static Assets (for uploaded product crop photos)
  app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

  // API Route Mounting
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/events', eventRoutes);
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      database: global.useMockDb ? 'local-mock-store' : 'mongodb',
      timestamp: new Date()
    });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('Server error stack:', err.stack);
    res.status(500).json({ message: err.message || 'Something went wrong on the server' });
  });

  // Start Listener
  app.listen(PORT, () => {
    console.log(`🚀 INARI ERP & Marketplace backend running on http://localhost:${PORT}`);
  });
};

startServer();
