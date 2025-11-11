import express from 'express';
import {
  register,
  login,
  getProfile,
  getAllUsers,
  updateProfile,
  validateToken,
  deleteUser,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../../../shared/middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

// Protected routes (require authentication)
router.get('/validate-token', authMiddleware, asyncHandler(validateToken));
router.get('/users', authMiddleware, asyncHandler(getAllUsers)); // Get all users (admin only)
router.get('/profile', authMiddleware, asyncHandler(getProfile)); // Get current user's profile (from token)
router.get('/profile/:id', authMiddleware, asyncHandler(getProfile)); // Get specific user's profile
router.put('/profile/:id', authMiddleware, asyncHandler(updateProfile));
router.delete('/profile/:id', authMiddleware, asyncHandler(deleteUser));

export default router;

