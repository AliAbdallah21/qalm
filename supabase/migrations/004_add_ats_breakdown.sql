-- Migration 004: Add ats_breakdown column to cv_generations

ALTER TABLE public.cv_generations 
ADD COLUMN IF NOT EXISTS ats_breakdown jsonb;

-- Update RLS policies if necessary (usually not needed for adding a column if user-based RLS is already on table)
-- cv_generations already has user-based RLS from 001_initial_schema.sql
