-- Add Google authentication fields to users table
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) NULL,
ADD COLUMN profile_picture VARCHAR(255) NULL,
MODIFY COLUMN password VARCHAR(255) NULL;

-- Add index for faster lookups
CREATE INDEX idx_google_id ON users(google_id);
