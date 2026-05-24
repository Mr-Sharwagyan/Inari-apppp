import mongoose from 'mongoose';
import { mockDb } from '../utils/mockDb.js';

const NotificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true }, // User ID
  sender: { type: String }, // User ID (optional)
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['order', 'stock', 'approval', 'general'], 
    default: 'general' 
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const MongoNotification = mongoose.model('Notification', NotificationSchema);

const NotificationModel = {
  find: async (query = {}) => {
    if (global.useMockDb) return mockDb.find('Notification', query);
    return MongoNotification.find(query);
  },
  findOne: async (query = {}) => {
    if (global.useMockDb) return mockDb.findOne('Notification', query);
    return MongoNotification.findOne(query);
  },
  findById: async (id) => {
    if (global.useMockDb) return mockDb.findById('Notification', id);
    try {
      return await MongoNotification.findById(id);
    } catch {
      return null;
    }
  },
  create: async (data) => {
    if (global.useMockDb) return mockDb.create('Notification', data);
    return MongoNotification.create(data);
  },
  findByIdAndUpdate: async (id, update) => {
    if (global.useMockDb) return mockDb.findByIdAndUpdate('Notification', id, update);
    return MongoNotification.findByIdAndUpdate(id, update, { new: true });
  },
  findByIdAndDelete: async (id) => {
    if (global.useMockDb) return mockDb.findByIdAndDelete('Notification', id);
    return MongoNotification.findByIdAndDelete(id);
  }
};

export default NotificationModel;
export { MongoNotification };
