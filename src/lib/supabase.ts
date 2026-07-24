import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.length > 10
);

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing or invalid. Using placeholders.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Persist the session and keep the access token fresh.
      persistSession: true,
      autoRefreshToken: true,
      // Parse the tokens Supabase appends to the email-confirmation redirect
      // (e.g. #access_token=... on /auth/callback) so the session is
      // established automatically once the user clicks the link.
      detectSessionInUrl: true,
      // Implicit flow puts the tokens directly in the redirect URL hash, so
      // the confirmation link works even when the email is opened in a
      // different browser than the one used to sign up (no code verifier
      // needs to be shared between browsers, unlike PKCE).
      flowType: 'implicit',
    },
  }
);
