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
  Search,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface OpportunityNewProps {
  isRtl: boolean;
  isEditing?: boolean;
}

export default function OpportunityNew({ isRtl, isEditing = false }: OpportunityNewProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, profile, sqliteId, loading: authLoading } = useAuth();
  
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

  useEffect(() => {
    if (profile && !isEditing && step === 1) {
      setType(profile.role === 'mentor' ? 'mentor_offer' : 'mentee_seeking');
      setLocation(profile.location || '');
      setProfession(profile.occupation || '');
    }
  }, [profile, isEditing, step]);

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!isEditing || !id || !sqliteId) return;
      try {
        const response = await api.get(`/opportunities/${id}`);
        const data = response.data;
        if (data.ownerId !== sqliteId) { navigate('/app/opportunities'); return; }
        setType(data.type);
        setTitle(data.title);
        setLocation(data.location);
        setWorkHours(data.workHours || '');
        setPayAmount(data.payAmount?.toString() || '');
        setPayPeriod(data.payPeriod || 'hour');
        setAboutWork(data.aboutWork || '');
        setRequirements(data.requirements || '');
        setMenteeWillLearn(data.menteeWillLearn || '');
        setWhoIWantToTeach(data.whoIWantToTeach || '');
        setAvailabilityDays(data.availability_days || []);
        setDesiredSalary(data.desiredSalary?.toString() || '');
        setWhatIWantToLearn(data.whatIWantToLearn || '');
        setExperienceNote(data.experienceNote || '');
        setImagePreview(data.imageUrl);
        setProfession(data.profession || profile?.occupation || '');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };
    fetchOpportunity();
  }, [isEditing, id, user, navigate, sqliteId, profile]);

  const getFieldContent = (fieldName: string) => {
    const isMentor = type === 'mentor_offer';
    const prof = profession.toLowerCase();

    const getContent = () => {
      if (prof.includes('ספר') || prof.includes('שיער') || prof.includes('barber')) {
        return {
          title: isMentor ? 'דרושה חניכה לעיצוב שיער בסטודיו מוביל בתל אביב' : 'מחפש להתמחות אצל ספר צמרת - מעוניין ללמוד דירוגים',
          focus: isMentor ? 'טכניקות צבע, תסרוקות כלה וניהול לקוחות' : 'שימוש נכון בתער, דירוגי עור ותספורות גברים',
        };
      }
      if (prof.includes('חשמל') || prof.includes('electric')) {
        return {
          title: isMentor ? 'הזדמנות להתלמד אצל חשמלאי מוסמך - עבודות תשתיות' : 'תלמיד חשמל מחפש ניסיון מעשי בשטח',
          focus: isMentor ? 'קריאת תכניות, חיווט לוחות ותיקון תקלות ביתיות' : 'עבודה עם לוחות תלת-פאזיים ותשתיות בנייה',
        };
      }
      return {
        title: isMentor ? (isRtl ? 'דרוש חניך רציני ללמידת מקצוע מהשטח' : 'Apprentice wanted for field training') : (isRtl ? 'מחפש מנטור מקצועי ללמוד ממנו את העבודה בשטח' : 'Seeking master to learn on-the-job'),
        focus: isMentor ? (isRtl ? 'הקניית יסודות המקצוע' : 'Professional basics') : (isRtl ? 'רכישת מיומנויות פרקטיות' : 'Practical skill acquisition'),
      };
    };

    const strings = getContent();
    return strings[fieldName as keyof typeof strings] || '';
  };

  const renderHelperText = (text: string) => (
    <p className="mt-2 text-[10px] font-bold text-slate-400 px-1">{text}</p>
  );

  const toggleDay = (day: string) => {
    setAvailabilityDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
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
      if (subStep === 1 && (!title || !location)) { setError(isRtl ? 'חובה למלא כותרת ומיקום' : 'Title and location required'); return; }
      setError(null);
      setSubStep(subStep + 1);
      return;
    }

    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      const opportunityData = {
        type, 
        opportunity_type: opportunityType, 
        commitment_level: commitmentLevel,
        learning_focus: learningFocus, 
        duration_description: durationDescription,
        title, 
        location, 
        workHours,
        payAmount: payAmount ? parseFloat(payAmount) : null,
        payPeriod: payAmount ? payPeriod : null,
        aboutWork, requirements, whoIWantToTeach, menteeWillLearn,
        availabilityDays, 
        desiredSalary: desiredSalary ? parseFloat(desiredSalary) : null,
        whatIWantToLearn, 
        experienceNote,
        imageUrl
      };

      if (isEditing && id) {
        await api.put(`/opportunities/${id}`, opportunityData);
        navigate(`/app/opportunities/${id}`);
      } else {
        const response = await api.post('/opportunities', opportunityData);
        navigate(`/app/opportunities/${response.data.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const renderStep1 = () => (
    <div className="space-y-12 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/5 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-900/5">
          <Sparkles size={14} />
          {isRtl ? 'בניית דור המקצוענים הבא' : 'Building the next pro generation'}
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">{isRtl ? 'מה תרצה לפרסם?' : 'What would you like to post?'}</h1>
        <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto italic">
          {isRtl ? 'בחר את המסלול שלך להשפעה ולמידה' : 'Choose your path for impact and learning'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <motion.button
          whileHover={{ y: -12, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setType('mentor_offer'); setStep(2); }}
          className={`group p-12 rounded-[4rem] border-4 text-start transition-all relative overflow-hidden flex flex-col gap-10 bg-white border-slate-900 shadow-[0_30px_70px_-15px_rgba(15,23,42,0.2)]`}
        >
          <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500">
            <Presentation size={48} />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-slate-900">{isRtl ? 'אני מנטור' : 'I am a Mentor'}</h3>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              {isRtl ? 'הפוך למוקד ידע בקהילה. שתף את הניסיון שלך, חנך את דור העתיד ומצא כוח אדם נאמן.' : 'Be a knowledge hub. Share experience, train next-gen, and find loyal staff.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-[0.2em] pt-4">
            {isRtl ? 'פרסם הצעת חניכה' : 'Post Master Offer'}
            <ArrowRight size={20} className="rtl:rotate-180 group-hover:translate-x-2 transition-transform" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ y: -12, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setType('mentee_seeking'); setStep(2); }}
          className={`group p-12 rounded-[4rem] border-4 text-start transition-all relative overflow-hidden flex flex-col gap-10 bg-white border-emerald-600 shadow-[0_30px_70px_-15px_rgba(16,185,129,0.2)]`}
        >
          <div className="w-24 h-24 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl group-hover:-rotate-12 transition-transform duration-500">
            <GraduationCap size={48} />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-slate-900">{isRtl ? 'אני מתלמד' : 'I am an Apprentice'}</h3>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              {isRtl ? 'רוצה לצאת לשטח? מצא מנטור שילמד אותך את "רזי המקצוע" פנים אל פנים.' : 'Want to hit the field? Find a master who teaches you the trade secrets face-to-face.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-[0.2em] pt-4">
            {isRtl ? 'חפש מנטור מוביל' : 'Find Top Master'}
            <ArrowRight size={20} className="rtl:rotate-180 group-hover:translate-x-2 transition-transform" />
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderSubStep1 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-8 space-y-10">
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{isRtl ? 'סוג ההזדמנות והתחייבות' : 'Opportunity Type & Commitment'}</h3>
          <p className="text-slate-500 font-medium">{isRtl ? 'בחר את אופי הלמידה ורמת ההתחייבות.' : 'Choose the nature of learning and commitment level.'}</p>
        </div>

        <div className="grid grid-cols-1 gap-10">
          {renderField(
            isRtl ? 'תחום מקצועי' : 'Professional Field',
            Search,
            <div className="space-y-4">
              <div className="relative group">
                <select
                  value={profession.startsWith('אחר - ') ? 'אחר' : profession}
                  onChange={(e) => {
                    if (e.target.value === 'אחר') setProfession('אחר - ');
                    else setProfession(e.target.value);
                  }}
                  className="w-full px-8 py-5 bg-slate-50 border-4 border-transparent rounded-[2.5rem] focus:bg-white focus:border-slate-900 transition-all font-black text-lg outline-none appearance-none shadow-sm"
                >
                  <option value="">{isRtl ? '-- בחר תחום --' : '-- Select Field --'}</option>
                  <option value="חשמלאות">{isRtl ? 'חשמלאות' : 'Electrical'}</option>
                  <option value="נגרות">{isRtl ? 'נגרות' : 'Carpentry'}</option>
                  <option value="ספרות">{isRtl ? 'ספרות' : 'Barbering/Hair'}</option>
                  <option value="שיפוצים">{isRtl ? 'שיפוצים' : 'Renovations'}</option>
                  <option value="אינסטלציה">{isRtl ? 'אינסטלציה' : 'Plumbing'}</option>
                  <option value="מיזוג אוויר">{isRtl ? 'מיזוג אוויר' : 'AC/HVAC'}</option>
                  <option value="אחר">{isRtl ? 'אחר (פרט...)' : 'Other (specify...)'}</option>
                </select>
                <ChevronDown className={`absolute ${isRtl ? 'left-8' : 'right-8'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`} size={24} />
              </div>
              {profession.startsWith('אחר - ') && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                  <input
                    type="text"
                    placeholder={isRtl ? 'איזה מקצוע? (למשל: מסגרות, זגגות...)' : 'What trade? (e.g. Blacksmith, Glazier...)'}
                    className="w-full px-8 py-5 bg-white border-4 border-slate-900 rounded-[2.5rem] font-black text-lg outline-none shadow-xl"
                    value={profession.replace('אחר - ', '')}
                    onChange={(e) => setProfession('אחר - ' + e.target.value)}
                  />
                </motion.div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {renderField(isRtl ? 'כותרת' : 'Title', null,
              <input 
                type="text" required placeholder={getFieldContent('title')}
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-8 py-5 bg-slate-50 border-4 border-transparent rounded-[2.5rem] focus:bg-white focus:border-slate-900 transition-all font-black outline-none"
              />
            )}
            {renderField(isRtl ? 'מיקום' : 'Location', MapPin,
              <input type="text" required placeholder={isRtl ? 'עיר' : 'City'} value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full px-8 py-5 bg-slate-50 border-4 border-transparent rounded-[2.5rem] focus:bg-white focus:border-slate-900 transition-all font-black outline-none"
              />
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 hidden lg:block">
        <div className="sticky top-24 p-10 bg-slate-900 rounded-[3.5rem] text-white shadow-2xl space-y-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400"><Lightbulb size={32} /></div>
          <div className="space-y-6">
            <h4 className="text-xl font-black">{isRtl ? 'טיפ מקצועי' : 'Pro Tip'}</h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              {isRtl ? 'כותרת ברורה ומיקום מדויק מקפיצים את כמות הפניות ב-40%.' : 'Clear titles and accurate location boost leads by 40%.'}
            </p>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-end"><span className="text-[10px] uppercase font-black text-slate-500">{isRtl ? 'חוזק הפוסט' : 'Strength'}</span><span className="text-xl font-black text-emerald-400">{postStrength}%</span></div>
             <div className="h-4 bg-white/10 rounded-full overflow-hidden"><motion.div animate={{ width: `${postStrength}%` }} className={`h-full ${strengthColor}`} /></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubStep2 = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{isRtl ? 'תוכן ודרישות' : 'Content & Requirements'}</h3>
        <p className="text-slate-500 font-medium">{isRtl ? 'ספר לקהילה למה ההזדמנות הזו מושלמת בשבילם.' : 'Tell the community why this is perfect for them.'}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {renderField(isRtl ? 'מוקד הלמידה' : 'Learning Focus', Lightbulb, 
          <input type="text" placeholder={getFieldContent('focus')} value={learningFocus} onChange={(e) => setLearningFocus(e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-4 border-transparent rounded-[2.5rem] focus:bg-white focus:border-slate-900 transition-all font-black outline-none" />
        )}
        {renderField(isRtl ? 'משך זמן' : 'Duration', Clock, 
          <input type="text" placeholder={isRtl ? 'למשל: חצי שנה' : 'e.g. 6 months'} value={durationDescription} onChange={(e) => setDurationDescription(e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-4 border-transparent rounded-[2.5rem] focus:bg-white focus:border-slate-900 transition-all font-black outline-none" />
        )}
        <div className="md:col-span-2">
          {type === 'mentor_offer' ? (
             renderField(isRtl ? 'על העבודה' : 'About work', Info, <textarea rows={5} value={aboutWork} onChange={(e) => setAboutWork(e.target.value)} className="w-full px-8 py-6 bg-slate-50 border-4 border-transparent rounded-[3rem] focus:bg-white focus:border-slate-900 transition-all font-medium outline-none resize-none" />)
          ) : (
             renderField(isRtl ? 'מה אני רוצה ללמוד' : 'What I want to learn', GraduationCap, <textarea rows={5} value={whatIWantToLearn} onChange={(e) => setWhatIWantToLearn(e.target.value)} className="w-full px-8 py-6 bg-slate-50 border-4 border-transparent rounded-[3rem] focus:bg-white focus:border-slate-900 transition-all font-medium outline-none resize-none" />)
          )}
        </div>
      </div>
    </div>
  );

  const renderSubStep3 = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{isRtl ? 'מדיה וסיום' : 'Media & Finish'}</h3>
        <p className="text-slate-500 font-medium">{isRtl ? 'הוסף תמונה כדי למשוך את העין.' : 'Add a photo to catch the eye.'}</p>
      </div>
      <div className="max-w-3xl mx-auto w-full h-[400px]">
        <input type="file" id="img-up" className="hidden" accept="image/*" onChange={handleImageChange} />
        <label htmlFor="img-up" className="w-full h-full bg-slate-50 border-4 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-slate-900 transition-all overflow-hidden group">
          {imagePreview ? (
            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-xl group-hover:scale-110 transition-transform"><ImageIcon size={48} /></div>
              <span className="block font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'לחץ להעלאת תמונה' : 'Click to Upload Image'}</span>
            </div>
          )}
        </label>
      </div>
    </div>
  );

  const renderSubStep4 = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h3 className="text-4xl font-black text-slate-900">{isRtl ? 'מוכן לצאת לדרך!' : 'Ready to go!'}</h3>
        <p className="text-slate-500 font-medium">{isRtl ? 'זה הזמן לעבור על הכל וללחוץ על פרסם.' : 'Time to review and click publish.'}</p>
      </div>
      <div className="max-w-2xl mx-auto industrial-card p-12 space-y-8 bg-white shadow-2xl relative">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-3xl font-black">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover rounded-2xl" alt="" /> : profile?.full_name?.charAt(0)}
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900">{title || (isRtl ? 'כותרת לדוגמה' : 'Sample Title')}</h4>
            <div className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
              <MapPin size={14} /> {location || (isRtl ? 'מיקום' : 'Location')}
            </div>
          </div>
        </div>
        <div className="p-8 bg-slate-50 rounded-[2.5rem] text-slate-600 font-medium italic leading-relaxed">
          "{type === 'mentor_offer' ? (aboutWork?.substring(0, 200) || (isRtl ? 'כאן יופיע תיאור העבודה...' : 'Work description here...')) : (whatIWantToLearn?.substring(0, 200) || (isRtl ? 'כאן יופע מה שאתה רוצה ללמוד...' : 'What you want to learn...'))}..."
        </div>
        {imagePreview && (
          <div className="w-full h-64 rounded-[3rem] overflow-hidden border-8 border-white shadow-xl">
            <img src={imagePreview} className="w-full h-full object-cover" alt="" />
          </div>
        )}
      </div>
    </div>
  );

  if (authLoading || fetching) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
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

            {error && <div className="p-8 bg-red-50 border-4 border-red-100 rounded-[3rem] text-red-600 font-black text-sm text-center animate-shake">{error}</div>}

            <div className="flex items-center justify-between pt-12 border-t border-slate-100">
               <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{subStep} / 4</div>
               <button 
                type="submit" disabled={isSubmitting}
                className="px-16 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_50px_rgba(15,23,42,0.3)] hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-4 group"
               >
                 {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : (
                   <>
                    {subStep === 4 ? (isRtl ? 'פרסם עכשיו' : 'Publish Now') : (isRtl ? 'המשך לשלב הבא' : 'Continue')}
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
