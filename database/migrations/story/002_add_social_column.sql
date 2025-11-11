-- Add social column to posts table
-- Stores array of social platforms where the post was shared

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS social TEXT[];

-- Add comment to document the column
COMMENT ON COLUMN posts.social IS 'Array of social platforms where post was shared (e.g., instagram, facebook)';

-- Create index for social array queries
CREATE INDEX IF NOT EXISTS idx_posts_social ON posts USING GIN(social);

