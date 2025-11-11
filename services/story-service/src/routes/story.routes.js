import express from 'express';
import {
  getAllStories,
  getStoryById,
  getStoriesByUser,
  createStory,
  updateStory,
  deleteStory,
  deleteUserStories,
  searchStories,
} from '../controllers/story.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../../../shared/middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.get('/', asyncHandler(getAllStories));
router.get('/search', asyncHandler(searchStories));
router.get('/:id', asyncHandler(getStoryById));
router.get('/user/:userId', asyncHandler(getStoriesByUser));

// Protected routes
router.post('/', authMiddleware, asyncHandler(createStory));
router.put('/:id', authMiddleware, asyncHandler(updateStory));
router.delete('/:id', authMiddleware, asyncHandler(deleteStory));
router.delete('/user/:userId', authMiddleware, asyncHandler(deleteUserStories)); // Admin only - delete all user stories

export default router;

