import { pool } from '../index.js';
import { createLogger } from '../../../shared/utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const logger = createLogger('SOCIAL-SERVICE');
const STORY_SERVICE_URL = process.env.STORY_SERVICE_URL || 'http://story-service:5002';

export const checkIfLiked = async (postId, userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    return result.rows.length > 0;
  } catch (error) {
    logger.error('Failed to check if liked', { error: error.message, postId, userId });
    throw error;
  }
};

export const likePost = async (postId, userId) => {
  try {
    const result = await pool.query(
      'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) RETURNING *',
      [postId, userId]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to like post', { error: error.message, postId, userId });
    throw error;
  }
};

export const unlikePost = async (postId, userId) => {
  try {
    await pool.query(
      'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
  } catch (error) {
    logger.error('Failed to unlike post', { error: error.message, postId, userId });
    throw error;
  }
};

export const getPostLikes = async (postId) => {
  try {
    const result = await pool.query(
      'SELECT user_id FROM post_likes WHERE post_id = $1',
      [postId]
    );
    return result.rows.map(row => row.user_id);
  } catch (error) {
    logger.error('Failed to get post likes', { error: error.message, postId });
    throw error;
  }
};

export const getPostsLikes = async (postIds) => {
  try {
    if (!postIds || postIds.length === 0) {
      return {};
    }
    
    const result = await pool.query(
      'SELECT post_id, array_agg(user_id) as user_ids FROM post_likes WHERE post_id = ANY($1) GROUP BY post_id',
      [postIds]
    );
    
    // Convert to object map: { postId: [userId1, userId2, ...] }
    const likesMap = {};
    result.rows.forEach(row => {
      likesMap[row.post_id] = row.user_ids || [];
    });
    
    return likesMap;
  } catch (error) {
    logger.error('Failed to get posts likes', { error: error.message });
    throw error;
  }
};

export const getLikes = async (postId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM post_likes WHERE post_id = $1',
      [postId]
    );
    return result.rows;
  } catch (error) {
    logger.error('Failed to get likes', { error: error.message, postId });
    throw error;
  }
};

export const addComment = async (commentData) => {
  try {
    const { post_id, text, user_id, username } = commentData;
    const comment_id = uuidv4();

    const result = await pool.query(
      `INSERT INTO post_comments (post_id, comment_id, text, user_id, username, comment_date, seen_by_story_owner)
       VALUES ($1, $2, $3, $4, $5, NOW(), false)
       RETURNING *`,
      [post_id, comment_id, text, user_id, username]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to add comment', { error: error.message });
    throw error;
  }
};

export const getComments = async (postId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM post_comments WHERE post_id = $1 ORDER BY comment_date DESC',
      [postId]
    );
    return result.rows;
  } catch (error) {
    logger.error('Failed to get comments', { error: error.message, postId });
    throw error;
  }
};

export const getCommentById = async (commentId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM post_comments WHERE comment_id = $1',
      [commentId]
    );
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Failed to get comment', { error: error.message, commentId });
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    await pool.query('DELETE FROM post_comments WHERE comment_id = $1', [commentId]);
  } catch (error) {
    logger.error('Failed to delete comment', { error: error.message, commentId });
    throw error;
  }
};

export const deleteUserComments = async (userId) => {
  try {
    const result = await pool.query('DELETE FROM post_comments WHERE user_id = $1', [userId]);
    return result.rowCount;
  } catch (error) {
    logger.error('Failed to delete user comments', { error: error.message, userId });
    throw error;
  }
};

export const sharePost = async (postId, platform) => {
  try {
    const result = await pool.query(
      'INSERT INTO post_social (post_id, platform) VALUES ($1, $2) RETURNING *',
      [postId, platform]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to share post', { error: error.message, postId, platform });
    throw error;
  }
};

export const getPostOwner = async (postId) => {
  try {
    const response = await axios.get(`${STORY_SERVICE_URL}/api/stories/${postId}`, {
      timeout: 5000,
    });
    
    if (response.data && response.data.story) {
      return {
        user_id: response.data.story.user_id,
        username: response.data.story.username,
        caption: response.data.story.caption,
      };
    }
    return null;
  } catch (error) {
    logger.error('Failed to get post owner', { error: error.message, postId });
    return null; // Return null instead of throwing to prevent notification failures
  }
};

