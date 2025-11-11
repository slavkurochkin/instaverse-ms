import * as authService from '../services/auth.service.js';
import { publishEvent } from '../../../shared/events/rabbitmq.js';
import { EventTypes, ExchangeNames } from '../../../shared/events/eventTypes.js';
import { createLogger } from '../../../shared/utils/logger.js';
import Joi from 'joi';

const logger = createLogger('AUTH-CONTROLLER');

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).optional().messages({
    'any.only': 'Passwords do not match',
  }),
  role: Joi.string().valid('user', 'admin').default('user'),
  age: Joi.date().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  bio: Joi.string().max(500).optional(),
  favorite_style: Joi.string().max(100).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(50).optional(),
  age: Joi.date().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  bio: Joi.string().max(500).optional(),
  favorite_style: Joi.string().max(100).optional(),
});

/**
 * Register a new user
 */
export const register = async (req, res) => {
  // Validate request
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await authService.registerUser(value);

    // Publish user.registered event
    await publishEvent(ExchangeNames.USER_EXCHANGE, EventTypes.USER_REGISTERED, {
      userId: user._id,
      username: user.username,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    logger.info('User registered successfully', { userId: user._id, email: user.email });

    res.status(201).json({
      message: 'User registered successfully',
      token: authService.generateToken({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }),
      result: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio,
        total_posts: user.total_posts,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    logger.error('Registration failed', { error: error.message });
    
    if (error.message === 'User already exists') {
      return res.status(409).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Registration failed' });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  // Validate request
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const result = await authService.loginUser(value.email, value.password);

    logger.info('User logged in successfully', { 
      userId: result.user._id, 
      email: result.user.email 
    });

    res.json({
      message: 'Login successful',
      token: result.token,
      result: result.user,  // Frontend expects 'result' not 'user'
    });
  } catch (error) {
    logger.error('Login failed', { error: error.message, email: value.email });
    
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    res.status(500).json({ message: 'Login failed' });
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  try {
    const users = await authService.getAllUsers();
    res.json({ users, count: users.length });
  } catch (error) {
    logger.error('Failed to get all users', { error: error.message });
    res.status(500).json({ message: 'Failed to get users' });
  }
};

/**
 * Get user profile
 * If no ID provided in params, returns the current user's profile from JWT token
 */
export const getProfile = async (req, res) => {
  // Use ID from params if provided, otherwise use ID from JWT token
  const userId = req.params.id ? req.params.id : req.user.id;

  try {
    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    logger.error('Failed to get profile', { error: error.message, userId });
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  const { id } = req.params;

  // Validate request
  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Authorization check - users can only update their own profile (unless admin)
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized to update this profile' });
  }

  try {
    const user = await authService.updateUser(id, value);

    // Publish user.updated event
    await publishEvent(ExchangeNames.USER_EXCHANGE, EventTypes.USER_UPDATED, {
      userId: user._id,
      username: user.username,
      updates: value,
      timestamp: new Date().toISOString(),
    });

    logger.info('Profile updated successfully', { userId: user._id });

    res.json({ 
      message: 'Profile updated successfully', 
      user 
    });
  } catch (error) {
    logger.error('Failed to update profile', { error: error.message, userId: id });
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  // Authorization check - users can only delete their own profile (unless admin)
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized to delete this profile' });
  }

  try {
    await authService.deleteUser(id);

    // Publish user.deleted event
    await publishEvent(ExchangeNames.USER_EXCHANGE, EventTypes.USER_DELETED, {
      userId: parseInt(id),
      timestamp: new Date().toISOString(),
    });

    logger.info('User deleted successfully', { userId: id });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete user', { error: error.message, userId: id });
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

/**
 * Validate JWT token
 */
export const validateToken = async (req, res) => {
  // If middleware passes, token is valid
  res.json({
    valid: true,
    user: req.user,
  });
};

