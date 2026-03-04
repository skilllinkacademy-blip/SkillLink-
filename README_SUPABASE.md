# Supabase Setup Instructions for SkillLink

To fix the error `Could not find the table 'public.profiles' in the schema cache`, you need to initialize your Supabase database with the required tables and policies.

## 1. Run the SQL Schema
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Click on **SQL Editor** in the left sidebar.
4. Click **New query**.
5. Copy the entire contents of the `supabase_schema.sql` file (found in the root of this project) and paste it into the SQL Editor.
6. Click **Run**.

## 2. Create Storage Buckets
You need to manually create the following buckets in the **Storage** section of your Supabase Dashboard:
1. **avatars**: Set to **Public**.
2. **opportunities_images**: Set to **Public**.
3. **verification_docs**: Set to **Private**.

## 3. Configure Environment Variables
Ensure you have set the following variables in your AI Studio environment (or `.env` file if running locally):
- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

## 4. Restart the Application
After running the SQL and creating the buckets, the application should be able to connect and create your profile automatically upon login or signup.
