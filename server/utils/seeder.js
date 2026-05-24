import bcrypt from 'bcryptjs';
import UserModel from '../models/User.js';
import CategoryModel from '../models/Category.js';
import ProductModel from '../models/Product.js';
import InventoryModel from '../models/Inventory.js';
import OrderModel from '../models/Order.js';

export const seedData = async () => {
  try {
    // Check if seeding is already completed
    const existingUsers = await UserModel.find({});
    if (existingUsers.length > 0) {
      console.log('🌱 Data already exists. Skipping database seeding.');
      return;
    }

    console.log('🌱 Database is empty. Seeding initial INARI dummy data...');

    // Hash password helper
    const salt = await bcrypt.genSalt(10);
    const hashPassword = async (pwd) => bcrypt.hash(pwd, salt);

    // 1. Seed Users
    const adminPassword = await hashPassword('admin123');
    const farmerPassword = await hashPassword('farmer123');
    const customerPassword = await hashPassword('customer123');

    const admin = await UserModel.create({
      name: 'INARI Admin Panel',
      email: 'admin@inari.com',
      password: adminPassword,
      role: 'admin',
      phone: '+1 (555) 0199',
      address: 'INARI Headquarters, San Francisco, CA',
      status: 'approved'
    });

    const farmer1 = await UserModel.create({
      name: 'Green Valley Farm (John)',
      email: 'farmer@inari.com', // Primary testing farmer
      password: farmerPassword,
      role: 'farmer',
      phone: '+1 (555) 0122',
      address: 'Green Valley Field 4, Sonoma, CA',
      status: 'approved'
    });

    const farmer2 = await UserModel.create({
      name: 'Meadow Orchards (Jane)',
      email: 'farmer-pending@inari.com',
      password: farmerPassword,
      role: 'farmer',
      phone: '+1 (555) 0155',
      address: 'Apple Lane Orchards, Hood River, OR',
      status: 'pending' // For testing admin approval flow
    });

    const customer = await UserModel.create({
      name: 'Arthur Customer',
      email: 'customer@inari.com',
      password: customerPassword,
      role: 'customer',
      phone: '+1 (555) 0188',
      address: '250 Market St, Apt 4B, San Francisco, CA',
      status: 'approved'
    });

    console.log('✅ Users seeded successfully.');

    // 2. Seed Categories
    const categories = [
      { name: 'Grains', slug: 'grains', description: 'Fresh cereals, wheat, barley, and rice crops.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80' },
      { name: 'Vegetables', slug: 'vegetables', description: 'Freshly harvested organic vegetables.', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80' },
      { name: 'Fruits', slug: 'fruits', description: 'Organic farm orchard fruits.', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=600&q=80' },
      { name: 'Dairy', slug: 'dairy', description: 'Farm fresh organic milk, cheese, and butter.', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80' }
    ];

    for (const cat of categories) {
      await CategoryModel.create(cat);
    }
    console.log('✅ Categories seeded successfully.');

    // 3. Seed Products (associated with farmer1)
    const productData = [
      {
        name: 'Organic Winter Wheat',
        description: 'Premium quality organic winter wheat, milled to perfection. High protein content ideal for artisanal breads and baking.',
        price: 2.50,
        unit: 'kg',
        category: 'Grains',
        farmer: farmer1._id.toString(),
        stock: 500,
        images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'],
        status: 'available'
      },
      {
        name: 'Heirloom Beefsteak Tomatoes',
        description: 'Juicy, vine-ripened organic heirloom beefsteak tomatoes. Perfect for summer salads, sandwiches, and rich tomato sauces.',
        price: 4.80,
        unit: 'kg',
        category: 'Vegetables',
        farmer: farmer1._id.toString(),
        stock: 120,
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'],
        status: 'available'
      },
      {
        name: 'Sweet Honeycrisp Apples',
        description: 'Crisp, sweet, and slightly tart organic Honeycrisp apples freshly handpicked from local orchards.',
        price: 3.90,
        unit: 'kg',
        category: 'Fruits',
        farmer: farmer1._id.toString(),
        stock: 80,
        images: ['https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=600&q=80'],
        status: 'available'
      },
      {
        name: 'Fresh Jersey Whole Milk',
        description: 'Non-homogenized, pasteurized farm fresh whole milk from grass-fed Jersey cows. Rich, creamy, and loaded with nutrients.',
        price: 3.20,
        unit: 'L',
        category: 'Dairy',
        farmer: farmer1._id.toString(),
        stock: 60,
        images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80'],
        status: 'available'
      },
      {
        name: 'Organic Sweet Corn',
        description: 'Golden sweet corn ears freshly picked in the morning. Exceptionally sweet and perfect for grilling or steaming.',
        price: 1.20,
        unit: 'piece',
        category: 'Vegetables',
        farmer: farmer1._id.toString(),
        stock: 0, // Out of stock for testing alert
        images: ['https://images.unsplash.com/photo-1551754625-702980ab887a?auto=format&fit=crop&w=600&q=80'],
        status: 'out-of-stock'
      }
    ];

    const seededProducts = [];
    for (const prod of productData) {
      const p = await ProductModel.create(prod);
      seededProducts.push(p);
    }
    console.log('✅ Products seeded successfully.');

    // 4. Seed Inventory Batches
    // For Wheat, Tomatoes, Milk
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const expiryWheat = new Date();
    expiryWheat.setMonth(expiryWheat.getMonth() + 6);

    const expiryTomatoes = new Date();
    expiryTomatoes.setDate(expiryTomatoes.getDate() + 14);

    const expiryMilk = new Date();
    expiryMilk.setDate(expiryMilk.getDate() + 7);

    const inventories = [
      {
        product: seededProducts[0]._id.toString(),
        productName: seededProducts[0].name,
        farmer: farmer1._id.toString(),
        batchNumber: 'B-WHEAT-001',
        harvestDate: new Date(),
        expiryDate: expiryWheat,
        qualityGrade: 'A',
        location: 'Silo 2A',
        quantity: 500,
        history: [{ quantity: 500, type: 'harvest', notes: 'Grain bin load 1' }]
      },
      {
        product: seededProducts[1]._id.toString(),
        productName: seededProducts[1].name,
        farmer: farmer1._id.toString(),
        batchNumber: 'B-TOMATO-09',
        harvestDate: new Date(),
        expiryDate: expiryTomatoes,
        qualityGrade: 'A',
        location: 'Cold Room 1',
        quantity: 80,
        history: [{ quantity: 80, type: 'harvest', notes: 'Morning harvest' }]
      },
      {
        product: seededProducts[1]._id.toString(),
        productName: seededProducts[1].name,
        farmer: farmer1._id.toString(),
        batchNumber: 'B-TOMATO-10',
        harvestDate: new Date(),
        expiryDate: expiryTomatoes,
        qualityGrade: 'B',
        location: 'Cold Room 2',
        quantity: 40,
        history: [{ quantity: 40, type: 'harvest', notes: 'Midday harvest' }]
      },
      {
        product: seededProducts[3]._id.toString(),
        productName: seededProducts[3].name,
        farmer: farmer1._id.toString(),
        batchNumber: 'B-MILK-784',
        harvestDate: new Date(),
        expiryDate: expiryMilk,
        qualityGrade: 'A',
        location: 'Dairy Cooler 3',
        quantity: 60,
        history: [{ quantity: 60, type: 'harvest', notes: 'Morning milking' }]
      }
    ];

    for (const inv of inventories) {
      await InventoryModel.create(inv);
    }
    console.log('✅ Inventory batches seeded successfully.');

    // 5. Seed Past Orders
    const orderData = [
      {
        customer: customer._id.toString(),
        items: [
          {
            product: seededProducts[0]._id.toString(),
            name: seededProducts[0].name,
            quantity: 10,
            price: seededProducts[0].price,
            farmer: farmer1._id.toString(),
            unit: seededProducts[0].unit
          },
          {
            product: seededProducts[1]._id.toString(),
            name: seededProducts[1].name,
            quantity: 5,
            price: seededProducts[1].price,
            farmer: farmer1._id.toString(),
            unit: seededProducts[1].unit
          }
        ],
        totalAmount: 49.00,
        shippingAddress: {
          fullName: 'Arthur Customer',
          addressLine: '250 Market St, Apt 4B',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          phone: '+1 (555) 0188'
        },
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        customer: customer._id.toString(),
        items: [
          {
            product: seededProducts[2]._id.toString(),
            name: seededProducts[2].name,
            quantity: 3,
            price: seededProducts[2].price,
            farmer: farmer1._id.toString(),
            unit: seededProducts[2].unit
          }
        ],
        totalAmount: 11.70,
        shippingAddress: {
          fullName: 'Arthur Customer',
          addressLine: '250 Market St, Apt 4B',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          phone: '+1 (555) 0188'
        },
        paymentStatus: 'paid',
        orderStatus: 'processing',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    for (const ord of orderData) {
      await OrderModel.create(ord);
    }
    console.log('✅ Past orders seeded successfully.');
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during data seeding:', error);
  }
};

// Directly runnable if called via npm run seed
if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
  // Config mockDb context
  global.useMockDb = true;
  seedData();
}
