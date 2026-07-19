-- Migration: close RLS holes found by supabase/tests/rls_tests.sql
-- Applied to project cprfaimmxtqsmmutdbcb on 2026-07-19 via Supabase MCP.
--
-- Hole 1: messages had a FOR ALL policy without WITH CHECK, so any
--         authenticated user could insert messages into any conversation.
-- Hole 2: notifications allowed sender_id NULL for everyone, so any user
--         could spoof "system" notifications to any other user.

DROP POLICY "Users can manage own messages" ON public.messages;

CREATE POLICY "Participants can read messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Participants can update messages" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Senders can delete own messages" ON public.messages
  FOR DELETE USING (sender_id = auth.uid());

DROP POLICY "Authenticated users can insert notifications" ON public.notifications;

CREATE POLICY "Identified users or admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    OR (
      sender_id IS NULL
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );
