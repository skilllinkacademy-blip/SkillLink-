import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, MapPin, ChevronRight, AlertCircle, CheckCircle2, ArrowLeft, Award, Rocket, GraduationCap, Presentation, Wrench, Phone } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AuthProps {
  isRtl: boolean;
}

export default function Auth({ isRtl }: AuthProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [step, setStep] = useState(1); // 1: Role Selection, 2: Details
  const [role, setRole] = useState<'mentor' | 'mentee' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfigWarning, setShowConfigWarning] = useState(!isSupabaseConfigured);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const roleParam = searchParams.get('role');
    
    if (mode === 'signup' || roleParam) {
      setIsLogin(false);
      if (roleParam === 'mentor' || roleParam === 'mentee') {
        setRole(roleParam as 'mentor' | 'mentee');
        setStep(2);
      } else {
        setStep(1);
      }
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [occupation, setOccupation] = useState('');
  const [experience, setExperience] = useState('');
  const [workload, setWorkload] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (user) {
      const returnTo = searchParams.get('returnTo');
      navigate(returnTo || '/app/opportunities', { replace: true });
    }
  }, [user, navigate, searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/app/opportunities', { replace: true });
      } else {
        if (role === 'mentor' && !agreedToTerms) {
          throw new Error(isRtl ? 'עליך לאשר את תנאי ההתנהלות המכבדת' : 'You must agree to the respectful conduct terms');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              location: location,
              phone: phone,
              occupation: role === 'mentor' ? occupation : undefined,
              years_experience: role === 'mentor' ? (parseInt(experience) || 0) : undefined,
              workload: role === 'mentor' ? workload : undefined,
            }
          }
        });

        if (signUpError) throw signUpError;
        
        if (data.user) {
          alert(isRtl ? 'נרשמת בהצלחה! בדוק את המייל לאימות (אם מופעל)' : 'Signed up successfully! Check your email for verification.');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-black">1</div>
            <div className="w-12 h-1 bg-gray-100 rounded-full"></div>
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-black">2</div>
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{isRtl ? 'איך תרצה להצטרף?' : 'How would you like to join?'}</h2>
        <p className="text-gray-500 font-medium">{isRtl ? 'בחר את התפקיד המתאים לך ביותר' : 'Choose the role that fits you best'}</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => { setRole('mentee'); setTimeout(() => setStep(2), 200); }}
          className={`group p-8 rounded-[2rem] border-2 text-start transition-all relative overflow-hidden ${
            role === 'mentee' ? 'border-blue-600 bg-blue-50/30' : 'border-transparent hover:border-blue-500 hover:bg-gray-50 bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-6 relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              role === 'mentee' ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200' : 'bg-emerald-50 text-emerald-600 group-hover:scale-110'
            }`}>
              <GraduationCap size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-gray-900">{isRtl ? 'אני מתלמד' : 'I am an Apprentice'}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{isRtl ? 'מחפש ללמוד מקצוע מבעל מקצוע מנוסה' : 'Looking to learn a trade from an experienced pro'}</p>
            </div>
            {role === 'mentee' && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 size={14} />
              </div>
            )}
          </div>
        </button>

        <button
          onClick={() => { setRole('mentor'); setTimeout(() => setStep(2), 200); }}
          className={`group p-8 rounded-[2rem] border-2 text-start transition-all relative overflow-hidden ${
            role === 'mentor' ? 'border-blue-600 bg-blue-50/30' : 'border-transparent hover:border-blue-500 hover:bg-gray-50 bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-6 relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              role === 'mentor' ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-600 group-hover:scale-110'
            }`}>
              <Presentation size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-gray-900">{isRtl ? 'אני מנטור' : 'I am a Mentor'}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{isRtl ? 'בעל מקצוע שרוצה ללמד, להכשיר ולהעסיק' : 'A professional looking to teach, train, and hire'}</p>
            </div>
            {role === 'mentor' && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 size={14} />
              </div>
            )}
          </div>
        </button>
      </div>

      <div className="text-center pt-6">
        <button onClick={() => setIsLogin(true)} className="text-sm font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
          {isRtl ? 'כבר יש לך חשבון? התחבר' : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <form className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300" onSubmit={handleAuth}>
      <div className="flex items-center gap-2 mb-6">
        <button type="button" onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="rtl:rotate-180" />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
              <CheckCircle2 size={16} />
            </div>
            <div className="w-12 h-1 bg-emerald-500 rounded-full"></div>
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-black">2</div>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <span className="text-sm font-black uppercase tracking-widest text-gray-400">
          {isRtl ? `הרשמה כ${role === 'mentor' ? 'מנטור' : 'מתלמד'}` : `Signing up as ${role === 'mentor' ? 'Mentor' : 'Apprentice'}`}
        </span>
      </div>

      <div className="relative group">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
        <input
          type="text"
          required
          placeholder={isRtl ? 'שם מלא' : 'Full Name'}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 transition-all font-medium outline-none"
        />
      </div>

      <div className="relative group">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
        <input
          type="text"
          required
          placeholder={isRtl ? 'עיר מגורים' : 'City'}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 transition-all font-medium outline-none"
        />
      </div>

      <div className="relative group">
        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
        <input
          type="tel"
          required
          placeholder={isRtl ? 'מספר טלפון' : 'Phone Number'}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 transition-all font-medium outline-none"
        />
      </div>

      {role === 'mentor' && (
        <>
          <div className="relative group">
            <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input
              type="text"
              required
              placeholder={isRtl ? 'מקצוע / תחום עיסוק' : 'Occupation / Trade'}
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 transition-all font-medium outline-none"
            />
          </div>

          <div className="relative group">
            <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input
              type="number"
              required
              min="0"
              placeholder={isRtl ? 'שנות ניסיון' : 'Years of Experience'}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 transition-all font-medium outline-none"
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
              {isRtl ? 'עומס עבודה ממוצע' : 'Average Workload'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['low', 'medium', 'high', 'variable'].map((opt) => (
                <label key={opt} className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all font-bold text-xs uppercase tracking-wider ${
                  workload === opt ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                }`}>
                  <input 
                    type="radio" 
                    name="workload" 
                    required
                    className="hidden" 
                    value={opt} 
                    onChange={(e) => setWorkload(e.target.value)} 
                  />
                  {opt === 'low' ? (isRtl ? 'מעט' : 'Low') : 
                   opt === 'medium' ? (isRtl ? 'בינוני' : 'Medium') : 
                   opt === 'high' ? (isRtl ? 'הרבה' : 'High') : (isRtl ? 'משתנה' : 'Variable')}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl cursor-pointer group">
            <input 
              type="checkbox" 
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" 
            />
            <span className="text-sm font-medium text-gray-700 leading-tight">
              {isRtl 
                ? 'אני מבין/ה שאני מלמד/ת מתלמד את המקצוע ומתחייב/ת להתנהלות מכבדת.'
                : 'I understand that I am teaching an apprentice the trade and commit to respectful conduct.'}
            </span>
          </label>
        </>
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

      <div className="relative group">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
        <input
          type="password"
          required
          placeholder={isRtl ? 'סיסמה' : 'Password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 transition-all font-medium outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all active:scale-[0.98] shadow-xl shadow-blue-100 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
        ) : (
          isRtl ? 'סיום הרשמה' : 'Complete Signup'
        )}
      </button>
    </form>
  );

  const renderLogin = () => (
    <form className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300" onSubmit={handleAuth}>
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

      <div className="relative group">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
        <input
          type="password"
          required
          placeholder={isRtl ? 'סיסמה' : 'Password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 transition-all font-medium outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all active:scale-[0.98] shadow-xl shadow-blue-100 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
        ) : (
          isRtl ? 'התחברות' : 'Log In'
        )}
      </button>

      <div className="text-center pt-4">
        <button onClick={() => setIsLogin(false)} className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">
          {isRtl ? 'אין לך חשבון? הצטרף עכשיו' : 'New to SkillLink? Join now'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="text-3xl font-black tracking-tighter text-black !font-sans" dir="ltr">
              SkillLink<span className="text-blue-600">.</span>
            </Link>
          </div>

          {showConfigWarning && (
            <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-[2rem] space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="flex items-center gap-3 text-amber-800">
                <AlertCircle className="shrink-0" size={24} />
                <h3 className="font-black text-lg">{isRtl ? 'חסרים פרטי Supabase' : 'Supabase Credentials Missing'}</h3>
              </div>
              <p className="text-sm text-amber-700 font-medium leading-relaxed">
                {isRtl 
                  ? 'נראה שפרטי ה-Supabase לא הוגדרו במערכת. האפליקציה משתמשת כרגע בנתוני דמו ולא תוכל לשמור משתמשים אמיתיים.' 
                  : 'It looks like Supabase credentials are not set. The app is currently using demo data and won\'t be able to save real users.'}
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => setShowConfigWarning(false)}
                  className="w-full py-3 bg-amber-200 text-amber-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-300 transition-all"
                >
                  {isRtl ? 'הבנתי, המשך בכל זאת' : 'I understand, continue anyway'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-medium animate-shake">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {isLogin ? renderLogin() : (step === 1 ? renderStep1() : renderStep2())}

          {/* Emergency Reset Button - Only for setup/stuck phase */}
          <div className="pt-8 mt-8 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mb-4">
              {isRtl ? 'נתקעת? איפוס חירום של מסד הנתונים' : 'Stuck? Emergency Database Reset'}
            </p>
            <button
              onClick={async () => {
                if (window.confirm(isRtl ? 'זה ימחק את כל הנתונים המקומיים (פרופילים, פוסטים). האם אתה בטוח?' : 'This will wipe all local data (profiles, posts). Are you sure?')) {
                  try {
                    const response = await fetch('/api/admin/emergency-reset-sqlite', { method: 'POST' });
                    if (response.ok) {
                      alert(isRtl ? 'מסד הנתונים אופס. עכשיו תוכל להירשם כמשתמש הראשון (אדמין).' : 'Database wiped. You can now register as the first user (Admin).');
                      window.location.reload();
                    } else {
                      alert('Reset failed');
                    }
                  } catch (e) {
                    alert('Reset failed');
                  }
                }
              }}
              className="w-full py-2 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-red-600 transition-all"
            >
              {isRtl ? 'איפוס מערכת מלא (SQLite)' : 'Full System Reset (SQLite)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
