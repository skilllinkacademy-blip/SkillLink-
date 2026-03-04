# Supabase Setup Instructions for SkillLink

To fix the **"Database Setup Required"** error, you need to initialize your Supabase database with the required tables and policies.

## 1. Run the SQL Schema
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Click on **SQL Editor** in the left sidebar.
4. Click **New query**.
5. Copy the entire contents of the `supabase/schema.sql` file (found in the `supabase` folder of this project) and paste it into the SQL Editor.
6. Click **Run**.

## 2. Storage Buckets
The SQL script above attempts to create the required buckets and policies automatically. However, you should verify them in the **Storage** section of your Supabase Dashboard:
1. **avatars**: Should be **Public**.
2. **opportunities_images**: Should be **Public**.
3. **mentor_id_docs**: Should be **Private**.

## 3. Configure Environment Variables
Ensure you have set the following variables in your AI Studio environment:
- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

## 4. Restart the Application
After running the SQL, the red error banner should disappear automatically.
