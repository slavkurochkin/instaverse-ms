-- Story Database Migration
-- Create posts and post_tags tables

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    caption TEXT NOT NULL,
    category TEXT NOT NULL,
    device TEXT NOT NULL DEFAULT 'Unknown',
    username TEXT NOT NULL,
    user_id INT NOT NULL,
    image TEXT NOT NULL,
    post_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create post_tags table
CREATE TABLE IF NOT EXISTS post_tags (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_post_date ON posts(post_date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_username ON posts(username);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag);

-- Insert sample posts
INSERT INTO posts (caption, category, device, username, user_id, image, post_date)
VALUES 
    ('Beautiful sunset at the beach 🌅', 'Nature', 'iPhone 14', 'john_doe', 2, 'https://picsum.photos/400/400?random=1', NOW() - INTERVAL '2 days'),
    ('My morning coffee ☕', 'Food', 'Samsung Galaxy', 'jane_smith', 3, 'https://picsum.photos/400/400?random=2', NOW() - INTERVAL '1 day'),
    ('City lights at night 🌃', 'Urban', 'iPhone 14', 'john_doe', 2, 'https://picsum.photos/400/400?random=3', NOW())
ON CONFLICT DO NOTHING;

-- Insert sample tags
INSERT INTO post_tags (post_id, tag)
VALUES 
    (1, 'sunset'),
    (1, 'beach'),
    (1, 'nature'),
    (2, 'coffee'),
    (2, 'morning'),
    (3, 'city'),
    (3, 'night'),
    (3, 'photography')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE posts IS 'User posts/stories';
COMMENT ON TABLE post_tags IS 'Tags associated with posts';

