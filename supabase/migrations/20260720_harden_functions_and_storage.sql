-- Migration: close the remaining Supabase security-advisor warnings.
-- Applied to production (cprfaimmxtqsmmutdbcb) on 2026-07-20 via Supabase MCP.

-- 1. SECURITY DEFINER functions were callable by anon/authenticated over the
--    REST API. None are called from the client: the post like/comment
--    counters are unused, and handle_new_user is trigger-only. Revoke public
--    execution (from PUBLIC, which is the default grantee, and the roles).
REVOKE EXECUTE ON FUNCTION public.increment_likes(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_likes(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_comments(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2. Public buckets had broad SELECT policies on storage.objects that let
--    clients LIST every file. The app only ever reads individual objects via
--    getPublicUrl (the /object/public/ endpoint, which is not gated by these
--    policies), and the private mentor_id_docs bucket keeps its own scoped
--    read policy. Drop the broad listing policies.
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Opportunity images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view post images" ON storage.objects;
DROP POLICY IF EXISTS "Profile cover read" ON storage.objects;
