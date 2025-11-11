import * as socialService from '../services/social.service.js';
import { publishEvent } from '../../../shared/events/rabbitmq.js';
import { EventTypes, ExchangeNames } from '../../../shared/events/eventTypes.js';
import { createLogger } from '../../../shared/utils/logger.js';
import Joi from 'joi';

const logger = createLogger('SOCIAL-CONTROLLER');

const commentSchema = Joi.object({
  text: Joi.string().min(1).max(500).required(),
  username: Joi.string().optional(), // Frontend sends this, we'll override with req.user.username
  date: Joi.date().optional(), // Frontend sends this, we'll use server timestamp
}).unknown(true); // Allow other fields to be passed through

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if already liked - if so, unlike it (toggle behavior)
    const existing = await socialService.checkIfLiked(postId, userId);
    
    if (existing) {
      // Unlike the post
      await socialService.unlikePost(postId, userId);
      
      await publishEvent(ExchangeNames.SOCIAL_EXCHANGE, EventTypes.POST_UNLIKED, {
        postId: parseInt(postId),
        userId,
        timestamp: new Date().toISOString(),
      });
      
      logger.info('Post unliked (toggle)', { postId, userId });
      return res.json({ message: 'Post unliked successfully', liked: false });
    }
    
    // Like the post
    const like = await socialService.likePost(postId, userId);

    // Fetch post details to get the post owner
    const postOwner = await socialService.getPostOwner(postId);

    // Publish like event - send notification to post owner, not the liker
    if (postOwner && postOwner.user_id !== userId) {
      await publishEvent(ExchangeNames.SOCIAL_EXCHANGE, EventTypes.POST_LIKED, {
        postId: parseInt(postId),
        userId: postOwner.user_id, // Post owner who should receive notification
        postOwnerId: postOwner.user_id, // Explicit post owner ID
        likerId: userId, // Person who liked
        likedBy: req.user.username, // Username of person who liked
        postTitle: postOwner.caption || 'your post', // Post title/caption
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('Post liked', { postId, userId });
    res.status(201).json({ message: 'Post liked successfully', like, liked: true });
  } catch (error) {
    logger.error('Failed to like post', { error: error.message });
    res.status(500).json({ message: 'Failed to like post' });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    await socialService.unlikePost(postId, userId);

    await publishEvent(ExchangeNames.SOCIAL_EXCHANGE, EventTypes.POST_UNLIKED, {
      postId: parseInt(postId),
      userId,
      timestamp: new Date().toISOString(),
    });

    logger.info('Post unliked', { postId, userId });
    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    logger.error('Failed to unlike post', { error: error.message });
    res.status(500).json({ message: 'Failed to unlike post' });
  }
};

export const getLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const likes = await socialService.getLikes(postId);
    res.json({ likes, count: likes.length });
  } catch (error) {
    logger.error('Failed to get likes', { error: error.message });
    res.status(500).json({ message: 'Failed to get likes' });
  }
};

export const addComment = async (req, res) => {
  const { error, value } = commentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { postId } = req.params;
    const commentData = {
      post_id: postId,
      text: value.text,
      user_id: req.user.id,
      username: req.user.username,
    };

    const comment = await socialService.addComment(commentData);

    // Fetch post details to get the post owner
    const postOwner = await socialService.getPostOwner(postId);

    // Publish comment event - send notification to post owner, not the commenter
    // Only notify if the commenter is not the post owner
    if (postOwner && postOwner.user_id !== req.user.id) {
      await publishEvent(ExchangeNames.SOCIAL_EXCHANGE, EventTypes.POST_COMMENTED, {
        postId: parseInt(postId),
        commentId: comment.id,
        userId: postOwner.user_id, // Post owner who should receive notification
        postOwnerId: postOwner.user_id, // Explicit post owner ID
        commenterId: req.user.id, // Person who commented
        username: req.user.username, // Username of person who commented
        text: value.text,
        postTitle: postOwner.caption || 'your post', // Post title/caption
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('Comment added', { postId, commentId: comment.id });
    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    logger.error('Failed to add comment', { error: error.message });
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await socialService.getComments(postId);
    res.json({ comments, count: comments.length });
  } catch (error) {
    logger.error('Failed to get comments', { error: error.message });
    res.status(500).json({ message: 'Failed to get comments' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await socialService.getCommentById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await socialService.deleteComment(commentId);

    await publishEvent(ExchangeNames.SOCIAL_EXCHANGE, EventTypes.COMMENT_DELETED, {
      commentId: commentId, // Keep as UUID string, don't parse as int
      postId: comment.post_id,
      timestamp: new Date().toISOString(),
    });

    logger.info('Comment deleted', { commentId });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete comment', { error: error.message });
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

export const deleteUserComments = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only admins can delete all user comments
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const deletedCount = await socialService.deleteUserComments(userId);

    logger.info('User comments deleted', { userId, count: deletedCount });
    res.json({ message: 'User comments deleted successfully', count: deletedCount });
  } catch (error) {
    logger.error('Failed to delete user comments', { error: error.message });
    res.status(500).json({ message: 'Failed to delete user comments' });
  }
};

export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { platform } = req.body;

    const share = await socialService.sharePost(postId, platform);

    await publishEvent(ExchangeNames.SOCIAL_EXCHANGE, EventTypes.POST_SHARED, {
      postId: parseInt(postId),
      platform,
      userId: req.user.id,
      timestamp: new Date().toISOString(),
    });

    logger.info('Post shared', { postId, platform });
    res.status(201).json({ message: 'Post shared successfully', share });
  } catch (error) {
    logger.error('Failed to share post', { error: error.message });
    res.status(500).json({ message: 'Failed to share post' });
  }
};

