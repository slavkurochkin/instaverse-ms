import * as storyService from '../services/story.service.js';
import { publishEvent } from '../../../shared/events/rabbitmq.js';
import { EventTypes, ExchangeNames } from '../../../shared/events/eventTypes.js';
import { createLogger } from '../../../shared/utils/logger.js';
import Joi from 'joi';

const logger = createLogger('STORY-CONTROLLER');

const createStorySchema = Joi.object({
  caption: Joi.string().required(),
  category: Joi.string().required(),
  device: Joi.string().optional(),
  image: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).optional(),
  social: Joi.array().items(Joi.string()).optional(),
});

export const getAllStories = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'post_date', order = 'DESC' } = req.query;
    const stories = await storyService.getAllStories(
      parseInt(page),
      parseInt(limit),
      sort,
      order
    );
    res.json({ stories, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    logger.error('Failed to get stories', { error: error.message });
    res.status(500).json({ message: 'Failed to get stories' });
  }
};

export const getStoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await storyService.getStoryById(id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    res.json({ story });
  } catch (error) {
    logger.error('Failed to get story', { error: error.message });
    res.status(500).json({ message: 'Failed to get story' });
  }
};

export const getStoriesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const stories = await storyService.getStoriesByUser(userId);
    res.json({ stories });
  } catch (error) {
    logger.error('Failed to get user stories', { error: error.message });
    res.status(500).json({ message: 'Failed to get user stories' });
  }
};

export const createStory = async (req, res) => {
  const { error, value } = createStorySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const storyData = {
      ...value,
      user_id: req.user.id,
      username: req.user.username,
    };

    const story = await storyService.createStory(storyData);

    // Publish post.created event
    await publishEvent(ExchangeNames.POST_EXCHANGE, EventTypes.POST_CREATED, {
      postId: story.id,
      userId: story.user_id,
      username: story.username,
      caption: story.caption,
      timestamp: new Date().toISOString(),
    });

    logger.info('Story created', { storyId: story.id, userId: story.user_id });
    res.status(201).json({ message: 'Story created successfully', story });
  } catch (error) {
    logger.error('Failed to create story', { error: error.message });
    res.status(500).json({ message: 'Failed to create story' });
  }
};

export const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const existingStory = await storyService.getStoryById(id);

    if (!existingStory) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (existingStory.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const story = await storyService.updateStory(id, req.body);

    await publishEvent(ExchangeNames.POST_EXCHANGE, EventTypes.POST_UPDATED, {
      postId: story.id,
      userId: story.user_id,
      updates: req.body,
      timestamp: new Date().toISOString(),
    });

    logger.info('Story updated', { storyId: story.id });
    res.json({ message: 'Story updated successfully', story });
  } catch (error) {
    logger.error('Failed to update story', { error: error.message });
    res.status(500).json({ message: 'Failed to update story' });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await storyService.getStoryById(id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await storyService.deleteStory(id);

    await publishEvent(ExchangeNames.POST_EXCHANGE, EventTypes.POST_DELETED, {
      postId: parseInt(id),
      userId: story.user_id,
      timestamp: new Date().toISOString(),
    });

    logger.info('Story deleted', { storyId: id });
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete story', { error: error.message });
    res.status(500).json({ message: 'Failed to delete story' });
  }
};

export const deleteUserStories = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only admins can delete all user stories
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const deletedCount = await storyService.deleteUserStories(userId);

    logger.info('User stories deleted', { userId, count: deletedCount });
    res.json({ message: 'User stories deleted successfully', count: deletedCount });
  } catch (error) {
    logger.error('Failed to delete user stories', { error: error.message });
    res.status(500).json({ message: 'Failed to delete user stories' });
  }
};

export const searchStories = async (req, res) => {
  try {
    const { query, category } = req.query;
    const stories = await storyService.searchStories(query, category);
    res.json({ stories });
  } catch (error) {
    logger.error('Failed to search stories', { error: error.message });
    res.status(500).json({ message: 'Failed to search stories' });
  }
};

