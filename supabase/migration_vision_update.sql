-- Migration: Vision Update 2026
-- 1. Update Profiles Table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learning_intent TEXT CHECK (learning_intent IN ('trade', 'business', 'both'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_duration TEXT CHECK (preferred_duration IN ('short', 'long', 'both'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_audience TEXT;

-- 2. Update Opportunities Table
ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS opportunities_opportunity_type_check;
ALTER TABLE public.opportunities ADD CONSTRAINT opportunities_opportunity_type_check CHECK (opportunity_type IN ('apprenticeship', 'project'));
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS commitment_level TEXT CHECK (commitment_level IN ('high', 'low', 'flexible'));
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS learning_focus TEXT; -- e.g., 'practical', 'operational', 'management'
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS duration_description TEXT; -- e.g., '3 days', '6 months'

-- 3. Update hande_new_user to include default values if needed (optional)
