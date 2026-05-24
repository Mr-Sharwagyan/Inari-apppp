import mongoose from 'mongoose';
import { mockDb } from '../utils/mockDb.js';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true, default: 'kg' },
  images: [{ type: String }],
  category: { type: String, required: true }, // Name of category or reference
  farmer: { type: String, required: true }, // User ID ref of the farmer
  stock: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['available', 'out-of-stock'], default: 'available' },
  createdAt: { type: Date, default: Date.now }
});

const MongoProduct = mongoose.model('Product', ProductSchema);

const ProductModel = {
  find: async (query = {}) => {
    if (global.useMockDb) return mockDb.find('Product', query);
    return MongoProduct.find(query);
  },
  findOne: async (query = {}) => {
    if (global.useMockDb) return mockDb.findOne('Product', query);
    return MongoProduct.findOne(query);
  },
  findById: async (id) => {
    if (global.useMockDb) return mockDb.findById('Product', id);
    try {
      return await MongoProduct.findById(id);
    } catch {
      return null;
    }
  },
  create: async (data) => {
    if (global.useMockDb) return mockDb.create('Product', data);
    return MongoProduct.create(data);
  },
  findByIdAndUpdate: async (id, update) => {
    if (global.useMockDb) return mockDb.findByIdAndUpdate('Product', id, update);
    return MongoProduct.findByIdAndUpdate(id, update, { new: true });
  },
  findByIdAndDelete: async (id) => {
    if (global.useMockDb) return mockDb.findByIdAndDelete('Product', id);
    return MongoProduct.findByIdAndDelete(id);
  },
  updateOne: async (query, update) => {
    if (global.useMockDb) return mockDb.updateOne('Product', query, update);
    return MongoProduct.updateOne(query, update);
  }
};

export default ProductModel;
export { MongoProduct };
