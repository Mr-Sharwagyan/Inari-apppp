import mongoose from 'mongoose';
import { mockDb } from '../utils/mockDb.js';

const OrderSchema = new mongoose.Schema({
  customer: { type: String, required: true }, // User ID
  items: [{
    product: { type: String, required: true }, // Product ID
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    farmer: { type: String, required: true }, // Farmer ID
    unit: { type: String, default: 'kg' }
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    fullName: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

const MongoOrder = mongoose.model('Order', OrderSchema);

const OrderModel = {
  find: async (query = {}) => {
    if (global.useMockDb) return mockDb.find('Order', query);
    return MongoOrder.find(query);
  },
  findOne: async (query = {}) => {
    if (global.useMockDb) return mockDb.findOne('Order', query);
    return MongoOrder.findOne(query);
  },
  findById: async (id) => {
    if (global.useMockDb) return mockDb.findById('Order', id);
    try {
      return await MongoOrder.findById(id);
    } catch {
      return null;
    }
  },
  create: async (data) => {
    if (global.useMockDb) return mockDb.create('Order', data);
    return MongoOrder.create(data);
  },
  findByIdAndUpdate: async (id, update) => {
    if (global.useMockDb) return mockDb.findByIdAndUpdate('Order', id, update);
    return MongoOrder.findByIdAndUpdate(id, update, { new: true });
  },
  findByIdAndDelete: async (id) => {
    if (global.useMockDb) return mockDb.findByIdAndDelete('Order', id);
    return MongoOrder.findByIdAndDelete(id);
  }
};

export default OrderModel;
export { MongoOrder };
