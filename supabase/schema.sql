-- 0. Cleanup
DROP TABLE IF EXISTS public.saved_opportunities CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.mentor_verifications CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.opportunities CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.schema_migrations CASCADE;

-- 1. Migration Tracking
CREATE TABLE public.schema_migrations (
    id TEXT PRIMARY KEY,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.schema_migrations (id) VALUES ('initial_setup');

-- 2. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    role TEXT CHECK (role IN ('mentor', 'mentee', 'admin')),
    city TEXT DEFAULT 'פתח תקווה',
    phone TEXT,
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
    skills JSONB DEFAULT '[]'::JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Opportunities Table
CREATE TABLE public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('mentor_offer', 'mentee_seeking')) NOT NULL,
    title TEXT NOT NULL,
    location TEXT DEFAULT 'פתח תקווה',
    work_hours TEXT,
    beginners_only BOOLEAN DEFAULT FALSE,
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

-- 4. Mentor Verifications
CREATE TABLE public.mentor_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 5. Messaging System
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_1, participant_2)
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notifications
CREATE TABLE public.notifications (
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

-- 7. Saved Opportunities (Likes/Saves)
CREATE TABLE public.saved_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, opportunity_id)
);

-- 8. RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Opportunities
CREATE POLICY "Opportunities are viewable by everyone" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Users can manage own opportunities" ON public.opportunities FOR ALL USING (auth.uid() = owner_id);

-- Verifications
CREATE POLICY "Users can manage own verifications" ON public.mentor_verifications FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Messaging
CREATE POLICY "Users can manage own conversations" ON public.conversations FOR ALL USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can manage own messages" ON public.messages FOR ALL USING (auth.uid() = sender_id OR EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid())));

-- Notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Saved Opportunities
CREATE POLICY "Users can manage saved opportunities" ON public.saved_opportunities FOR ALL USING (auth.uid() = user_id);

-- 9. Functions & Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_mentor_verifications_updated_at BEFORE UPDATE ON public.mentor_verifications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, username, city)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'mentee'),
        'user_' || substr(md5(random()::text), 1, 8),
        COALESCE(NEW.raw_user_meta_data->>'city', NEW.raw_user_meta_data->>'location', 'פתח תקווה')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('opportunities_images', 'opportunities_images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('mentor_id_docs', 'mentor_id_docs', false) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Opportunity images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload opportunity images" ON storage.objects;
DROP POLICY IF EXISTS "Mentor ID upload" ON storage.objects;
DROP POLICY IF EXISTS "Mentor ID read own or admin" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Opportunity images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'opportunities_images');
CREATE POLICY "Users can upload opportunity images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'opportunities_images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Mentor ID upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mentor_id_docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Mentor ID read own or admin" ON storage.objects FOR SELECT USING (bucket_id = 'mentor_id_docs' AND ((storage.foldername(name))[1] = auth.uid()::text OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')));
