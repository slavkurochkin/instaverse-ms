import pg from 'pg';
const { Pool } = pg;

/**
 * Create a database connection pool
 */
export const createPool = (connectionString) => {
  return new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
    connectionTimeoutMillis: 2000, // How long to wait for a connection
  });
};

/**
 * Test database connection
 */
export const testConnection = async (pool) => {
  try {
    const result = await pool.query('SELECT NOW() as now');
    console.log('✅ Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

/**
 * Close database pool
 */
export const closePool = async (pool) => {
  try {
    await pool.end();
    console.log('✅ Database pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
};

