import express from 'express';
import { mockDb } from '../utils/mockDb.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Simple in-memory store for community posts (also persists to mockDb for dev)
// GET all posts, optionally filtered by topic
router.get('/', async (req, res) => {
  try {
    let posts = mockDb.find('CommunityPost', {});
    if (req.query.topic && req.query.topic !== 'all') {
      posts = posts.filter(p => p.topic === req.query.topic);
    }
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a post
router.post('/', protect, async (req, res) => {
  const { message, topic } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required' });
  try {
    const post = mockDb.create('CommunityPost', {
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      message: message.trim(),
      topic: topic || 'general',
      likes: [],
      createdAt: new Date().toISOString()
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT like/unlike a post
router.put('/:id/like', protect, async (req, res) => {
  try {
    const posts = mockDb.find('CommunityPost', {});
    const post = posts.find(p => p._id === req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user._id.toString();
    const liked = post.likes.includes(userId);
    const updatedLikes = liked ? post.likes.filter(id => id !== userId) : [...post.likes, userId];
    const updated = mockDb.findByIdAndUpdate('CommunityPost', req.params.id, { likes: updatedLikes });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a post (own post or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const posts = mockDb.find('CommunityPost', {});
    const post = posts.find(p => p._id === req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    mockDb.findByIdAndDelete('CommunityPost', req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;