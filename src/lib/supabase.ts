import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

console.log('--- BROWSER SUPABASE CONFIG CHECK ---');
console.log('URL:', supabaseUrl ? 'FOUND' : 'MISSING');
console.log('ANON_KEY:', supabaseAnonKey ? 'FOUND' : 'MISSING');
console.log('CONFIGURED:', isSupabaseConfigured);
console.log('-------------------------------------');

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
