-- Migration: Add missing tables and connection tracking
-- Run this in the Supabase SQL editor for project cprfaimmxtqsmmutdbcb
-- Date: 2026-05-16

-- 1. opportunity_interests (used in OpportunityDetails.tsx but table was missing)
CREATE TABLE IF NOT EXISTS public.opportunity_interests (
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (opportunity_id, user_id)
);

ALTER TABLE public.opportunity_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view opportunity interests"
    ON public.opportunity_interests FOR SELECT USING (true);

CREATE POLICY "Users can insert own interest"
    ON public.opportunity_interests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users or owners can delete interest"
    ON public.opportunity_interests FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.opportunities
            WHERE id = opportunity_id AND owner_id = auth.uid()
        )
    );

-- 2. reviews (used in Profile.tsx and Reviews.tsx but table was missing)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    professional INTEGER CHECK (professional BETWEEN 1 AND 5),
    teaching INTEGER CHECK (teaching BETWEEN 1 AND 5),
    work_ethic INTEGER CHECK (work_ethic BETWEEN 1 AND 5),
    reliability INTEGER CHECK (reliability BETWEEN 1 AND 5),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, reviewer_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete own reviews"
    ON public.reviews FOR DELETE
    USING (auth.uid() = reviewer_id);

-- 3. Add connection tracking columns to conversations
ALTER TABLE public.conversations
    ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'new'
        CHECK (connection_status IN ('new', 'active', 'completed', 'stale')),
    ADD COLUMN IF NOT EXISTS connection_status_updated_at TIMESTAMPTZ;

-- Backfill: mark existing conversations as 'active' if both sides sent >= 3 messages
-- (safe to run once, idempotent due to WHERE connection_status = 'new')
UPDATE public.conversations c
SET
    connection_status = 'active',
    connection_status_updated_at = NOW()
WHERE
    c.connection_status = 'new'
    AND (
        SELECT COUNT(*) FROM public.messages m
        WHERE m.conversation_id = c.id AND m.sender_id = c.participant_1
    ) >= 3
    AND (
        SELECT COUNT(*) FROM public.messages m
        WHERE m.conversation_id = c.id AND m.sender_id = c.participant_2
    ) >= 3;

-- Backfill: mark as 'completed' if at least one review exists between the two participants
UPDATE public.conversations c
SET
    connection_status = 'completed',
    connection_status_updated_at = NOW()
WHERE
    connection_status = 'active'
    AND EXISTS (
        SELECT 1 FROM public.reviews r
        WHERE
            (r.reviewer_id = c.participant_1 AND r.profile_id = c.participant_2)
            OR (r.reviewer_id = c.participant_2 AND r.profile_id = c.participant_1)
    );
