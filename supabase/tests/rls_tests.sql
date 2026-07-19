-- =============================================================================
-- SkillLink — RLS security tests
-- =============================================================================
-- Proves that Row Level Security actually isolates users: user A must not be
-- able to read or modify user B's private data (messages, conversations,
-- notifications, verifications), while public data (profiles, opportunities)
-- stays readable.
--
-- How it works: the script runs as a privileged role, creates three throwaway
-- users inside a transaction, then impersonates each user the same way
-- PostgREST does — `set local role authenticated` plus request.jwt.claims —
-- and asserts what each one can and cannot see. Everything is rolled back at
-- the end, so the script is repeatable and leaves no trace.
--
-- Run: paste into the Supabase SQL editor (or psql) and execute.
-- Success output: NOTICE "ALL RLS TESTS PASSED".
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Setup (privileged): three users. The on_auth_user_created trigger creates
-- their profiles rows automatically.
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES
  ('00000000-0000-4000-a000-0000000000aa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-test-a@example.com', '', now(), '{"full_name":"RLS Test A","role":"mentee"}', now(), now()),
  ('00000000-0000-4000-a000-0000000000bb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-test-b@example.com', '', now(), '{"full_name":"RLS Test B","role":"mentor"}', now(), now()),
  ('00000000-0000-4000-a000-0000000000cc', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-test-c@example.com', '', now(), '{"full_name":"RLS Test C","role":"mentee"}', now(), now());

-- Private conversation between B and C, with a message.
INSERT INTO public.conversations (id, participant_1, participant_2, last_message)
VALUES ('00000000-0000-4000-b000-0000000000c1', '00000000-0000-4000-a000-0000000000bb', '00000000-0000-4000-a000-0000000000cc', 'סוד בין B ל-C');

INSERT INTO public.messages (conversation_id, sender_id, recipient_id, content)
VALUES ('00000000-0000-4000-b000-0000000000c1', '00000000-0000-4000-a000-0000000000bb', '00000000-0000-4000-a000-0000000000cc', 'הודעה פרטית של B ל-C');

-- Conversation between A and B (A's positive control).
INSERT INTO public.conversations (id, participant_1, participant_2, last_message)
VALUES ('00000000-0000-4000-b000-0000000000a1', '00000000-0000-4000-a000-0000000000aa', '00000000-0000-4000-a000-0000000000bb', 'שיחה של A');

-- Notification, verification and saved opportunity belonging to B.
INSERT INTO public.notifications (user_id, type, title, content)
VALUES ('00000000-0000-4000-a000-0000000000bb', 'system', 'התראה פרטית של B', 'רק B אמור לראות את זה');

INSERT INTO public.mentor_verifications (user_id, document_url, status)
VALUES ('00000000-0000-4000-a000-0000000000bb', 'private/b-id-card.png', 'pending');

INSERT INTO public.opportunities (id, owner_id, type, title, location)
VALUES ('00000000-0000-4000-c000-0000000000b1', '00000000-0000-4000-a000-0000000000bb', 'mentor_offer', 'הזדמנות ציבורית של B', 'תל אביב');

INSERT INTO public.saved_opportunities (user_id, opportunity_id)
VALUES ('00000000-0000-4000-a000-0000000000bb', '00000000-0000-4000-c000-0000000000b1');

-- ---------------------------------------------------------------------------
-- Impersonate user A
-- ---------------------------------------------------------------------------
SET LOCAL request.jwt.claims = '{"sub":"00000000-0000-4000-a000-0000000000aa","role":"authenticated"}';
SET LOCAL ROLE authenticated;

DO $$
DECLARE n int;
BEGIN
  -- T1: A must not see the B<->C conversation
  SELECT count(*) INTO n FROM public.conversations WHERE id = '00000000-0000-4000-b000-0000000000c1';
  IF n <> 0 THEN RAISE EXCEPTION 'T1 FAILED: user A can read a conversation between B and C'; END IF;

  -- T2: A must not read messages from that conversation
  SELECT count(*) INTO n FROM public.messages WHERE conversation_id = '00000000-0000-4000-b000-0000000000c1';
  IF n <> 0 THEN RAISE EXCEPTION 'T2 FAILED: user A can read B''s private messages'; END IF;

  -- T3: A must not see B's notifications
  SELECT count(*) INTO n FROM public.notifications WHERE user_id = '00000000-0000-4000-a000-0000000000bb';
  IF n <> 0 THEN RAISE EXCEPTION 'T3 FAILED: user A can read B''s notifications'; END IF;

  -- T4: A must not see B's mentor verification documents
  SELECT count(*) INTO n FROM public.mentor_verifications WHERE user_id = '00000000-0000-4000-a000-0000000000bb';
  IF n <> 0 THEN RAISE EXCEPTION 'T4 FAILED: user A can read B''s verification records'; END IF;

  -- T5: A must not see B's saved opportunities
  SELECT count(*) INTO n FROM public.saved_opportunities WHERE user_id = '00000000-0000-4000-a000-0000000000bb';
  IF n <> 0 THEN RAISE EXCEPTION 'T5 FAILED: user A can read B''s saved opportunities'; END IF;

  -- T6: A CAN see their own conversation with B (positive control)
  SELECT count(*) INTO n FROM public.conversations WHERE id = '00000000-0000-4000-b000-0000000000a1';
  IF n <> 1 THEN RAISE EXCEPTION 'T6 FAILED: user A cannot read their own conversation'; END IF;

  -- T7: profiles are public by design — A sees B's profile
  SELECT count(*) INTO n FROM public.profiles WHERE id = '00000000-0000-4000-a000-0000000000bb';
  IF n <> 1 THEN RAISE EXCEPTION 'T7 FAILED: public profile read is broken'; END IF;

  -- T8: opportunities are public by design
  SELECT count(*) INTO n FROM public.opportunities WHERE id = '00000000-0000-4000-c000-0000000000b1';
  IF n <> 1 THEN RAISE EXCEPTION 'T8 FAILED: public opportunity read is broken'; END IF;
END $$;

-- T9: A must not be able to update B's profile (0 rows affected)
DO $$
DECLARE n int;
BEGIN
  UPDATE public.profiles SET bio = 'hacked' WHERE id = '00000000-0000-4000-a000-0000000000bb';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'T9 FAILED: user A updated B''s profile'; END IF;
END $$;

-- T10: A must not insert a review in B's name (WITH CHECK reviewer_id = auth.uid())
DO $$
BEGIN
  BEGIN
    INSERT INTO public.reviews (profile_id, reviewer_id, rating, comment)
    VALUES ('00000000-0000-4000-a000-0000000000cc', '00000000-0000-4000-a000-0000000000bb', 5, 'ביקורת מזויפת');
    RAISE EXCEPTION 'T10 FAILED: user A inserted a review impersonating B';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN NULL; -- expected: RLS blocked it
  END;
END $$;

-- T11: A must not send a message into the B<->C conversation
DO $$
BEGIN
  BEGIN
    INSERT INTO public.messages (conversation_id, sender_id, recipient_id, content)
    VALUES ('00000000-0000-4000-b000-0000000000c1', '00000000-0000-4000-a000-0000000000aa', '00000000-0000-4000-a000-0000000000cc', 'פריצה');
    RAISE EXCEPTION 'T11 FAILED: user A wrote into a conversation they are not part of';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN NULL;
  END;
END $$;

-- T11b: A must not spoof a "system" notification (sender_id NULL is admin-only)
DO $$
BEGIN
  BEGIN
    INSERT INTO public.notifications (user_id, sender_id, type, title, content)
    VALUES ('00000000-0000-4000-a000-0000000000bb', NULL, 'system', 'זיוף', 'התראה מזויפת');
    RAISE EXCEPTION 'T11b FAILED: user A spoofed a system notification';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN NULL;
  END;
END $$;

-- T11c: A CAN still send a message in their own conversation (positive control)
DO $$
BEGIN
  INSERT INTO public.messages (conversation_id, sender_id, recipient_id, content)
  VALUES ('00000000-0000-4000-b000-0000000000a1', '00000000-0000-4000-a000-0000000000aa', '00000000-0000-4000-a000-0000000000bb', 'הודעה לגיטימית');
END $$;

-- ---------------------------------------------------------------------------
-- Impersonate anonymous visitor
-- ---------------------------------------------------------------------------
RESET ROLE;
SET LOCAL request.jwt.claims = '{"role":"anon"}';
SET LOCAL ROLE anon;

DO $$
DECLARE n int;
BEGIN
  -- T12: anon can browse profiles and opportunities (by design)
  SELECT count(*) INTO n FROM public.profiles;
  IF n = 0 THEN RAISE EXCEPTION 'T12 FAILED: anon cannot browse profiles'; END IF;

  -- T13: anon must not read any messages or conversations
  SELECT count(*) INTO n FROM public.messages;
  IF n <> 0 THEN RAISE EXCEPTION 'T13 FAILED: anon can read private messages'; END IF;
  SELECT count(*) INTO n FROM public.conversations;
  IF n <> 0 THEN RAISE EXCEPTION 'T13 FAILED: anon can read conversations'; END IF;

  -- T14: anon must not read notifications or verifications
  SELECT count(*) INTO n FROM public.notifications;
  IF n <> 0 THEN RAISE EXCEPTION 'T14 FAILED: anon can read notifications'; END IF;
  SELECT count(*) INTO n FROM public.mentor_verifications;
  IF n <> 0 THEN RAISE EXCEPTION 'T14 FAILED: anon can read mentor verifications'; END IF;
END $$;

RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'ALL RLS TESTS PASSED ✓ (16 checks)'; END $$;

ROLLBACK;
