import { pool } from '../index.js';
import { createLogger } from '../../../shared/utils/logger.js';
import axios from 'axios';

const logger = createLogger('STORY-SERVICE');
const SOCIAL_SERVICE_URL = process.env.SOCIAL_SERVICE_URL || 'http://social-service:5003';

// Helper function to fetch likes and comments for posts from social service
const enrichStoriesWithSocialData = async (stories) => {
  if (!stories || stories.length === 0) return stories;
  
  try {
    const postIds = stories.map((story) => story.id);
    
    // Fetch likes and comments for all posts in parallel
    const socialPromises = postIds.map((postId) =>
      Promise.all([
        axios
          .get(`${SOCIAL_SERVICE_URL}/api/social/likes/${postId}`)
          .then((res) => ({
            postId,
            likes: res.data.likes || [],
          }))
          .catch(() => ({ postId, likes: [] })),
        axios
          .get(`${SOCIAL_SERVICE_URL}/api/social/comments/${postId}`)
          .then((res) => ({
            postId,
            comments: res.data.comments || [],
          }))
          .catch(() => ({ postId, comments: [] })),
      ]).then(([likesData, commentsData]) => ({
        postId,
        likes: likesData.likes,
        comments: commentsData.comments,
      }))
    );
    
    const socialData = await Promise.all(socialPromises);
    const likesMap = new Map(socialData.map((item) => [item.postId, item.likes.map((like) => like.user_id)]));
    
    // Normalize comment field names from snake_case to camelCase for frontend compatibility
    const commentsMap = new Map(
      socialData.map((item) => [
        item.postId,
        item.comments.map((comment) => ({
          commentId: comment.comment_id,
          text: comment.text,
          username: comment.username,
          userId: comment.user_id,
          commentDate: comment.comment_date,
          seenByStoryOwner: comment.seen_by_story_owner,
        })),
      ])
    );
    
    // Enrich stories with likes and comments
    return stories.map((story) => ({
      ...story,
      likes: likesMap.get(story.id) || [],
      comments: commentsMap.get(story.id) || [],
    }));
  } catch (error) {
    logger.error('Failed to enrich stories with social data', { error: error.message });
    // Return stories without social data rather than failing
    return stories.map((story) => ({ ...story, likes: [], comments: [] }));
  }
};

export const getAllStories = async (page = 1, limit = 10, sort = 'post_date', order = 'DESC') => {
  try {
    const offset = (page - 1) * limit;
    const allowedSort = ['post_date', 'caption', 'category'];
    const sortField = allowedSort.includes(sort) ? sort : 'post_date';
    const orderDir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const result = await pool.query(
      `SELECT p.*, 
        COALESCE(json_agg(DISTINCT pt.tag) FILTER (WHERE pt.tag IS NOT NULL), '[]') as tags
       FROM posts p
       LEFT JOIN post_tags pt ON p.id = pt.post_id
       GROUP BY p.id
       ORDER BY ${sortField} ${orderDir}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Enrich with likes and comments from social service
    return await enrichStoriesWithSocialData(result.rows);
  } catch (error) {
    logger.error('Failed to get all stories', { error: error.message });
    throw error;
  }
};

export const getStoryById = async (storyId) => {
  try {
    const result = await pool.query(
      `SELECT p.*,
        COALESCE(json_agg(DISTINCT pt.tag) FILTER (WHERE pt.tag IS NOT NULL), '[]') as tags
       FROM posts p
       LEFT JOIN post_tags pt ON p.id = pt.post_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [storyId]
    );

    const story = result.rows[0] || null;
    if (!story) return null;
    
    // Enrich with likes and comments from social service
    const enriched = await enrichStoriesWithSocialData([story]);
    return enriched[0];
  } catch (error) {
    logger.error('Failed to get story', { error: error.message, storyId });
    throw error;
  }
};

export const getStoriesByUser = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT p.*,
        COALESCE(json_agg(DISTINCT pt.tag) FILTER (WHERE pt.tag IS NOT NULL), '[]') as tags
       FROM posts p
       LEFT JOIN post_tags pt ON p.id = pt.post_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.post_date DESC`,
      [userId]
    );

    // Enrich with likes and comments from social service
    return await enrichStoriesWithSocialData(result.rows);
  } catch (error) {
    logger.error('Failed to get user stories', { error: error.message, userId });
    throw error;
  }
};

export const createStory = async (storyData) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { caption, category, device, image, user_id, username, tags, social } = storyData;

    // Insert post
    const postResult = await client.query(
      `INSERT INTO posts (caption, category, device, username, user_id, image, social, post_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [caption, category, device || 'Unknown', username, user_id, image, social || null]
    );

    const post = postResult.rows[0];

    // Insert tags if provided
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await client.query(
          'INSERT INTO post_tags (post_id, tag) VALUES ($1, $2)',
          [post.id, tag]
        );
      }
    }

    await client.query('COMMIT');

    // Fetch complete post with tags
    return await getStoryById(post.id);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Failed to create story', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
};

export const updateStory = async (storyId, updates) => {
  try {
    const allowedFields = ['caption', 'category', 'device', 'image', 'social'];
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(updates[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateValues.push(storyId);

    const query = `
      UPDATE posts
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, updateValues);
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to update story', { error: error.message, storyId });
    throw error;
  }
};

export const deleteStory = async (storyId) => {
  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [storyId]);
  } catch (error) {
    logger.error('Failed to delete story', { error: error.message, storyId });
    throw error;
  }
};

export const deleteUserStories = async (userId) => {
  try {
    const result = await pool.query('DELETE FROM posts WHERE user_id = $1', [userId]);
    return result.rowCount;
  } catch (error) {
    logger.error('Failed to delete user stories', { error: error.message, userId });
    throw error;
  }
};

export const searchStories = async (query, category) => {
  try {
    let sqlQuery = `
      SELECT p.*,
        COALESCE(json_agg(DISTINCT pt.tag) FILTER (WHERE pt.tag IS NOT NULL), '[]') as tags
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (query) {
      sqlQuery += ` AND (p.caption ILIKE $${paramIndex} OR p.username ILIKE $${paramIndex})`;
      params.push(`%${query}%`);
      paramIndex++;
    }

    if (category) {
      sqlQuery += ` AND p.category = $${paramIndex}`;
      params.push(category);
    }

    sqlQuery += ' GROUP BY p.id ORDER BY p.post_date DESC';

    const result = await pool.query(sqlQuery, params);
    
    // Enrich with likes and comments from social service
    return await enrichStoriesWithSocialData(result.rows);
  } catch (error) {
    logger.error('Failed to search stories', { error: error.message });
    throw error;
  }
};

