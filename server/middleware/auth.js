import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'inari_secret_key_12345';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from the database
      const user = await UserModel.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'User session expired or not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};
