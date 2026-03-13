-- Add description column to certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS description text;
