-- Add new fields for GitHub Actions PDF compilation
ALTER TABLE cv_generations
ADD COLUMN IF NOT EXISTS latex_source TEXT,
ADD COLUMN IF NOT EXISTS pdf_status TEXT DEFAULT 'ready',
ADD COLUMN IF NOT EXISTS pdf_error TEXT;
