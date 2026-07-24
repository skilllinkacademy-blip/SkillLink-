import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthCallbackProps {
  isRtl: boolean;
}

/**
 * Landing page for the email-confirmation (and magic-link) redirect.
 *
 * Supabase appends the session to this URL after the user clicks the link in
 * their email. Depending on the flow that means either a `?code=` query param
 * (PKCE) or `#access_token=...` in the hash (implicit). This component handles
 * both, establishes the session, and forwards the user into the app — or shows
 * a clear error if the link is invalid/expired.
 */
export default function AuthCallback({ isRtl }: AuthCallbackProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      // 1. Supabase reports errors in either the query or the hash.
      const providerError =
        query.get('error_description') ||
        hash.get('error_description') ||
        query.get('error') ||
        hash.get('error');
      if (providerError) {
        if (active) setError(providerError);
        return;
      }

      // 2. PKCE flow: exchange the one-time code for a session.
      const code = query.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (active) setError(exchangeError.message);
          return;
        }
        if (active) navigate('/app/opportunities', { replace: true });
        return;
      }

      // 3. Implicit flow: detectSessionInUrl parses the hash tokens on client
      //    init. Poll getSession briefly to let that settle, then continue.
      for (let i = 0; i < 12 && active; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (active) navigate('/app/opportunities', { replace: true });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (active) {
        setError(
          isRtl
            ? 'הקישור לאימות אינו תקין או שפג תוקפו. נסה להתחבר או להירשם מחדש.'
            : 'The confirmation link is invalid or has expired. Please try signing in or registering again.'
        );
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [navigate, isRtl]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-6">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {isRtl ? 'האימות נכשל' : 'Verification failed'}
          </h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            to="/auth?mode=login"
            className="inline-block w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-colors"
          >
            {isRtl ? 'חזרה להתחברות' : 'Back to sign in'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-medium">
        {isRtl ? 'מאמת את החשבון שלך...' : 'Verifying your account...'}
      </p>
    </div>
  );
}
