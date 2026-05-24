import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const getFilePath = (model) => path.join(DATA_DIR, `${model.toLowerCase()}.json`);

export const readJSON = (model) => {
  const filePath = getFilePath(model);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading mock db file for ${model}:`, error);
    return [];
  }
};

export const writeJSON = (model, data) => {
  const filePath = getFilePath(model);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing mock db file for ${model}:`, error);
    return false;
  }
};

export const mockDb = {
  find: (model, query = {}) => {
    let items = readJSON(model);
    return items.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined) {
          // Soft match for simple queries
          if (typeof query[key] === 'object' && query[key] !== null) {
            // Handle simple operator matching like $in or $ne if needed
            if ('$in' in query[key]) {
              if (!query[key].$in.includes(item[key])) return false;
            } else if ('$ne' in query[key]) {
              if (item[key] === query[key].$ne) return false;
            }
          } else if (item[key] !== query[key]) {
            return false;
          }
        }
      }
      return true;
    });
  },

  findOne: (model, query = {}) => {
    const items = mockDb.find(model, query);
    return items.length > 0 ? items[0] : null;
  },

  findById: (model, id) => {
    return mockDb.findOne(model, { _id: id });
  },

  create: (model, data) => {
    const items = readJSON(model);
    const newItem = {
      _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      ...data
    };
    items.push(newItem);
    writeJSON(model, items);
    return newItem;
  },

  findByIdAndUpdate: (model, id, update) => {
    const items = readJSON(model);
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    // Handle mongoose style updates e.g., { $set: {...} } or direct object
    const actualUpdate = update.$set || update;
    items[index] = {
      ...items[index],
      ...actualUpdate,
      updatedAt: new Date().toISOString()
    };
    writeJSON(model, items);
    return items[index];
  },

  findByIdAndDelete: (model, id) => {
    const items = readJSON(model);
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    const deleted = items.splice(index, 1)[0];
    writeJSON(model, items);
    return deleted;
  },

  updateOne: (model, query, update) => {
    const item = mockDb.findOne(model, query);
    if (!item) return null;
    return mockDb.findByIdAndUpdate(model, item._id, update);
  }
};
