import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  ChevronRight, 
  AlertCircle, 
  Check, 
  ArrowLeft, 
  GraduationCap, 
  Presentation, 
  Rocket,
  Briefcase,
  Eye, 
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  
  // New Intent Fields
  const [learningIntent, setLearningIntent] = useState<'trade' | 'business' | 'both'>('trade');
  const [preferredDuration, setPreferredDuration] = useState<'short' | 'long' | 'both'>('long');
  const [businessType, setBusinessType] = useState('');

  useEffect(() => {
    const mode = searchParams.get('mode');
    const roleParam = searchParams.get('role');
    
    if (mode === 'signup') {
      setIsLogin(false);
      setStep(1);
    } else if (mode === 'login') {
      setIsLogin(true);
    }

    if (roleParam === 'mentor' || roleParam === 'mentee') {
      setRole(roleParam as 'mentor' | 'mentee');
      setStep(2);
      setIsLogin(false);
    }
  }, [searchParams]);

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
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              location: location,
              learning_intent: learningIntent,
              preferred_duration: preferredDuration,
              business_type: role === 'mentor' ? businessType : undefined,
            }
          }
        });

        if (signUpError) throw signUpError;
        
        if (data.user) {
          if (isRtl) {
            alert('נרשמת בהצלחה! ברוך הבא ל-SkillLink.');
          } else {
            alert('Signed up successfully! Welcome to SkillLink.');
          }
        }
      }
    } catch (err: any) {
      if (err.message === 'User already registered') {
        setError(isRtl ? 'המשתמש כבר קיים במערכת' : 'User already registered');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const ProgressBar = () => (
    <div className="flex items-center justify-between w-full max-w-[280px] mx-auto mb-10">
      <div className="flex flex-col items-center relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-300 ${
          step >= 1 ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400 uppercase'
        }`}>
          {step > 1 ? <Check size={18} /> : '1'}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 whitespace-nowrap transition-colors ${
          step === 1 ? 'text-blue-500' : 'text-gray-400'
        }`}>
          {isRtl ? 'בחירת תפקיד' : 'Role Selection'}
        </span>
      </div>
      
      <div className="flex-1 h-[2px] bg-gray-100 -mt-6 mx-2 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: step > 1 ? (step === 2 ? '50%' : '100%') : '0%' }}
          className="h-full bg-blue-500" 
        />
      </div>

      <div className="flex flex-col items-center relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-300 ${
          step >= 2 ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'
        }`}>
          {step > 2 ? <Check size={18} /> : '2'}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 whitespace-nowrap transition-colors ${
          step === 2 ? 'text-blue-500' : 'text-gray-400'
        }`}>
          {isRtl ? 'כוונות' : 'Intent'}
        </span>
      </div>

      <div className="flex-1 h-[2px] bg-gray-100 -mt-6 mx-2 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: step > 2 ? '100%' : '0%' }}
          className="h-full bg-blue-500" 
        />
      </div>

      <div className="flex flex-col items-center relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-300 ${
          step === 3 ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'
        }`}>
          3
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 whitespace-nowrap transition-colors ${
          step === 3 ? 'text-blue-500' : 'text-gray-400'
        }`}>
          {isRtl ? 'פרטים אישיים' : 'Personal Info'}
        </span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProgressBar />
      
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-gray-900">{isRtl ? 'בחר את המסלול שלך' : 'Choose your path'}</h2>
        <p className="text-sm text-gray-500 font-medium">
          {isRtl ? 'איך תרצה להשתמש ב-SkillLink?' : 'How would you like to use SkillLink?'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setRole('mentee')}
          className={`group p-8 rounded-3xl border-2 text-start transition-all flex flex-col gap-6 relative overflow-hidden ${
            role === 'mentee' 
              ? 'border-blue-500 bg-white shadow-[0_20px_50px_-12px_rgba(59,130,246,0.2)]' 
              : 'border-transparent bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-6 relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
              role === 'mentee' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-300'
            }`}>
              <GraduationCap size={40} />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-xl font-bold text-gray-900">{isRtl ? 'אני מתלמד' : 'I am an Apprentice'}</h3>
              <p className="text-xs text-gray-400 font-black uppercase tracking-widest leading-none">
                {isRtl ? 'רוצה ללמוד בשטח' : 'Want to learn in field'}
              </p>
            </div>
          </div>
          
          <ul className="space-y-2 relative z-10">
            {[
              isRtl ? 'למידה מעשית מבעלי מקצוע' : 'Hands-on learning from pros',
              isRtl ? 'צבירת ניסיון מוכח לתיק העבודות' : 'Proven experience for portfolio',
              isRtl ? 'אפשרות להעסקה ישירה' : 'Potential for direct hiring'
            ].map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setRole('mentor')}
          className={`group p-8 rounded-3xl border-2 text-start transition-all flex flex-col gap-6 relative overflow-hidden ${
            role === 'mentor' 
              ? 'border-emerald-500 bg-white shadow-[0_20px_50px_-12px_rgba(16,185,129,0.2)]' 
              : 'border-transparent bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-6 relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
              role === 'mentor' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-gray-300'
            }`}>
              <Presentation size={40} />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-xl font-bold text-gray-900">{isRtl ? 'אני מנטור' : 'I am a Mentor'}</h3>
              <p className="text-xs text-gray-400 font-black uppercase tracking-widest leading-none">
                {isRtl ? 'רוצה להכשיר ולהוביל' : 'Want to train & lead'}
              </p>
            </div>
          </div>

          <ul className="space-y-2 relative z-10">
            {[
              isRtl ? 'מציאת כוח אדם איכותי ונאמן' : 'Find loyal, high-quality staff',
              isRtl ? 'בניית המוניטין המקצועי שלך' : 'Build your professional reputation',
              isRtl ? 'חיבור לקהילת מנטורים מובילים' : 'Connect to top mentor community'
            ].map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </motion.button>
      </div>

      <AnimatePresence>
        {role && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => setStep(2)}
            className={`w-full text-white font-black py-5 rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-95 uppercase tracking-widest text-sm ${
              role === 'mentor' ? 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700' : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'
            }`}
          >
            {isRtl ? 'המשך לשלב הבא' : 'Continue to next step'}
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1 rtl:rotate-180" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="text-center pt-2">
        <button onClick={() => setIsLogin(true)} className="text-sm font-bold text-gray-400 hover:text-black transition-colors flex items-center justify-center gap-2 mx-auto">
          {isRtl ? 'כבר יש לך חשבון? התחבר עכשיו' : 'Already have an account? Log in now'}
          <ArrowRight size={14} className="rtl:rotate-180" />
        </button>
      </div>
    </div>
  );

  const renderIntentStep = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <ProgressBar />

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-gray-900">{isRtl ? 'מה המטרה שלך?' : 'What is your goal?'}</h2>
        <p className="text-sm text-gray-500 font-medium">
          {isRtl ? 'עזור לנו להבין מה אתה מחפש ב-SkillLink' : 'Help us understand what you seek in SkillLink'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Intent Selection */}
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            {isRtl ? 'מה תרצה ללמוד/להציע?' : 'What would you like to learn/offer?'}
          </label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'trade', label: isRtl ? 'למידת מקצוע מעשי' : 'Learn practical trade', icon: GraduationCap },
              { id: 'business', label: isRtl ? 'ניהול עסקי וניהול שטח' : 'Business & Field Management', icon: Presentation },
              { id: 'both', label: isRtl ? 'גם וגם' : 'Both', icon: Rocket }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLearningIntent(opt.id as any)}
                className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-start ${
                  learningIntent === opt.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-50 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${learningIntent === opt.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-400'}`}>
                  <opt.icon size={24} />
                </div>
                <span className="font-bold text-gray-900">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration Selection */}
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            {isRtl ? 'סוג התנסות מועדף' : 'Preferred experience type'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'short', label: isRtl ? 'עבודה מזדמנת' : 'Occasional Work' },
              { id: 'long', label: isRtl ? 'חניכה מלאה' : 'Full Apprenticeship' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPreferredDuration(opt.id as any)}
                className={`p-4 rounded-xl border-2 transition-all text-center font-bold text-sm ${
                  preferredDuration === opt.id ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-gray-50 bg-gray-50 text-gray-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setStep(3)}
          className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group"
        >
          {isRtl ? 'המשך' : 'Continue'}
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 rtl:rotate-180" />
        </button>

        <button
          type="button"
          onClick={() => setStep(1)}
          className="w-full py-2 text-gray-400 hover:text-gray-600 flex items-center justify-center gap-2 font-bold transition-colors"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" />
          {isRtl ? 'חזרה' : 'Back'}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <form className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500" onSubmit={handleAuth}>
      <ProgressBar />

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-gray-900">{isRtl ? 'פרטים אחרונים' : 'Final Details'}</h2>
        <div className="flex items-center justify-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest">
          {role === 'mentor' ? <Presentation size={14} /> : <GraduationCap size={14} />}
          {isRtl ? `אתה נרשם כ: ${role === 'mentor' ? 'מנטור' : 'מתלמד'}` : `Signing up as: ${role === 'mentor' ? 'Mentor' : 'Apprentice'}`}
        </div>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 px-1">{isRtl ? 'שם מלא' : 'Full Name'}</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={20} />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-medium outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Mentor only: Business Type */}
        {role === 'mentor' && (
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 px-1">{isRtl ? 'סוג העסק / מקצוע' : 'Business Type / Profession'}</label>
            <div className="relative group">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={20} />
              <input
                type="text"
                required
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder={isRtl ? 'למשל: סטרט-אפ, נגריה, סטודיו לעיצוב' : 'e.g. Startup, Carpentry, Design Studio'}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-medium outline-none text-gray-900"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 px-1">{isRtl ? 'אימייל' : 'Email'}</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={20} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-medium outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 px-1">{isRtl ? 'סיסמה' : 'Password'}</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-medium outline-none text-gray-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute top-1/2 -translate-y-1/2 p-2 hover:text-blue-500 transition-colors ${isRtl ? 'left-auto right-3' : 'right-3'}`}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 px-1">{isRtl ? 'מיקום' : 'Location'}</label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={20} />
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-medium outline-none text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
          ) : (
            isRtl ? 'צור חשבון' : 'Create Account'
          )}
        </button>

        <button
          type="button"
          onClick={() => setStep(2)}
          className="w-full py-2 text-gray-400 hover:text-gray-600 flex items-center justify-center gap-2 font-bold transition-colors"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" />
          {isRtl ? 'חזרה' : 'Back'}
        </button>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-[1px] bg-gray-100" />
        <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{isRtl ? 'או' : 'OR'}</span>
        <div className="flex-1 h-[1px] bg-gray-100" />
      </div>

      <button
        type="button"
        className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
      >
        <Globe className="w-5 h-5 text-gray-400" />
        {isRtl ? 'המשך עם Google' : 'Continue with Google'}
      </button>
    </form>
  );

  const renderLogin = () => (
    <form className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500" onSubmit={handleAuth}>
      <div className="text-center space-y-1">
        <h2 className="text-[28px] font-black text-gray-900 tracking-tight">{isRtl ? 'ברוך השב' : 'Welcome Back'}</h2>
        <p className="text-gray-500 font-medium">{isRtl ? 'הזן את פרטיך כדי להתחבר' : 'Enter your details to log in'}</p>
      </div>

      <div className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 px-1">{isRtl ? 'אימייל' : 'Email'}</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={20} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-medium outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-bold text-gray-700">{isRtl ? 'סיסמה' : 'Password'}</label>
            <button type="button" className="text-xs font-bold text-blue-500 hover:underline">{isRtl ? 'שכחת סיסמה?' : 'Forgot password?'}</button>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all font-medium outline-none text-gray-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:text-blue-500 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
        ) : (
          isRtl ? 'התחבר' : 'Connect'
        )}
      </button>

      <div className="text-center pt-4">
        <p className="text-sm font-medium text-gray-500">
          {isRtl ? 'עדיין אין לך חשבון?' : "Don't have an account?"}{' '}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(false);
              setStep(1);
            }} 
            className="text-blue-500 font-extrabold hover:underline"
          >
            {isRtl ? 'הצטרף עכשיו' : 'Join now'}
          </button>
        </p>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 sm:p-10 space-y-8">
            {/* Logo */}
            <div className="text-center">
              <Link to="/" className="text-3xl font-black tracking-tighter text-black !font-sans flex items-center justify-center" dir="ltr">
                SkillLink<span className="text-blue-500">.</span>
              </Link>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm font-medium"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}

            {isLogin 
              ? renderLogin() 
              : step === 1 
                ? renderStep1() 
                : step === 2 
                  ? renderIntentStep() 
                  : renderStep3()
            }
          </div>
        </div>
      </motion.div>
    </div>
  );
}
