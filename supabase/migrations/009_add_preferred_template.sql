-- Add preferred_template column to profiles table

ALTER TABLE profiles
ADD COLUMN preferred_template text DEFAULT 'experienced';
