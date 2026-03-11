import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ForgotPasswordProps {
  isRtl: boolean;
}

export default function ForgotPassword({ isRtl }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccess(true);
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
              {isRtl ? 'שכחת סיסמה?' : 'Forgot Password?'}
            </h2>
            <p className="text-gray-500 font-medium">
              {isRtl 
                ? 'אל דאגה, נשלח לך אימייל לאיפוס הסיסמה.' 
                : "No worries, we'll send you an email to reset your password."}
            </p>
          </div>

          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-4 text-center animate-in zoom-in duration-300">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-emerald-900">
                  {isRtl ? 'המייל נשלח!' : 'Email sent!'}
                </p>
                <p className="text-sm text-emerald-700">
                  {isRtl 
                    ? 'בדוק את תיבת הדואר הנכנס שלך (וגם את תיקיית הספאם).' 
                    : 'Check your inbox (and spam folder).'}
                </p>
              </div>
              <Link 
                to="/auth?mode=login" 
                className="block w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all"
              >
                {isRtl ? 'חזרה להתחברות' : 'Back to Login'}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-medium">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  placeholder={isRtl ? 'כתובת אימייל' : 'Email Address'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 transition-all font-medium outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all active:scale-[0.98] shadow-xl shadow-blue-100 uppercase tracking-widest text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : (
                  isRtl ? 'שלח הוראות איפוס' : 'Send Reset Instructions'
                )}
              </button>

              <Link 
                to="/auth?mode=login" 
                className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={16} className="rtl:rotate-180" />
                {isRtl ? 'חזרה להתחברות' : 'Back to Login'}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
