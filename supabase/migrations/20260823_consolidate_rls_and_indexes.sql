-- Consolidate duplicate RLS policies + indexes, add missing FK indexes,
-- and wrap auth.<fn>() in (select ...) to stop per-row re-evaluation.
--
-- NOT dropped (audit flagged them as duplicates, they are not):
--   notifications INSERT: "Users can manage own notifications" only permits
--     inserting rows where user_id = auth.uid(); "Identified users or admins
--     can insert notifications" permits sender_id = auth.uid(). Permissive
--     policies OR together - dropping either removes real capability.
--   opportunities/profiles SELECT: the public-read policy and the owner ALL
--     policy are complementary. Dropping the public read hides all rows from
--     everyone but the owner.
--   profiles UPDATE "Admins can update any profile": grants admins rights the
--     owner-only ALL policy does not.

-- (a) true duplicates: identical expression, same cmd, same effective scope
drop policy if exists "Authors can delete comments"    on public.post_comments;
drop policy if exists "Auth users can comment"         on public.post_comments;
drop policy if exists "Users can unlike"               on public.post_likes;
drop policy if exists "Auth users can like"            on public.post_likes;
drop policy if exists "Authors can delete own posts"   on public.posts;
drop policy if exists "Auth users can create posts"    on public.posts;
drop policy if exists "Anyone can read reviews"        on public.reviews;
drop policy if exists "Users can delete own reviews"   on public.reviews;
drop policy if exists "Users can insert own reviews"   on public.reviews;

-- (b) duplicate indexes
drop index if exists public.idx_comments_post;
drop index if exists public.idx_likes_post;
drop index if exists public.idx_posts_author;
drop index if exists public.idx_posts_created;

-- (c) missing covering indexes for foreign keys
create index if not exists idx_notifications_sender_id  on public.notifications (sender_id);
create index if not exists idx_post_comments_author_id  on public.post_comments (author_id);
create index if not exists idx_post_likes_user_id       on public.post_likes (user_id);
create index if not exists idx_reviews_reviewer_id      on public.reviews (reviewer_id);

-- (d) initplan-wrap auth calls. ALTER (not drop/create) so roles and
--     null-with_check semantics are preserved exactly.
alter policy "Users can manage own conversations" on public.conversations
  using ((select auth.uid()) = participant_1 or (select auth.uid()) = participant_2);

alter policy "mentor_availability_owner_delete" on public.mentor_availability
  using ((select auth.uid()) = mentor_id);
alter policy "mentor_availability_owner_write" on public.mentor_availability
  with check ((select auth.uid()) = mentor_id);

alter policy "mentor_terms_owner_write" on public.mentor_terms
  with check ((select auth.uid()) = mentor_id);
alter policy "mentor_terms_owner_update" on public.mentor_terms
  using ((select auth.uid()) = mentor_id)
  with check ((select auth.uid()) = mentor_id);

alter policy "Users can manage own verifications" on public.mentor_verifications
  using ((select auth.uid()) = user_id or exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'));

alter policy "Senders can delete own messages" on public.messages
  using (sender_id = (select auth.uid()));
alter policy "Participants can send messages" on public.messages
  with check (sender_id = (select auth.uid()) and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.participant_1 = (select auth.uid()) or c.participant_2 = (select auth.uid()))));
alter policy "Participants can read messages" on public.messages
  using (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.participant_1 = (select auth.uid()) or c.participant_2 = (select auth.uid()))));
alter policy "Participants can update messages" on public.messages
  using (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.participant_1 = (select auth.uid()) or c.participant_2 = (select auth.uid()))));

alter policy "Users can manage own notifications" on public.notifications
  using ((select auth.uid()) = user_id);
alter policy "Identified users or admins can insert notifications" on public.notifications
  with check (sender_id = (select auth.uid()) or (sender_id is null and exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin')));

alter policy "Users can manage own opportunities" on public.opportunities
  using ((select auth.uid()) = owner_id);

alter policy "Users or owners can remove interest" on public.opportunity_interests
  using (user_id = (select auth.uid()) or exists (
    select 1 from public.opportunities
    where opportunities.id = opportunity_interests.opportunity_id
      and opportunities.owner_id = (select auth.uid())));
alter policy "Users can express interest" on public.opportunity_interests
  with check (user_id = (select auth.uid()));

alter policy "Users can delete own comments" on public.post_comments
  using ((select auth.uid()) = author_id);
alter policy "Users can create comments" on public.post_comments
  with check ((select auth.uid()) = author_id);
alter policy "Users can update own comments" on public.post_comments
  using ((select auth.uid()) = author_id);

alter policy "Users can unlike posts" on public.post_likes
  using ((select auth.uid()) = user_id);
alter policy "Users can like posts" on public.post_likes
  with check ((select auth.uid()) = user_id);

alter policy "Users can delete own posts" on public.posts
  using ((select auth.uid()) = author_id);
alter policy "Users can create posts" on public.posts
  with check ((select auth.uid()) = author_id);
alter policy "Users can update own posts" on public.posts
  using ((select auth.uid()) = author_id);

alter policy "Users can manage own profile" on public.profiles
  using ((select auth.uid()) = id);
alter policy "Admins can update any profile" on public.profiles
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

alter policy "Users can delete their own reviews" on public.reviews
  using ((select auth.uid()) = reviewer_id);
alter policy "Users can insert their own reviews" on public.reviews
  with check ((select auth.uid()) = reviewer_id);
alter policy "Users can update their own reviews" on public.reviews
  using ((select auth.uid()) = reviewer_id);

alter policy "Users can manage saved opportunities" on public.saved_opportunities
  using ((select auth.uid()) = user_id);

-- (e) is_admin(): the frontend never calls /rest/v1/rpc/is_admin (AuthContext
--     reads metadata.isAdmin, unrelated). Revoking from anon/authenticated
--     alone is a no-op - the grant comes from PUBLIC. But a blanket revoke
--     breaks "Admins can update any profile" (verified: permission denied for
--     function is_admin). So: close it to anon, keep it for authenticated.
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;
