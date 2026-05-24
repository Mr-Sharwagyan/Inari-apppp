import mongoose from 'mongoose';
import { mockDb } from '../utils/mockDb.js';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const MongoCategory = mongoose.model('Category', CategorySchema);

const CategoryModel = {
  find: async (query = {}) => {
    if (global.useMockDb) return mockDb.find('Category', query);
    return MongoCategory.find(query);
  },
  findOne: async (query = {}) => {
    if (global.useMockDb) return mockDb.findOne('Category', query);
    return MongoCategory.findOne(query);
  },
  findById: async (id) => {
    if (global.useMockDb) return mockDb.findById('Category', id);
    try {
      return await MongoCategory.findById(id);
    } catch {
      return null;
    }
  },
  create: async (data) => {
    if (global.useMockDb) return mockDb.create('Category', data);
    return MongoCategory.create(data);
  },
  findByIdAndUpdate: async (id, update) => {
    if (global.useMockDb) return mockDb.findByIdAndUpdate('Category', id, update);
    return MongoCategory.findByIdAndUpdate(id, update, { new: true });
  },
  findByIdAndDelete: async (id) => {
    if (global.useMockDb) return mockDb.findByIdAndDelete('Category', id);
    return MongoCategory.findByIdAndDelete(id);
  }
};

export default CategoryModel;
export { MongoCategory };
