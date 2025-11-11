import bcrypt from 'bcryptjs';
import { pool } from '../index.js';
import { generateToken } from '../../../shared/utils/jwt.js';
import { createLogger } from '../../../shared/utils/logger.js';

const logger = createLogger('AUTH-SERVICE');

// Re-export generateToken so it can be used by controllers
export { generateToken };

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  const { username, email, password, role, age, gender, bio, favorite_style } = userData;

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (username, email, password, role, age, gender, bio, favorite_style, total_posts, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, NOW(), NOW())
       RETURNING _id, username, email, role, age, gender, bio, favorite_style, total_posts, created_at`,
      [username, email, hashedPassword, role || 'user', age, gender, bio, favorite_style]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to register user', { error: error.message, email });
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  try {
    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT
    const token = generateToken(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_EXPIRES_IN || '7d'
    );

    // Remove password from response
    delete user.password;

    return { token, user };
  } catch (error) {
    logger.error('Login failed', { error: error.message, email });
    throw error;
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
  try {
    const result = await pool.query(
      'SELECT _id, username, email, role, age, gender, bio, favorite_style, total_posts, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    logger.error('Failed to get all users', { error: error.message });
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT _id, username, email, role, age, gender, bio, favorite_style, total_posts, created_at FROM users WHERE _id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to get user', { error: error.message, userId });
    throw error;
  }
};

/**
 * Update user
 */
export const updateUser = async (userId, updates) => {
  try {
    const allowedFields = ['username', 'age', 'gender', 'bio', 'favorite_style'];
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

    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    updateValues.push(userId);

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE _id = $${paramIndex}
      RETURNING _id, username, email, role, age, gender, bio, favorite_style, total_posts, updated_at
    `;

    const result = await pool.query(query, updateValues);
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to update user', { error: error.message, userId });
    throw error;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  try {
    await pool.query('DELETE FROM users WHERE _id = $1', [userId]);
  } catch (error) {
    logger.error('Failed to delete user', { error: error.message, userId });
    throw error;
  }
};

/**
 * Increment user's post count
 */
export const incrementPostCount = async (userId) => {
  try {
    await pool.query(
      'UPDATE users SET total_posts = total_posts + 1 WHERE _id = $1',
      [userId]
    );
    logger.info('Incremented post count', { userId });
  } catch (error) {
    logger.error('Failed to increment post count', { error: error.message, userId });
    throw error;
  }
};

/**
 * Decrement user's post count
 */
export const decrementPostCount = async (userId) => {
  try {
    await pool.query(
      'UPDATE users SET total_posts = GREATEST(total_posts - 1, 0) WHERE _id = $1',
      [userId]
    );
    logger.info('Decremented post count', { userId });
  } catch (error) {
    logger.error('Failed to decrement post count', { error: error.message, userId });
    throw error;
  }
};

