-- Migration: add missing foreign keys on reviews + business profile columns
-- Applied to project cprfaimmxtqsmmutdbcb on 2026-07-19 via Supabase MCP.

-- 1. reviews was created in production without its foreign keys, which broke
--    PostgREST embeds (reviewer profile join) so reviews never rendered.
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Business profile section in Profile.tsx saves these columns; they were
--    missing in production so the save was silently dropped.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS "isBusiness" BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "businessDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "businessLogo" TEXT,
  ADD COLUMN IF NOT EXISTS "businessWebsite" TEXT,
  ADD COLUMN IF NOT EXISTS "businessSocialLinks" TEXT;
