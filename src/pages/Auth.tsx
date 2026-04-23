import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, MapPin, ChevronRight, AlertCircle, CheckCircle2, ArrowLeft, Award, Rocket, GraduationCap, Presentation, Wrench, Phone, Star, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AuthProps {
  isRtl: boolean;
}

export default function Auth({ isRtl }: AuthProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'mentor' | 'mentee' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          navigate('/app/opportunities', { replace: true });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium outline-none text-sm placeholder:text-gray-400";

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Progress */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">1</div>
          <div className="w-10 h-1 bg-gray-100 rounded-full" />
          <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-black">2</div>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          {isRtl ? 'איך תרצה להצטרף?' : 'How would you like to join?'}
        </h2>
        <p className="text-gray-500 text-sm font-medium">
          {isRtl ? 'בחר את התפקיד המתאים לך' : 'Choose the role that fits you best'}
        </p>
      </div>
      
      <div className="space-y-3">
        {/* Mentee card */}
        <button
          onClick={() => { setRole('mentee'); setTimeout(() => setStep(2), 150); }}
          className="w-full group p-5 rounded-2xl border-2 text-start transition-all bg-gray-50 border-transparent hover:border-emerald-400 hover:bg-emerald-50/30 active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap size={26} />
            </div>
            <div className="flex-1 text-start">
              <h3 className="text-base font-black text-gray-900">{isRtl ? 'אני מתלמד' : 'I am an Apprentice'}</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{isRtl ? 'מחפש ללמוד מקצוע מבעל מקצוע מנוסה' : 'Looking to learn a trade from an experienced pro'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <ChevronRight size={16} className="rtl:rotate-180" />
            </div>
          </div>
        </button>

        {/* Mentor card */}
        <button
          onClick={() => { setRole('mentor'); setTimeout(() => setStep(2), 150); }}
          className="w-full group p-5 rounded-2xl border-2 text-start transition-all bg-gray-50 border-transparent hover:border-blue-400 hover:bg-blue-50/30 active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Presentation size={26} />
            </div>
            <div className="flex-1 text-start">
              <h3 className="text-base font-black text-gray-900">{isRtl ? 'אני מנטור' : 'I am a Mentor'}</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{isRtl ? 'בעל מקצוע שרוצה ללמד, להכשיר ולהעסיק' : 'A professional looking to teach, train, and hire'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
              <ChevronRight size={16} className="rtl:rotate-180" />
            </div>
          </div>
        </button>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        {[
          { icon: Zap, text: isRtl ? 'הרשמה ב-2 דקות' : '2-min signup' },
          { icon: Star, text: isRtl ? 'חינם לחלוטין' : '100% free' },
          { icon: CheckCircle2, text: isRtl ? 'ללא כרטיס אשראי' : 'No credit card' },
        ].map((b, i) => (
          <div key={i} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl text-center">
            <b.icon size={16} className="text-blue-500" />
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-wide leading-tight">{b.text}</span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button onClick={() => setIsLogin(true)} className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">
          {isRtl ? 'כבר יש לך חשבון? התחבר' : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <form className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300" onSubmit={handleAuth}>
      {/* Progress + back */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={18} className="rtl:rotate-180" />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
              <CheckCircle2 size={14} />
            </div>
            <div className="w-10 h-1 bg-emerald-500 rounded-full" />
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">2</div>
          </div>
        </div>
      </div>
      
      {/* Role indicator */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role === 'mentor' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {role === 'mentor' ? <Presentation size={18} /> : <GraduationCap size={18} />}
        </div>
        <div>
          <p className="text-xs font-black text-gray-900 uppercase tracking-widest">
            {isRtl ? `הרשמה כ${role === 'mentor' ? 'מנטור' : 'מתלמד'}` : `Signing up as ${role === 'mentor' ? 'Mentor' : 'Apprentice'}`}
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="relative group">
        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={17} />
        <input type="text" required placeholder={isRtl ? 'שם מלא' : 'Full Name'} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
      </div>

      <div className="relative group">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={17} />
        <input type="text" required placeholder={isRtl ? 'עיר מגורים' : 'City'} value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
      </div>

      <div className="relative group">
        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={17} />
        <input type="tel" required placeholder={isRtl ? 'מספר טלפון' : 'Phone Number'} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
      </div>

      {role === 'mentor' && (
        <>
          <div className="relative group">
            <Wrench className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={17} />
            <input type="text" required placeholder={isRtl ? 'מקצוע / תחום עיסוק' : 'Trade / Occupation'} value={occupation} onChange={(e) => setOccupation(e.target.value)} className={inputClass} />
          </div>

          <div className="relative group">
            <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={17} />
            <input type="number" required min="0" placeholder={isRtl ? 'שנות ניסיון' : 'Years of Experience'} value={experience} onChange={(e) => setExperience(e.target.value)} className={inputClass} />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
              {isRtl ? 'עומס עבודה ממוצע' : 'Average Workload'}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {['low', 'medium', 'high', 'variable'].map((opt) => (
                <label key={opt} className={`flex items-center justify-center p-2.5 rounded-xl border-2 cursor-pointer transition-all font-black text-[9px] uppercase tracking-wide ${
                  workload === opt ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                }`}>
                  <input type="radio" name="workload" required className="hidden" value={opt} onChange={(e) => setWorkload(e.target.value)} />
                  {opt === 'low' ? (isRtl ? 'מעט' : 'Low') : 
                   opt === 'medium' ? (isRtl ? 'בינוני' : 'Med') : 
                   opt === 'high' ? (isRtl ? 'הרבה' : 'High') : (isRtl ? 'משתנה' : 'Flex')}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 p-3.5 bg-blue-50/60 rounded-xl cursor-pointer border border-blue-100">
            <input 
              type="checkbox" 
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 shrink-0" 
            />
            <span className="text-xs font-medium text-gray-700 leading-relaxed">
              {isRtl 
                ? 'אני מתחייב/ת להתנהלות מכבדת עם המתלמד.'
                : 'I commit to respectful conduct with the apprentice.'}
            </span>
          </label>
        </>
      )}

      <div className="relative group">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={17} />
        <input type="email" required autoComplete="off" placeholder={isRtl ? 'כתובת אימייל' : 'Email Address'} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </div>

      <div className="relative group">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={17} />
        <input type="password" required autoComplete="new-password" placeholder={isRtl ? 'סיסמה (לפחות 6 תווים)' : 'Password (min 6 chars)'} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-100 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
        ) : (
          <>
            <Rocket size={16} />
            {isRtl ? 'סיום הרשמה' : 'Complete Signup'}
          </>
        )}
      </button>
    </form>
  );

  const renderLogin = () => (
    <form className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300" onSubmit={handleAuth}>
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          {isRtl ? 'ברוך הבא בחזרה' : 'Welcome back'}
        </h2>
        <p className="text-gray-500 text-sm font-medium">
          {isRtl ? 'התחבר לחשבון שלך' : 'Sign in to your account'}
        </p>
      </div>

      <div className="relative group">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={17} />
        <input type="email" required autoComplete="username" placeholder={isRtl ? 'כתובת אימייל' : 'Email Address'} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </div>

      <div className="relative group">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={17} />
        <input type="password" required autoComplete="current-password" placeholder={isRtl ? 'סיסמה' : 'Password'} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-100 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
        ) : (isRtl ? 'התחברות' : 'Log In')}
      </button>

      <div className="text-center pt-2">
        <button onClick={() => { setIsLogin(false); setStep(1); }} className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">
          {isRtl ? 'אין לך חשבון? הצטרף עכשיו' : 'New to SkillLink? Join now'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Card */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-blue-600 to-emerald-500" />
        
        <div className="p-6 sm:p-8 space-y-6">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="text-2xl sm:text-3xl font-black tracking-tighter text-black !font-sans" dir="ltr">
              SkillLink<span className="text-blue-600">.</span>
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-600 text-sm font-medium">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {isLogin ? renderLogin() : (step === 1 ? renderStep1() : renderStep2())}
        </div>
      </div>
    </div>
  );
}
