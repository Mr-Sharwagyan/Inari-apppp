import mongoose from 'mongoose';
import { mockDb } from '../utils/mockDb.js';

const InventorySchema = new mongoose.Schema({
  product: { type: String, required: true }, // Product ID
  productName: { type: String, required: true },
  farmer: { type: String, required: true }, // Farmer ID
  batchNumber: { type: String, required: true },
  harvestDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  qualityGrade: { type: String, enum: ['A', 'B', 'C'], default: 'A' },
  location: { type: String, required: true, default: 'Warehouse A' },
  quantity: { type: Number, required: true, default: 0 },
  history: [{
    quantity: { type: Number, required: true },
    type: { 
      type: String, 
      enum: ['harvest', 'sale', 'spoilage', 'adjustment'], 
      required: true 
    },
    date: { type: Date, default: Date.now },
    notes: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

const MongoInventory = mongoose.model('Inventory', InventorySchema);

const InventoryModel = {
  find: async (query = {}) => {
    if (global.useMockDb) return mockDb.find('Inventory', query);
    return MongoInventory.find(query);
  },
  findOne: async (query = {}) => {
    if (global.useMockDb) return mockDb.findOne('Inventory', query);
    return MongoInventory.findOne(query);
  },
  findById: async (id) => {
    if (global.useMockDb) return mockDb.findById('Inventory', id);
    try {
      return await MongoInventory.findById(id);
    } catch {
      return null;
    }
  },
  create: async (data) => {
    if (global.useMockDb) return mockDb.create('Inventory', data);
    return MongoInventory.create(data);
  },
  findByIdAndUpdate: async (id, update) => {
    if (global.useMockDb) return mockDb.findByIdAndUpdate('Inventory', id, update);
    return MongoInventory.findByIdAndUpdate(id, update, { new: true });
  },
  findByIdAndDelete: async (id) => {
    if (global.useMockDb) return mockDb.findByIdAndDelete('Inventory', id);
    return MongoInventory.findByIdAndDelete(id);
  }
};

export default InventoryModel;
export { MongoInventory };
