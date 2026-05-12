import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Presentation,
  GraduationCap,
  MapPin,
  Clock,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lightbulb,
  Info,
  Target,
  Zap,
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { resolveAsset } from '../lib/assets';

interface OpportunityNewProps {
  isRtl: boolean;
  isEditing?: boolean;
}

export default function OpportunityNew({ isRtl, isEditing = false }: OpportunityNewProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const initialized = useRef(false);
  
  const [step, setStep] = useState(isEditing ? 2 : 1);
  const [subStep, setSubStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<'mentor_offer' | 'mentee_seeking'>('mentee_seeking');
  const [opportunityType, setOpportunityType] = useState<'apprenticeship' | 'project'>('apprenticeship');
  const [commitmentLevel, setCommitmentLevel] = useState<'high' | 'low' | 'flexible'>('high');
  const [profession, setProfession] = useState(profile?.occupation || '');
  const [learningFocus, setLearningFocus] = useState('');
  const [durationDescription, setDurationDescription] = useState('');
  
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
      if (profession) score += 15;
      if (learningFocus) score += 20;
    } else {
      if (whatIWantToLearn.length > 20) score += 30;
      if (profession) score += 20;
    }
    if (imageFile || imagePreview) score += 10;
    return Math.min(100, score);
  }, [title, location, aboutWork, profession, learningFocus, whatIWantToLearn, imageFile, imagePreview, type]);

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

  useEffect(() => {
    if (profile && !isEditing && !initialized.current) {
      initialized.current = true;
      setType(profile.role === 'mentor' ? 'mentor_offer' : 'mentee_seeking');
      setLocation(profile.city || '');
      setProfession(profile.occupation || '');
    }
  }, [profile?.id, isEditing]);

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!isEditing || !id || !user) return;
      try {
        const { data, error: fetchErr } = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', id)
          .single();
        if (fetchErr || !data) { setError('Opportunity not found'); return; }
        if (data.owner_id !== user.id) { navigate('/my-opportunities'); return; }
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
        setImagePreview(data.image_url || null);
        setProfession(data.profession || profile?.occupation || '');
        setLearningFocus(data.learning_focus || '');
        setDurationDescription(data.duration_description || '');
        setCommitmentLevel(data.commitment_level || 'high');
        setOpportunityType(data.opportunity_type || 'apprenticeship');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };
    fetchOpportunity();
  }, [isEditing, id, user?.id]);

  const getFieldContent = (fieldName: string) => {
    const isMentor = type === 'mentor_offer';
    const prof = profession.toLowerCase();

    const getContent = () => {
      if (prof.includes('ספר') || prof.includes('שיער') || prof.includes('barber')) {
        return {
          title: isMentor ? 'דרושה חניכה לעיצוב שיער בסטודיו מוביל' : 'מחפש להתמחות אצל ספר צמרת',
          focus: isMentor ? 'טכניקות צבע וניהול לקוחות' : 'שימוש בתער ותספורות גברים',
        };
      }
      return {
        title: isMentor ? (isRtl ? 'דרוש חניך רציני' : 'Apprentice wanted') : (isRtl ? 'מחפש מנטור מקצועי' : 'Seeking master'),
        focus: isMentor ? (isRtl ? 'הקניית יסודות המקצוע' : 'Professional basics') : (isRtl ? 'רכישת מיומנויות פרקטיות' : 'Practical skills'),
      };
    };

    const strings = getContent();
    return strings[fieldName as keyof typeof strings] || '';
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
    if (subStep < 4) {
      if (subStep === 1 && (!title || !location || !profession)) { 
        setError(isRtl ? 'חובה למלא כותרת, מיקום ותחום מקצועי' : 'Title, location and field required'); 
        return; 
      }
      setError(null);
      setSubStep(subStep + 1);
      return;
    }

    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = imagePreview;
      if (imageFile && user) {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('opportunities_images')
          .upload(path, imageFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('opportunities_images').getPublicUrl(path);
          imageUrl = urlData.publicUrl;
        }
      }

      const payload = {
        type,
        opportunity_type: opportunityType,
        commitment_level: commitmentLevel,
        learning_focus: learningFocus,
        duration_description: durationDescription,
        title,
        location,
        profession,
        about_work: aboutWork,
        requirements,
        who_i_want_to_teach: whoIWantToTeach,
        mentee_will_learn: menteeWillLearn,
        availability_days: availabilityDays,
        desired_salary: desiredSalary ? parseFloat(desiredSalary) : null,
        what_i_want_to_learn: whatIWantToLearn,
        experience_note: experienceNote,
        image_url: imageUrl,
      };

      if (isEditing && id) {
        const { error: updateErr } = await supabase
          .from('opportunities')
          .update(payload)
          .eq('id', id)
          .eq('owner_id', user!.id);
        if (updateErr) throw updateErr;
        navigate(`/opportunities/${id}`);
      } else {
        const { data: newOpp, error: insertErr } = await supabase
          .from('opportunities')
          .insert({ ...payload, owner_id: user!.id, status: 'active' })
          .select('id')
          .single();
        if (insertErr) throw insertErr;
        navigate(`/opportunities/${newOpp.id}`);
      }
    } catch (err: any) {
      setError(err.message || (isRtl ? 'שגיאה בשמירה' : 'Error saving'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (label: string, icon: any, children: React.ReactNode, tip?: string) => (
    <div className="space-y-3 group">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
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
      <div className="relative">
        <div className="absolute inset-0 bg-slate-900/5 rounded-[2.5rem] -m-1 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        {children}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-12 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
          <Sparkles size={14} className="text-emerald-400" />
          {isRtl ? 'בניית דור המקצוענים הבא' : 'Building the next pro generation'}
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {isRtl ? 'מה הכיוון שלך היום?' : 'What is your direction today?'}
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto italic leading-relaxed">
          {isRtl ? 'בחר את המסלול שלך להשפעה, למידה או צמיחה מקצועית' : 'Choose your path for impact, learning, or professional growth'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto px-4">
        <motion.button
          type="button"
          whileHover={{ y: -12, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setType('mentor_offer'); setStep(2); }}
          className="group p-12 rounded-[4rem] border-4 text-start transition-all relative overflow-hidden flex flex-col gap-10 bg-white border-slate-900 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.25)]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-700" />
          
          <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500 relative z-10">
            <Presentation size={48} />
          </div>
          <div className="space-y-4 relative z-10">
            <h3 className="text-3xl font-black text-slate-900">{isRtl ? 'אני מנטור / בעל עסק' : 'I am a Mentor / Business'}</h3>
            <p className="text-slate-600 font-medium text-lg leading-relaxed">
              {isRtl ? 'שתף את הניסיון שלך, חנך את דור העתיד ומצא כוח אדם נאמן שיגדל אצלך בבית.' : 'Share experience, train the next generation, and find loyal staff growing in your business.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-[0.2em] pt-4 relative z-10">
            {isRtl ? 'פרסם הצעת חניכה' : 'Post Master Offer'}
            <ArrowRight size={20} className="rtl:rotate-180 group-hover:translate-x-2 transition-transform" />
          </div>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ y: -12, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setType('mentee_seeking'); setStep(2); }}
          className="group p-12 rounded-[4rem] border-4 text-start transition-all relative overflow-hidden flex flex-col gap-10 bg-white border-emerald-500 shadow-[0_40px_80px_-20px_rgba(16,185,129,0.25)]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-700" />

          <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl group-hover:-rotate-12 transition-transform duration-500 relative z-10">
            <GraduationCap size={48} />
          </div>
          <div className="space-y-4 relative z-10">
            <h3 className="text-3xl font-black text-slate-900">{isRtl ? 'אני מחפש ללמוד' : 'I want to learn'}</h3>
            <p className="text-slate-600 font-medium text-lg leading-relaxed">
              {isRtl ? 'רוצה לצאת לשטח? מצא מנטור שילמד אותך את "רזי המקצוע" פנים אל פנים.' : 'Want to hit the field? Find a master who teaches you the trade secrets face-to-face.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-[0.2em] pt-4 relative z-10">
            {isRtl ? 'חפש מנטור מוביל' : 'Find Top Master'}
            <ArrowRight size={20} className="rtl:rotate-180 group-hover:translate-x-2 transition-transform" />
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderSubStep1 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-8 space-y-12">
        <div className="space-y-4">
          <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {isRtl ? 'בוא נתחיל מהבסיס' : 'Lets start with the basics'}
          </h3>
          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
            {isRtl ? 'כדי שה-AI שלנו יוכל לחבר אותך לאנשים הנכונים, אנחנו צריכים קצת פרטים יבשים.' : 'To help our AI connect you with the right people, we need some dry details.'}
          </p>
        </div>

        <div className="space-y-12">
          {renderField(
            isRtl ? 'תחום מקצועי' : 'Professional Field',
            Briefcase,
            <div className="space-y-4">
              <div className="relative">
                <select
                  value={profession.startsWith('אחר - ') ? 'אחר' : profession}
                  onChange={(e) => {
                    if (e.target.value === 'אחר') setProfession('אחר - ');
                    else setProfession(e.target.value);
                  }}
                  className="w-full px-8 py-5 bg-white border-2 border-slate-200 rounded-[2.5rem] focus:border-slate-900 focus:ring-8 focus:ring-slate-900/5 transition-all font-bold text-lg outline-none appearance-none shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)]"
                >
                  <option value="">{isRtl ? '-- בחר תחום --' : '-- Select Field --'}</option>
                  <option value="חשמלאות">{isRtl ? 'חשמלאות ⚡' : 'Electrical ⚡'}</option>
                  <option value="נגרות">{isRtl ? 'נגרות 🪵' : 'Carpentry 🪵'}</option>
                  <option value="ספרות">{isRtl ? 'ספרות ✂️' : 'Barbering/Hair ✂️'}</option>
                  <option value="שיפוצים">{isRtl ? 'שיפוצים 🏗️' : 'Renovations 🏗️'}</option>
                  <option value="אינסטלציה">{isRtl ? 'אינסטלציה 🔧' : 'Plumbing 🔧'}</option>
                  <option value="מיזוג אוויר">{isRtl ? 'מיזוג אוויר ❄️' : 'AC/HVAC ❄️'}</option>
                  <option value="אחר">{isRtl ? 'אחר (פרט...)' : 'Other (specify...)'}</option>
                </select>
                <ChevronDown className={`absolute ${isRtl ? 'left-8' : 'right-8'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`} size={24} />
              </div>
              {profession.startsWith('אחר - ') && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                  <input
                    type="text"
                    placeholder={isRtl ? 'איזה מקצוע?' : 'What trade?'}
                    className="w-full px-8 py-5 bg-white border-2 border-slate-900 rounded-[2.5rem] font-bold text-lg outline-none shadow-xl"
                    value={profession.replace('אחר - ', '')}
                    onChange={(e) => setProfession('אחר - ' + e.target.value)}
                  />
                </motion.div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderField(isRtl ? 'כותרת מושכת' : 'Catchy Title', Target,
              <input 
                type="text" required placeholder={getFieldContent('title')}
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-8 py-5 bg-white border-2 border-slate-200 rounded-[2.5rem] focus:border-slate-900 focus:ring-8 focus:ring-slate-900/5 transition-all font-bold outline-none shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)]"
              />
            )}
            {renderField(isRtl ? 'מיקום (עיר)' : 'Location (City)', MapPin,
              <input type="text" required placeholder={isRtl ? 'למשל: תל אביב' : 'e.g. London'} value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full px-8 py-5 bg-white border-2 border-slate-200 rounded-[2.5rem] focus:border-slate-900 focus:ring-8 focus:ring-slate-900/5 transition-all font-bold outline-none shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)]"
              />
            )}
          </div>

          {renderField(isRtl ? 'רמת אינטנסיביות' : 'Intensity Level', Zap,
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'flexible', label: 'גמיש', icon: Clock, desc: 'מדי פעם' },
                { id: 'low', label: 'חלקי', icon: Zap, desc: 'יומיים-שלושה' },
                { id: 'high', label: 'מלא', icon: ShieldCheck, desc: '5 ימים בשבוע' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setCommitmentLevel(lvl.id as any)}
                  className={`p-6 rounded-3xl border-2 transition-all text-start space-y-2 ${
                    commitmentLevel === lvl.id 
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xl scale-105' 
                      : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <lvl.icon size={24} className={commitmentLevel === lvl.id ? 'text-emerald-400' : 'text-slate-400'} />
                  <div>
                    <div className="font-black text-sm uppercase tracking-wider">{lvl.label}</div>
                    <div className={`text-[10px] font-bold ${commitmentLevel === lvl.id ? 'text-slate-400' : 'text-slate-400'}`}>{lvl.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 hidden lg:block">
        <div className="sticky top-24 p-10 bg-slate-900 rounded-[3.5rem] text-white shadow-2xl space-y-10 border border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 relative z-10"><Lightbulb size={32} /></div>
          <div className="space-y-6 relative z-10">
            <h4 className="text-xl font-black">{isRtl ? 'טיפ מה-AI' : 'AI Tip'}</h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
              {isRtl ? '"כותרת ברורה ומיקום מדויק מקפיצים את כמות הפניות ב-40%."' : '"Clear titles and accurate location boost leads by 40%."'}
            </p>
          </div>
          <div className="space-y-4 pt-6 border-t border-white/10 relative z-10">
             <div className="flex justify-between items-end">
               <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">{isRtl ? 'חוזק הפוסט' : 'Strength'}</span>
               <span className="text-2xl font-black text-emerald-400">{postStrength}%</span>
             </div>
             <div className="h-4 bg-white/10 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: `${postStrength}%` }} className={`h-full ${strengthColor}`} />
             </div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">{strengthLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubStep2 = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
          {isRtl ? 'הגענו לבשר: מה קורה בשטח?' : 'What happens on the ground?'}
        </h3>
        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
          {isRtl ? 'ספר לקהילה למה ההזדמנות הזו מושלמת בשבילם.' : 'Tell the community why this is perfect for them.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderField(isRtl ? 'מוקד הלמידה' : 'Learning Focus', Lightbulb, 
          <input 
            type="text" placeholder={getFieldContent('focus')} value={learningFocus} 
            onChange={(e) => setLearningFocus(e.target.value)} 
            className="w-full px-8 py-5 bg-white border-2 border-slate-200 rounded-[2.5rem] focus:border-slate-900 focus:ring-8 focus:ring-slate-900/5 transition-all font-bold outline-none shadow-sm" 
          />
        )}
        {renderField(isRtl ? 'משך זמן משוער' : 'Approx. Duration', Clock, 
          <input 
            type="text" placeholder={isRtl ? 'חצי שנה' : '6 months'} value={durationDescription} 
            onChange={(e) => setDurationDescription(e.target.value)} 
            className="w-full px-8 py-5 bg-white border-2 border-slate-200 rounded-[2.5rem] focus:border-slate-900 focus:ring-8 focus:ring-slate-900/5 transition-all font-bold outline-none shadow-sm" 
          />
        )}
        
        <div className="md:col-span-2">
          {type === 'mentor_offer' ? (
             renderField(isRtl ? 'על העבודה' : 'About the work', Info, 
               <textarea rows={6} value={aboutWork} onChange={(e) => setAboutWork(e.target.value)} 
                 className="w-full px-8 py-8 bg-white border-2 border-slate-200 rounded-[3rem] focus:border-slate-900 transition-all font-medium text-lg outline-none resize-none shadow-sm" 
               />
             )
          ) : (
             renderField(isRtl ? 'מה תרצה ללמוד בשטח?' : 'What do you want to learn?', GraduationCap, 
               <textarea rows={6} value={whatIWantToLearn} onChange={(e) => setWhatIWantToLearn(e.target.value)} 
                 className="w-full px-8 py-8 bg-white border-2 border-slate-200 rounded-[3rem] focus:border-slate-900 transition-all font-medium text-lg outline-none resize-none shadow-sm" 
               />
             )
          )}
        </div>
      </div>
    </div>
  );

  const renderSubStep3 = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{isRtl ? 'תמונה אחת שווה...' : 'A picture is worth...'}</h3>
      </div>
      
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="h-[450px] relative group">
          <input type="file" id="img-up" className="hidden" accept="image/*" onChange={handleImageChange} />
          <label htmlFor="img-up" className="w-full h-full bg-white border-4 border-dashed border-slate-200 rounded-[5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-900 hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="text-center space-y-8">
                <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 shadow-sm group-hover:scale-110 transition-all duration-500">
                  <ImageIcon size={64} />
                </div>
                <div className="space-y-2">
                  <span className="block font-black text-slate-900 text-xl">{isRtl ? 'העלה תמונה' : 'Upload photo'}</span>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>
    </div>
  );

  const renderSubStep4 = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h3 className="text-4xl font-black text-slate-900">{isRtl ? 'מוכן לצאת לדרך!' : 'Ready to go!'}</h3>
        <p className="text-slate-500 font-medium">{isRtl ? 'זה הזמן לעבור על הכל וללחוץ על פרסם.' : 'Time to review and click publish.'}</p>
      </div>
      <div className="max-w-2xl mx-auto p-12 space-y-8 bg-white border-2 border-slate-100 rounded-[4rem] shadow-2xl relative">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-3xl font-black overflow-hidden">
            {profile?.avatar_url ? <img src={resolveAsset(profile.avatar_url) || ''} className="w-full h-full object-cover" alt="" /> : profile?.full_name?.charAt(0)}
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900">{title || 'Opportunity'}</h4>
            <div className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
              <MapPin size={14} /> {location}
            </div>
          </div>
        </div>
        <div className="p-8 bg-slate-50 rounded-[2.5rem] text-slate-600 font-medium italic leading-relaxed">
          "{type === 'mentor_offer' ? (aboutWork?.substring(0, 200)) : (whatIWantToLearn?.substring(0, 200))}..."
        </div>
      </div>
    </div>
  );

  if (authLoading || fetching) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen font-sans">
      {step === 1 ? renderStep1() : (
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <button onClick={() => subStep === 1 ? setStep(1) : setSubStep(subStep - 1)} className="group flex items-center gap-4 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.2em]">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-all shadow-sm"><ArrowLeft size={20} className="rtl:rotate-180" /></div>
               {isRtl ? 'חזרה' : 'Back'}
            </button>
            <div className="flex items-center gap-6">
              {[1, 2, 3, 4].map(i => (
                 <div key={i} className={`flex items-center gap-2 ${subStep === i ? 'opacity-100 scale-110' : 'opacity-20'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 ${subStep === i ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100'}`}>{i}</div>
                 </div>
              ))}
            </div>
            <div className="hidden md:block w-32" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <AnimatePresence mode="wait">
              <motion.div key={subStep} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.4 }}>
                {subStep === 1 && renderSubStep1()}
                {subStep === 2 && renderSubStep2()}
                {subStep === 3 && renderSubStep3()}
                {subStep === 4 && renderSubStep4()}
              </motion.div>
            </AnimatePresence>

            {error && <div className="p-8 bg-red-50 border-2 border-red-100 rounded-[3rem] text-red-600 font-black text-sm text-center">{error}</div>}

            <div className="flex items-center justify-between pt-12 border-t border-slate-100">
               <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{subStep} / 4</div>
               <button 
                type="submit" disabled={isSubmitting}
                className="px-16 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-4 group"
               >
                 {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : (
                   <>
                    {subStep === 4 ? (isRtl ? 'פרסם עכשיו' : 'Publish Now') : (isRtl ? 'המשך למידה' : 'Continue')}
                    <ArrowRight size={20} className="rtl:rotate-180 group-hover:translate-x-2 transition-transform" />
                   </>
                 )}
               </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
