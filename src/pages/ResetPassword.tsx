import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ResetPasswordProps {
  isRtl: boolean;
}

export default function ResetPassword({ isRtl }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a session (Supabase should have handled the hash automatically)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError(isRtl ? 'הקישור פג תוקף או שאינו תקין.' : 'Link expired or invalid.');
      }
    };
    checkSession();
  }, [isRtl]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(isRtl ? 'הסיסמאות אינן תואמות.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/auth?mode=login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-10 space-y-8">
          <div className="text-center space-y-2">
            <Link to="/" className="text-3xl font-black tracking-tighter text-black !font-sans" dir="ltr">
              SkillLink<span className="text-blue-600">.</span>
            </Link>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {isRtl ? 'איפוס סיסמה' : 'Reset Password'}
            </h2>
            <p className="text-gray-500 font-medium">
              {isRtl 
                ? 'בחר סיסמה חדשה ומאובטחת.' 
                : 'Choose a new, secure password.'}
            </p>
          </div>

          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-4 text-center animate-in zoom-in duration-300">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-emerald-900">
                  {isRtl ? 'הסיסמה עודכנה!' : 'Password updated!'}
                </p>
                <p className="text-sm text-emerald-700">
                  {isRtl 
                    ? 'מיד תועבר לדף ההתחברות...' 
                    : 'You will be redirected to login shortly...'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-medium">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="password"
                    required
                    placeholder={isRtl ? 'סיסמה חדשה' : 'New Password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 transition-all font-medium outline-none"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="password"
                    required
                    placeholder={isRtl ? 'אימות סיסמה' : 'Confirm Password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 transition-all font-medium outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all active:scale-[0.98] shadow-xl shadow-blue-100 uppercase tracking-widest text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : (
                  isRtl ? 'עדכן סיסמה' : 'Update Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
