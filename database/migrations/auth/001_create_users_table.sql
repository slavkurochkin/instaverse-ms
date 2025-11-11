-- Auth Database Migration
-- Create users table

CREATE TABLE IF NOT EXISTS users (
    _id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    age TIMESTAMP,
    gender VARCHAR(10),
    bio TEXT,
    favorite_style VARCHAR(50),
    total_posts INT DEFAULT 0 CHECK (total_posts >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password, role, bio, total_posts)
VALUES (
    'admin',
    'admin@instaverse.com',
    '$2a$10$cuIu9zs7EdOeKaTi4VngvesVKpyDvUkXDh.RDLz/4zXvuHUmgfXUy', -- bcrypt hash of 'admin123'
    'admin',
    'System Administrator',
    0
) ON CONFLICT (email) DO NOTHING;

-- Insert sample regular users (password: admin123 for testing)
INSERT INTO users (username, email, password, role, bio, total_posts)
VALUES 
    ('john_doe', 'john@example.com', '$2a$10$cuIu9zs7EdOeKaTi4VngvesVKpyDvUkXDh.RDLz/4zXvuHUmgfXUy', 'user', 'Photography enthusiast', 0),
    ('jane_smith', 'jane@example.com', '$2a$10$cuIu9zs7EdOeKaTi4VngvesVKpyDvUkXDh.RDLz/4zXvuHUmgfXUy', 'user', 'Travel blogger', 0)
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE users IS 'User accounts and authentication data';
COMMENT ON COLUMN users.total_posts IS 'Cached count of user posts, updated via events';

