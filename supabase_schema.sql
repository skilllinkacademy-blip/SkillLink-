-- SkillLink Full Database Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    role TEXT CHECK (role IN ('mentor', 'mentee', 'admin')),
    location TEXT,
    occupation TEXT,
    years_experience INTEGER,
    workload TEXT,
    bio TEXT,
    avatar_url TEXT,
    headline TEXT,
    skills_level TEXT,
    availability TEXT,
    desired_salary NUMERIC,
    what_i_want_to_learn TEXT,
    who_i_want_to_teach TEXT,
    availability_days TEXT[],
    cover_url TEXT,
    portfolio_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Opportunities Table
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('mentor_offer', 'mentee_seeking')) NOT NULL,
    title TEXT NOT NULL,
    location TEXT,
    work_hours TEXT,
    beginners_only BOOLEAN DEFAULT TRUE,
    pay_amount NUMERIC,
    pay_period TEXT CHECK (pay_period IN ('hour', 'day', 'month')),
    about_work TEXT,
    requirements TEXT,
    who_i_want_to_teach TEXT,
    training_includes TEXT,
    mentee_will_learn TEXT,
    availability_days TEXT[],
    desired_salary NUMERIC,
    what_i_want_to_learn TEXT,
    experience_note TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Opportunities
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Opportunities are viewable by everyone." ON public.opportunities;
CREATE POLICY "Opportunities are viewable by everyone." ON public.opportunities
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own opportunities." ON public.opportunities;
CREATE POLICY "Users can insert their own opportunities." ON public.opportunities
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own opportunities." ON public.opportunities;
CREATE POLICY "Users can update their own opportunities." ON public.opportunities
    FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own opportunities." ON public.opportunities;
CREATE POLICY "Users can delete their own opportunities." ON public.opportunities
    FOR DELETE USING (auth.uid() = owner_id);

-- 3. Mentor Verifications Table
CREATE TABLE IF NOT EXISTS public.mentor_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNIQUE על user_id כדי לאפשר ON CONFLICT (upsert)
ALTER TABLE public.mentor_verifications
  ADD CONSTRAINT IF NOT EXISTS mentor_verifications_user_id_key UNIQUE (user_id);

-- Enable RLS for Mentor Verifications
ALTER TABLE public.mentor_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own verifications." ON public.mentor_verifications;
CREATE POLICY "Users can view their own verifications." ON public.mentor_verifications
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Users can insert mentor verifications." ON public.mentor_verifications;
CREATE POLICY "Users can insert mentor verifications."
ON public.mentor_verifications
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own verifications." ON public.mentor_verifications;
CREATE POLICY "Users can update their own verifications." ON public.mentor_verifications
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 4. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_1, participant_2)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own conversations." ON public.conversations;
CREATE POLICY "Users can view their own conversations." ON public.conversations
    FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

DROP POLICY IF EXISTS "Users can insert conversations they are part of." ON public.conversations;
CREATE POLICY "Users can insert conversations they are part of." ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations." ON public.messages;
CREATE POLICY "Users can view messages in their conversations." ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = messages.conversation_id
            AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can insert messages they sent." ON public.messages;
CREATE POLICY "Users can insert messages they sent." ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
CREATE POLICY "Users can view their own notifications." ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications." ON public.notifications;
CREATE POLICY "Users can update their own notifications." ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert notifications." ON public.notifications;
CREATE POLICY "Anyone can insert notifications." ON public.notifications
    FOR INSERT WITH CHECK (true);

-- 7. Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_mentor_verifications_updated_at ON public.mentor_verifications;
CREATE TRIGGER update_mentor_verifications_updated_at
    BEFORE UPDATE ON public.mentor_verifications
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- 8. Storage Buckets
-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('opportunities_images', 'opportunities_images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('mentor_id_docs', 'mentor_id_docs', false) ON CONFLICT (id) DO NOTHING;

-- Avatars Bucket Policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar." ON storage.objects;
CREATE POLICY "Users can upload their own avatar." ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own avatar." ON storage.objects;
CREATE POLICY "Users can update their own avatar." ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Opportunities Images Policies
DROP POLICY IF EXISTS "Opportunity images are publicly accessible." ON storage.objects;
CREATE POLICY "Opportunity images are publicly accessible." ON storage.objects
    FOR SELECT USING (bucket_id = 'opportunities_images');

DROP POLICY IF EXISTS "Users can upload opportunity images." ON storage.objects;
CREATE POLICY "Users can upload opportunity images." ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'opportunities_images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 8. Storage RLS for mentor ID docs (bucket: mentor_id_docs)

-- העלאת מסמכי אימות: user_id הוא התיקייה הראשונה בשם הקובץ
DROP POLICY IF EXISTS "Mentor ID upload" ON storage.objects;
CREATE POLICY "Mentor ID upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mentor_id_docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- קריאה של מסמכי אימות – הבעלים או אדמין
DROP POLICY IF EXISTS "Mentor ID read own" ON storage.objects;
CREATE POLICY "Mentor ID read own"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'mentor_id_docs'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

-- עדכון קבצים (למשל העלאה מחדש) – רק הבעלים
DROP POLICY IF EXISTS "Users can update their own verification docs." ON storage.objects;
CREATE POLICY "Users can update their own verification docs."
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'mentor_id_docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
