import mongoose from 'mongoose';
import { mockDb } from '../utils/mockDb.js';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'customer', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', UserSchema);

const UserModel = {
  find: async (query = {}) => {
    if (global.useMockDb) return mockDb.find('User', query);
    return MongoUser.find(query);
  },
  findOne: async (query = {}) => {
    if (global.useMockDb) return mockDb.findOne('User', query);
    return MongoUser.findOne(query);
  },
  findById: async (id) => {
    if (global.useMockDb) return mockDb.findById('User', id);
    try {
      return await MongoUser.findById(id);
    } catch {
      return null;
    }
  },
  create: async (data) => {
    if (global.useMockDb) return mockDb.create('User', data);
    return MongoUser.create(data);
  },
  findByIdAndUpdate: async (id, update) => {
    if (global.useMockDb) return mockDb.findByIdAndUpdate('User', id, update);
    return MongoUser.findByIdAndUpdate(id, update, { new: true });
  },
  findByIdAndDelete: async (id) => {
    if (global.useMockDb) return mockDb.findByIdAndDelete('User', id);
    return MongoUser.findByIdAndDelete(id);
  },
  updateOne: async (query, update) => {
    if (global.useMockDb) return mockDb.updateOne('User', query, update);
    return MongoUser.updateOne(query, update);
  }
};

export default UserModel;
export { MongoUser };
