import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Presentation, 
  GraduationCap, 
  MapPin, 
  Clock, 
  DollarSign, 
  Image as ImageIcon, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Info,
  Target,
  Zap,
  Users,
  Briefcase,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OpportunityNewProps {
  isRtl: boolean;
  isEditing?: boolean;
}

export default function OpportunityNew({ isRtl, isEditing = false }: OpportunityNewProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  
  const [step, setStep] = useState(isEditing ? 2 : 1);
  const [subStep, setSubStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<'mentor_offer' | 'mentee_seeking'>('mentee_seeking');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payPeriod, setPayPeriod] = useState<'hour' | 'day' | 'month'>('hour');
  const [aboutWork, setAboutWork] = useState('');
  const [requirements, setRequirements] = useState('');
  const [menteeWillLearn, setMenteeWillLearn] = useState('');
  const [whoIWantToTeach, setWhoIWantToTeach] = useState('');
  const [availabilityDays, setAvailabilityDays] = useState<string[]>([]);
  const [desiredSalary, setDesiredSalary] = useState('');
  const [whatIWantToLearn, setWhatIWantToLearn] = useState('');
  const [experienceNote, setExperienceNote] = useState('');

  // Calculate Post Strength
  const postStrength = useMemo(() => {
    let score = 0;
    if (title.length > 5) score += 15;
    if (location.length > 2) score += 10;
    if (type === 'mentor_offer') {
      if (aboutWork.length > 20) score += 20;
      if (requirements.length > 10) score += 15;
      if (menteeWillLearn.length > 20) score += 20;
      if (whoIWantToTeach.length > 10) score += 10;
    } else {
      if (whatIWantToLearn.length > 20) score += 30;
      if (experienceNote.length > 10) score += 20;
      if (availabilityDays.length > 0) score += 15;
    }
    if (imageFile || imagePreview) score += 10;
    return Math.min(100, score);
  }, [title, location, aboutWork, requirements, menteeWillLearn, whoIWantToTeach, whatIWantToLearn, experienceNote, availabilityDays, imageFile, imagePreview, type]);

  const strengthLabel = useMemo(() => {
    if (postStrength < 30) return isRtl ? 'התחלה טובה' : 'Good start';
    if (postStrength < 60) return isRtl ? 'כמעט שם' : 'Almost there';
    if (postStrength < 90) return isRtl ? 'פוסט מצוין!' : 'Great post!';
    return isRtl ? 'מושלם!' : 'Perfect!';
  }, [postStrength, isRtl]);

  const strengthColor = useMemo(() => {
    if (postStrength < 30) return 'bg-slate-200';
    if (postStrength < 60) return 'bg-orange-500';
    if (postStrength < 90) return 'bg-slate-900';
    return 'bg-emerald-500';
  }, [postStrength]);

  // Sync type with profile role once loaded
  useEffect(() => {
    if (profile && !isEditing) {
      const defaultType = profile.role === 'mentor' ? 'mentor_offer' : 'mentee_seeking';
      setType(defaultType);
      setLocation(profile.city || profile.location || '');
    }
  }, [profile, isEditing]);

  // Fetch opportunity for editing
  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!isEditing || !id || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data.owner_id !== user.id) {
          navigate('/app/opportunities');
          return;
        }

        setType(data.type);
        setTitle(data.title);
        setLocation(data.location);
        setWorkHours(data.work_hours || '');
        setPayAmount(data.pay_amount?.toString() || '');
        setPayPeriod(data.pay_period || 'hour');
        setAboutWork(data.about_work || '');
        setRequirements(data.requirements || '');
        setMenteeWillLearn(data.mentee_will_learn || '');
        setWhoIWantToTeach(data.who_i_want_to_teach || '');
        setAvailabilityDays(data.availability_days || []);
        setDesiredSalary(data.desired_salary?.toString() || '');
        setWhatIWantToLearn(data.what_i_want_to_learn || '');
        setExperienceNote(data.experience_note || '');
        setImagePreview(data.image_url);
      } catch (err: any) {
        console.error('Error fetching opportunity:', err.message);
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchOpportunity();
  }, [isEditing, id, user, navigate]);

  const daysOfWeek = isRtl 
    ? ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'] 
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: string) => {
    setAvailabilityDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we are not on the last sub-step, just move to the next one
    if (subStep < 3) {
      setSubStep(prev => prev + 1);
      return;
    }

    // Only proceed with submission if we are on the last sub-step (3)
    if (subStep !== 3) return;

    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let imageUrl = imagePreview;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('opportunities_images')
          .upload(filePath, imageFile);

        if (uploadError) {
          if (uploadError.message.includes('Bucket not found')) {
            throw new Error('Storage bucket "opportunities_images" not found.');
          }
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('opportunities_images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const opportunityData = {
        owner_id: user.id,
        type,
        title,
        location,
        work_hours: workHours,
        pay_amount: payAmount ? (parseFloat(payAmount) || 0) : null,
        pay_period: payAmount ? payPeriod : null,
        about_work: type === 'mentor_offer' ? aboutWork : null,
        requirements: type === 'mentor_offer' ? requirements : null,
        who_i_want_to_teach: type === 'mentor_offer' ? whoIWantToTeach : null,
        mentee_will_learn: type === 'mentor_offer' ? menteeWillLearn : null,
        availability_days: type === 'mentee_seeking' ? availabilityDays : null,
        desired_salary: type === 'mentee_seeking' ? (parseFloat(desiredSalary) || 0) : null,
        what_i_want_to_learn: type === 'mentee_seeking' ? whatIWantToLearn : null,
        experience_note: type === 'mentee_seeking' ? experienceNote : null,
        image_url: imageUrl
      };

      if (isEditing && id) {
        const { error: updateError } = await supabase
          .from('opportunities')
          .update(opportunityData)
          .eq('id', id);

        if (updateError) throw updateError;
        navigate(`/app/opportunities/${id}`);
      } else {
        const { data, error: insertError } = await supabase
          .from('opportunities')
          .insert(opportunityData)
          .select()
          .single();

        if (insertError) throw insertError;
        navigate(`/app/opportunities/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && !profile) || fetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full" />
          <p className="text-gray-500 font-medium">{isRtl ? 'טוען...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const isApprentice = profile?.role === 'mentee';
  const isAdmin = profile?.role === 'admin';
  const isVerifiedMentor = profile?.role === 'mentor' && (profile?.is_verified === true || profile?.verification_status === 'approved');

  if (!isApprentice && !isVerifiedMentor && !isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900">
            {isRtl ? 'רק מנטורים מאומתים יכולים לפרסם הצעות' : 'Only verified mentors can post offers'}
          </h1>
          <p className="text-gray-500 font-medium max-w-md mx-auto">
            {isRtl ? 'השלם תהליך אימות מנטור והמתן לאישור מנהל המערכת.' : 'Complete the mentor verification process and wait for admin approval.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate(profile?.role === 'mentor' ? '/app/verify' : '/app/opportunities')} className="px-8 py-3 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-gray-800 transition-all active:scale-95">
            {profile?.role === 'mentor' ? (isRtl ? 'עבור לדף אימות' : 'Go to Verification') : (isRtl ? 'חזרה להזדמנויות' : 'Back to Opportunities')}
          </button>
        </div>
      </div>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-12 py-8">
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/10"
        >
          <Sparkles size={14} />
          {isRtl ? 'בוא נבנה את דור העתיד' : "Let's build the next generation"}
        </motion.div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tight">{isRtl ? 'מה תרצה לפרסם?' : 'What would you like to post?'}</h2>
        <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto">{isRtl ? 'בחר את הדרך שלך להשפיע על הקהילה המקצועית' : 'Choose your way to impact the professional community'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <motion.button
          whileHover={{ y: -8, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { 
            if (profile?.role !== 'mentor') return alert(isRtl ? 'רק מנטורים יכולים לפרסם הצעת התלמדות.' : 'Only mentors can post an apprentice offer.');
            if (profile.verification_status === 'approved' || profile.is_verified) { setType('mentor_offer'); setStep(2); } else { navigate('/app/verify'); }
          }}
          className={`group p-10 rounded-[3rem] border-4 text-start transition-all relative overflow-hidden ${
            profile?.role === 'mentor' ? 'border-slate-900 bg-white shadow-2xl shadow-slate-100' : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="relative z-10 space-y-6">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${
              profile?.role === 'mentor' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 group-hover:rotate-6' : 'bg-slate-200 text-slate-400'
            }`}>
              <Presentation size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">{isRtl ? 'הצעת מנטור (Master)' : 'Master Offer'}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {isRtl ? 'יש לך ידע? תן למישהו הזדמנות ללמוד ממך בשטח ולבנות קריירה.' : 'Have knowledge? Give someone a chance to learn from you in the field and build a career.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest pt-4">
              {isRtl ? 'פרסם הצעה' : 'Post Offer'}
              <ArrowRight size={16} className="rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ y: -8, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { 
            if (profile?.role !== 'mentee') return alert(isRtl ? 'רק מתלמדים יכולים לפרסם בקשת התלמדות.' : 'Only apprentices can post a seeking request.');
            setType('mentee_seeking'); setStep(2); 
          }}
          className={`group p-10 rounded-[3rem] border-4 text-start transition-all relative overflow-hidden ${
            profile?.role === 'mentee' ? 'border-emerald-600 bg-white shadow-2xl shadow-emerald-100' : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="relative z-10 space-y-6">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${
              profile?.role === 'mentee' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 group-hover:-rotate-6' : 'bg-slate-200 text-slate-400'
            }`}>
              <GraduationCap size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">{isRtl ? 'מתלמד מחפש (Apprentice)' : 'Apprentice Seeking'}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {isRtl ? 'רוצה ללמוד מקצוע לחיים? ספר לנו מה אתה מחפש ומי אתה.' : 'Want to learn a trade for life? Tell us what you seek and who you are.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest pt-4">
              {isRtl ? 'חפש מנטור' : 'Find Mentor'}
              <ArrowRight size={16} className="rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderField = (label: string, icon: any, children: React.ReactNode, tip?: string) => (
    <div className="space-y-3 group">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          {icon && React.createElement(icon, { size: 14, className: "text-slate-400 group-focus-within:text-slate-900 transition-colors" })}
          {label}
        </label>
        {tip && (
          <div className="relative group/tip">
            <Info size={14} className="text-slate-300 cursor-help hover:text-slate-900 transition-colors" />
            <div className="absolute bottom-full mb-2 right-0 w-48 p-4 bg-slate-900 text-white text-[10px] font-bold rounded-2xl opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 shadow-2xl border border-white/10 leading-relaxed">
              {tip}
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );

  const renderStep2 = () => {
    const renderSubStep1 = () => (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900">{isRtl ? 'פרטים בסיסיים' : 'Basic Details'}</h3>
          <p className="text-slate-500 font-medium">{isRtl ? 'ספר לנו את הדברים הכי חשובים על ההזדמנות.' : 'Tell us the most important things about the opportunity.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            {renderField(
              isRtl ? 'כותרת ההזדמנות' : 'Opportunity Title',
              null,
              <input 
                type="text" 
                required
                placeholder={isRtl ? 'למשל: דרוש חניך לחשמלאות בניין' : 'e.g. Apprentice needed for electrical work'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-slate-900 transition-all font-bold outline-none text-lg"
              />,
              isRtl ? 'כותרת ברורה ומושכת תעזור לאנשים למצוא אותך מהר יותר.' : 'A clear and catchy title helps people find you faster.'
            )}
          </div>

          {renderField(
            isRtl ? 'מיקום' : 'Location',
            MapPin,
            <input 
              type="text" 
              required
              placeholder={isRtl ? 'עיר' : 'City'}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-slate-900 transition-all font-bold outline-none"
            />
          )}

          {renderField(
            isRtl ? 'שעות עבודה' : 'Work Hours',
            Clock,
            <input 
              type="text" 
              placeholder={isRtl ? 'למשל: 08:00-16:00' : 'e.g. 08:00-16:00'}
              value={workHours}
              onChange={(e) => setWorkHours(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-slate-900 transition-all font-bold outline-none"
            />
          )}

          <div className="md:col-span-2">
            {renderField(
              type === 'mentor_offer' ? (isRtl ? 'שכר בסיס למתלמד' : 'Base Pay to Apprentice') : (isRtl ? 'שכר מבוקש' : 'Desired Salary'),
              DollarSign,
              <div className="flex gap-3">
                <input 
                  type="number" 
                  placeholder="0"
                  value={type === 'mentor_offer' ? payAmount : desiredSalary}
                  onChange={(e) => type === 'mentor_offer' ? setPayAmount(e.target.value) : setDesiredSalary(e.target.value)}
                  className="flex-1 px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-slate-900 transition-all font-bold outline-none"
                />
                {type === 'mentor_offer' && (
                  <select 
                    value={payPeriod}
                    onChange={(e) => setPayPeriod(e.target.value as any)}
                    className="px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:bg-white focus:border-slate-900 transition-all"
                  >
                    <option value="hour">{isRtl ? 'לשעה' : '/hr'}</option>
                    <option value="day">{isRtl ? 'ליום' : '/day'}</option>
                    <option value="month">{isRtl ? 'לחודש' : '/mo'}</option>
                  </select>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );

    const renderSubStep2 = () => (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900">{isRtl ? 'תוכן ודרישות' : 'Content & Requirements'}</h3>
          <p className="text-slate-500 font-medium">{isRtl ? 'פרט על המהות של ההזדמנות ומה נדרש.' : 'Detail the essence of the opportunity and what is required.'}</p>
        </div>

        <div className="space-y-8">
          {type === 'mentor_offer' ? (
            <>
              {renderField(isRtl ? 'על העבודה' : 'About the Work', Info, 
                <textarea required rows={4} placeholder={isRtl ? 'תאר את העבודה היומיומית, הפרויקטים והאווירה...' : 'Describe the daily work, projects and atmosphere...'} value={aboutWork} onChange={(e) => setAboutWork(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-slate-900 transition-all font-medium outline-none resize-none" />
              )}
              {renderField(isRtl ? 'את מי אני רוצה ללמד' : 'Who I want to teach', Users, 
                <textarea required rows={3} placeholder={isRtl ? 'תאר את המתלמד האידיאלי עבורך (רצינות, תשוקה...)' : 'Describe your ideal apprentice (seriousness, passion...)'} value={whoIWantToTeach} onChange={(e) => setWhoIWantToTeach(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-slate-900 transition-all font-medium outline-none resize-none" />
              )}
              {renderField(isRtl ? 'דרישות בסיס' : 'Basic Requirements', CheckCircle2, 
                <textarea required rows={3} placeholder={isRtl ? 'למשל: רצינות, הגעה בזמן, רצון ללמוד' : 'e.g. Punctuality, willingness to learn'} value={requirements} onChange={(e) => setRequirements(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-slate-900 transition-all font-medium outline-none resize-none" />
              )}
              {renderField(isRtl ? 'תכנית לימודים (מה המתלמד ילמד)' : 'Curriculum (What the Apprentice will learn)', GraduationCap, 
                <textarea required rows={4} placeholder={isRtl ? 'פרט את הידע המקצועי והכלים שהמתלמד ירכוש אצלך בשטח...' : 'Detail the professional knowledge and tools the apprentice will gain with you in the field...'} value={menteeWillLearn} onChange={(e) => setMenteeWillLearn(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-slate-900 transition-all font-medium outline-none resize-none" />
              )}
            </>
          ) : (
            <>
              {renderField(isRtl ? 'מה אני רוצה ללמוד' : 'What I want to learn', GraduationCap, 
                <textarea required rows={5} placeholder={isRtl ? 'תאר את המקצוע שאתה רוצה ללמוד ולמה זה חשוב לך...' : 'Describe the trade you want to learn and why it matters to you...'} value={whatIWantToLearn} onChange={(e) => setWhatIWantToLearn(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-slate-900 transition-all font-medium outline-none resize-none" />
              )}
              {renderField(isRtl ? 'זמינות (ימים בשבוע)' : 'Availability (Days per week)', Clock, 
                <div className="flex flex-wrap gap-3">
                  {daysOfWeek.map(day => (
                    <button key={day} type="button" onClick={() => toggleDay(day)} className={`w-12 h-12 rounded-2xl font-black text-xs transition-all border-2 ${availabilityDays.includes(day) ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                      {day}
                    </button>
                  ))}
                </div>
              )}
              {renderField(isRtl ? 'ניסיון קודם או רקע טכני' : 'Prior Experience or Technical Background', Briefcase, 
                <textarea rows={4} placeholder={isRtl ? 'ספר בקצרה על רקע טכני, לימודים או עבודות קודמות...' : 'Briefly tell about any technical background, studies or past jobs...'} value={experienceNote} onChange={(e) => setExperienceNote(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-slate-900 transition-all font-medium outline-none resize-none" />
              )}
            </>
          )}
        </div>
      </div>
    );

    const renderSubStep3 = () => (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900">{isRtl ? 'ויזואליות וסיום' : 'Visuals & Finish'}</h3>
          <p className="text-slate-500 font-medium">{isRtl ? 'הוסף תמונה כדי להפוך את הפוסט שלך למושך יותר.' : 'Add an image to make your post more attractive.'}</p>
        </div>

        <div className="space-y-8">
          {renderField(
            isRtl ? 'תמונת הזדמנות' : 'Opportunity Image',
            ImageIcon,
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
              <label 
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-80 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] cursor-pointer hover:bg-slate-100 hover:border-slate-900 transition-all overflow-hidden group/img"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mx-auto shadow-sm group-hover/img:scale-110 transition-transform">
                      <ImageIcon size={32} />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'לחץ להעלאה' : 'Click to upload'}</span>
                      <span className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest">{isRtl ? 'מומלץ: תמונה מהשטח' : 'Recommended: Field photo'}</span>
                    </div>
                  </div>
                )}
              </label>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Progress & Tips */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-50 rounded-[3rem] p-10 space-y-10 sticky top-24 border border-slate-100 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{isRtl ? 'חוזק הפוסט' : 'Post Strength'}</h3>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full text-white shadow-lg ${strengthColor}`}>{strengthLabel}</span>
              </div>
              <div className="h-5 w-full bg-slate-200 rounded-full overflow-hidden p-1 border border-slate-200">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${postStrength}%` }}
                  className={`h-full rounded-full transition-all duration-700 shadow-inner ${strengthColor}`}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
                {isRtl 
                  ? 'פוסטים מפורטים עם תמונה זוכים ל-80% יותר פניות. ככל שתפרט יותר, כך תמצא את ההתאמה המושלמת מהר יותר.'
                  : 'Detailed posts with images get 80% more responses. The more you detail, the faster you find the perfect match.'}
              </p>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{isRtl ? 'שלבי הפרסום' : 'Posting Steps'}</h3>
              <div className="space-y-4">
                {[
                  { label: isRtl ? 'פרטים בסיסיים' : 'Basic Details', step: 1 },
                  { label: isRtl ? 'תוכן ודרישות' : 'Content & Requirements', step: 2 },
                  { label: isRtl ? 'ויזואליות וסיום' : 'Visuals & Finish', step: 3 }
                ].map((s, i) => (
                  <div key={i} className={`flex items-center gap-4 transition-all duration-300 ${subStep === s.step ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${subStep === s.step ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-200 text-slate-500'}`}>
                      {s.step}
                    </div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between">
            <button 
              type="button" 
              onClick={() => {
                if (subStep > 1) setSubStep(subStep - 1);
                else if (isEditing) navigate(-1);
                else setStep(1);
              }} 
              className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
            >
              <ArrowLeft size={16} className="rtl:rotate-180" />
              {isRtl ? 'חזרה' : 'Back'}
            </button>
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-slate-900">
                {isEditing 
                  ? (isRtl ? 'עריכת הזדמנות' : 'Edit Opportunity')
                  : (isRtl ? 'פרסום הזדמנות חדשה' : 'Post New Opportunity')}
              </h2>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                type === 'mentor_offer' ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {isRtl ? (type === 'mentor_offer' ? 'הצעת מנטור' : 'מתלמד מחפש') : (type === 'mentor_offer' ? 'Mentor Offer' : 'Apprentice Seeking')}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {subStep === 1 && renderSubStep1()}
            {subStep === 2 && renderSubStep2()}
            {subStep === 3 && renderSubStep3()}

            {error && (
              <div className="p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] flex items-start gap-4 text-red-600 text-sm font-bold animate-shake">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-12 border-t border-slate-100">
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${subStep === i ? 'w-8 bg-slate-900' : 'bg-slate-200'}`} />
                ))}
              </div>
              
              <div className="flex gap-4">
                {subStep < 3 ? (
                  <button
                    type="submit"
                    className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3 group"
                  >
                    {isRtl ? 'המשך' : 'Continue'}
                    <ArrowRight size={20} className="rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-16 py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[0_20px_50px_-10px_rgba(16,185,129,0.3)] hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 group"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <>
                        {isEditing 
                          ? (isRtl ? 'שמור שינויים' : 'Save Changes')
                          : (isRtl ? 'פרסם הזדמנות' : 'Post Opportunity')}
                        {isEditing ? <Save size={20} /> : <ArrowRight size={20} className="rtl:rotate-180 group-hover:translate-x-1 transition-transform" />}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {renderStep1()}
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {renderStep2()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
