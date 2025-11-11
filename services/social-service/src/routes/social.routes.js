import express from 'express';
import {
  likePost,
  unlikePost,
  getLikes,
  addComment,
  getComments,
  deleteComment,
  deleteUserComments,
  sharePost,
} from '../controllers/social.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../../../shared/middleware/errorHandler.js';

const router = express.Router();

// Likes
router.post('/likes/:postId', authMiddleware, asyncHandler(likePost));
router.delete('/likes/:postId', authMiddleware, asyncHandler(unlikePost));
router.get('/likes/:postId', asyncHandler(getLikes));

// Comments
router.post('/comments/:postId', authMiddleware, asyncHandler(addComment));
router.get('/comments/:postId', asyncHandler(getComments));
router.delete('/comments/:commentId', authMiddleware, asyncHandler(deleteComment));
router.delete('/comments/user/:userId', authMiddleware, asyncHandler(deleteUserComments)); // Admin only - delete all user comments

// Shares
router.post('/shares/:postId', authMiddleware, asyncHandler(sharePost));

export default router;

