-- Social Database Migration
-- Create likes, comments, and shares tables

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    comment_id TEXT NOT NULL UNIQUE,
    text TEXT NOT NULL,
    user_id INT NOT NULL,
    username TEXT NOT NULL,
    comment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    seen_by_story_owner BOOLEAN DEFAULT FALSE
);

-- Create post_social table (for sharing)
CREATE TABLE IF NOT EXISTS post_social (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    platform TEXT NOT NULL,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_date ON post_comments(comment_date DESC);
CREATE INDEX IF NOT EXISTS idx_post_social_post_id ON post_social(post_id);

-- Insert sample likes
INSERT INTO post_likes (post_id, user_id)
VALUES 
    (1, 3),
    (2, 2),
    (3, 3)
ON CONFLICT DO NOTHING;

-- Insert sample comments
INSERT INTO post_comments (post_id, comment_id, text, user_id, username, comment_date)
VALUES 
    (1, 'comment-1', 'Amazing view! 😍', 3, 'jane_smith', NOW() - INTERVAL '1 day'),
    (2, 'comment-2', 'Looks delicious!', 2, 'john_doe', NOW() - INTERVAL '12 hours'),
    (3, 'comment-3', 'Great shot!', 3, 'jane_smith', NOW())
ON CONFLICT DO NOTHING;

COMMENT ON TABLE post_likes IS 'User likes on posts';
COMMENT ON TABLE post_comments IS 'User comments on posts';
COMMENT ON TABLE post_social IS 'Social media sharing records';

