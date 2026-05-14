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

// Detects meaningless / keyboard-mashed text. Returns 0–1 quality multiplier.
function qualityScore(text: string): number {
  if (!text || text.trim().length < 2) return 0;
  const t = text.trim();
  const words = t.split(/\s+/).filter(w => w.length > 0);
  const cleaned = t.replace(/\s/g, '').toLowerCase();

  // Suspiciously low character variety → junk (e.g. "aaaaaaa", "asdasd")
  const uniqueChars = new Set(cleaned).size;
  if (cleaned.length > 4 && uniqueChars / Math.min(cleaned.length, 20) < 0.18) return 0.1;

  // Mostly non-alphabetic (Hebrew + Latin + digits)
  const hebrewLen = (t.match(/[א-ת]/g) || []).length;
  const latinLen  = (t.match(/[a-zA-Z]/g) || []).length;
  const digitLen  = (t.match(/[0-9]/g) || []).length;
  const meaningful = hebrewLen + latinLen + digitLen;
  if (meaningful < cleaned.length * 0.35) return 0.15;

  // Very short single-word input
  if (words.length === 1 && t.length < 6) return 0.4;

  // Good enough
  if (words.length >= 3 && t.length >= 12) return 1.0;
  return 0.75;
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

  // Quality scores for each text field (0–1 multiplier)
  const titleQ    = useMemo(() => qualityScore(title),            [title]);
  const workQ     = useMemo(() => qualityScore(type === 'mentor_offer' ? aboutWork : whatIWantToLearn), [type, aboutWork, whatIWantToLearn]);
  const focusQ    = useMemo(() => qualityScore(learningFocus),    [learningFocus]);
  const durQ      = useMemo(() => qualityScore(durationDescription), [durationDescription]);

  // Flag: user typed something that looks like gibberish
  const hasQualityIssue = useMemo(() =>
    [title, aboutWork, whatIWantToLearn, learningFocus].some(
      t => t.trim().length > 3 && qualityScore(t) < 0.5
    ),
  [title, aboutWork, whatIWantToLearn, learningFocus]);

  // Calculate Post Strength — text fields only earn points proportional to their quality
  const postStrength = useMemo(() => {
    let score = 0;
    if (title.length > 5)        score += 20 * titleQ;
    if (location.length > 2)     score += 10; // city name — no quality check needed
    if (commitmentLevel)         score += 5;  // always selected
    if (profession)              score += 10;
    if (type === 'mentor_offer') {
      if (learningFocus.length > 2)  score += 20 * focusQ;
      if (aboutWork.length > 20)     score += 20 * workQ;
    } else {
      if (whatIWantToLearn.length > 20) score += 30 * workQ;
    }
    if (durationDescription.length > 2) score += 5 * durQ;
    if (imageFile || imagePreview)       score += 10;
    return Math.min(100, Math.round(score));
  }, [title, titleQ, location, aboutWork, workQ, profession, learningFocus, focusQ,
      whatIWantToLearn, durationDescription, durQ, imageFile, imagePreview, type, commitmentLevel]);

  const strengthLabel = useMemo(() => {
    if (hasQualityIssue) return isRtl ? 'תוכן לא ברור — נסח מחדש' : 'Content unclear — rephrase';
    if (postStrength < 25) return isRtl ? 'התחל למלא...' : 'Start filling in...';
    if (postStrength < 50) return isRtl ? 'ממשיך, טוב' : 'Keep going';
    if (postStrength < 75) return isRtl ? 'נראה טוב' : 'Looking solid';
    if (postStrength < 95) return isRtl ? 'פרסום חזק' : 'Strong listing';
    return isRtl ? 'מוכן לפרסום' : 'Ready to publish';
  }, [postStrength, hasQualityIssue, isRtl]);

  const strengthColor = useMemo(() => {
    if (hasQualityIssue)  return 'bg-amber-400';
    if (postStrength < 25) return 'bg-slate-300';
    if (postStrength < 50) return 'bg-sky-400';
    if (postStrength < 75) return 'bg-blue-500';
    if (postStrength < 95) return 'bg-blue-600';
    return 'bg-emerald-500';
  }, [postStrength, hasQualityIssue]);

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
        if (data.owner_id !== user.id) { navigate('/app/my-opportunities'); return; }
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
        work_hours: workHours || null,
        pay_amount: payAmount ? parseFloat(payAmount) : null,
        pay_period: payAmount ? payPeriod : null,
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
        navigate(`/app/opportunities/${id}`);
      } else {
        const { data: newOpp, error: insertErr } = await supabase
          .from('opportunities')
          .insert({ ...payload, owner_id: user!.id, status: 'active' })
          .select('id')
          .single();
        if (insertErr) throw insertErr;
        navigate(`/app/opportunities/${newOpp.id}`);
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
        <div className="absolute inset-0 bg-slate-900/5 rounded-xl -m-1 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        {children}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
          <Sparkles size={12} className="text-emerald-400" />
          {isRtl ? 'פלטפורמת החניכות המקצועית' : 'Professional Apprenticeship Platform'}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {isRtl ? 'כאן תתחיל ההזדמנות.' : 'This is where it starts.'}
        </h1>
        <p className="text-base sm:text-lg text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
          {isRtl ? 'בחר את הצד שלך — ופרסם בפחות מ-3 דקות.' : 'Choose your role — and go live in under 3 minutes.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <motion.button
          type="button"
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setType('mentor_offer'); setStep(2); }}
          className="group p-8 rounded-2xl border-2 text-start transition-all relative flex flex-col gap-7 bg-white border-slate-200 hover:border-slate-900 shadow-sm hover:shadow-lg"
        >
          <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Presentation size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900">{isRtl ? 'אני מנטור — אני מכשיר' : 'I\'m a Mentor — I Train'}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {isRtl
                ? 'בעל ניסיון שרוצה להעביר ידע לדור הבא. שכיר, עצמאי, או בעל עסק.'
                : 'An experienced professional ready to pass knowledge forward. Employed, freelance, or business owner.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            {isRtl ? 'פרסם הצעה' : 'Post a listing'}
            <ArrowRight size={16} className="rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setType('mentee_seeking'); setStep(2); }}
          className="group p-8 rounded-2xl border-2 text-start transition-all relative flex flex-col gap-7 bg-white border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-lg"
        >
          <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <GraduationCap size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900">{isRtl ? 'אני חניך — אני לומד' : 'I\'m an Apprentice — I Learn'}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {isRtl
                ? 'מחפש מנטור שיקח אותי לעבוד בשטח וילמד אותי את המקצוע מהבסיס.'
                : 'Looking for a mentor who takes apprentices on the job and teaches the trade hands-on.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            {isRtl ? 'חפש מנטור' : 'Find a mentor'}
            <ArrowRight size={16} className="rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderSubStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {isRtl ? 'פרטים בסיסיים' : 'The basics'}
          </h3>
          <p className="text-base text-slate-500 leading-relaxed max-w-2xl">
            {isRtl ? 'מלא את השדות האלה — הם קובעים מי יראה את המודעה שלך.' : 'Fill these in — they determine who sees your listing.'}
          </p>
        </div>

        <div className="space-y-8">
          {renderField(
            isRtl ? 'תחום מקצועי' : 'Professional Field',
            Briefcase,
            <div className="space-y-3">
              <div className="relative">
                <select
                  value={profession.startsWith('אחר - ') ? 'אחר' : profession}
                  onChange={(e) => {
                    if (e.target.value === 'אחר') setProfession('אחר - ');
                    else setProfession(e.target.value);
                  }}
                  className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-semibold outline-none appearance-none"
                >
                  <option value="">{isRtl ? '-- בחר תחום --' : '-- Select Field --'}</option>
                  <option value="חשמלאות">{isRtl ? 'חשמלאות' : 'Electrical'}</option>
                  <option value="נגרות">{isRtl ? 'נגרות' : 'Carpentry'}</option>
                  <option value="ספרות">{isRtl ? 'ספרות / שיער' : 'Barbering / Hair'}</option>
                  <option value="שיפוצים">{isRtl ? 'שיפוצים ובנייה' : 'Renovations'}</option>
                  <option value="אינסטלציה">{isRtl ? 'אינסטלציה' : 'Plumbing'}</option>
                  <option value="מיזוג אוויר">{isRtl ? 'מיזוג אוויר' : 'AC / HVAC'}</option>
                  <option value="ריתוך">{isRtl ? 'ריתוך ומתכת' : 'Welding / Metal'}</option>
                  <option value="מכונאות">{isRtl ? 'מכונאות רכב' : 'Auto Mechanics'}</option>
                  <option value="אחר">{isRtl ? 'אחר — ציין בעצמך' : 'Other — specify'}</option>
                </select>
                <ChevronDown className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`} size={18} />
              </div>
              {profession.startsWith('אחר - ') && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                  <input
                    type="text"
                    placeholder={isRtl ? 'איזה מקצוע?' : 'What trade?'}
                    className="w-full px-5 py-3.5 bg-white border-2 border-slate-900 rounded-xl font-semibold outline-none"
                    value={profession.replace('אחר - ', '')}
                    onChange={(e) => setProfession('אחר - ' + e.target.value)}
                  />
                </motion.div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField(isRtl ? 'כותרת' : 'Title', Target,
              <input
                type="text" required placeholder={getFieldContent('title')}
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-semibold outline-none"
              />
            )}
            {renderField(isRtl ? 'מיקום (עיר)' : 'Location (City)', MapPin,
              <input type="text" required placeholder={isRtl ? 'למשל: תל אביב' : 'e.g. Tel Aviv'} value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-semibold outline-none"
              />
            )}
          </div>

          {renderField(isRtl ? 'היקף המחויבות' : 'Commitment Level', Zap,
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'flexible', labelHe: 'גמיש', labelEn: 'Flexible', icon: Clock, descHe: 'מדי פעם', descEn: 'Occasional' },
                { id: 'low',      labelHe: 'חלקי',  labelEn: 'Part-time', icon: Zap,   descHe: '2–3 ימים',  descEn: '2–3 days/wk' },
                { id: 'high',     labelHe: 'מלא',   labelEn: 'Full-time', icon: Briefcase, descHe: '5 ימים', descEn: '5 days/wk' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setCommitmentLevel(lvl.id as any)}
                  className={`p-4 rounded-xl border-2 transition-all text-start space-y-1.5 ${
                    commitmentLevel === lvl.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <lvl.icon size={18} className={commitmentLevel === lvl.id ? 'text-emerald-400' : 'text-slate-400'} />
                  <div>
                    <div className="font-bold text-xs">{isRtl ? lvl.labelHe : lvl.labelEn}</div>
                    <div className="text-[10px] opacity-60">{isRtl ? lvl.descHe : lvl.descEn}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSubStep2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
          {isRtl ? 'תאר את ההזדמנות' : 'Describe the opportunity'}
        </h3>
        <p className="text-base text-slate-500 leading-relaxed max-w-2xl">
          {isRtl
            ? 'ספר לחניך פוטנציאלי מה הוא ילמד, איפה, ואיתמי.'
            : "Tell a potential apprentice what they'll learn, where, and with whom."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderField(isRtl ? 'מוקד הלמידה' : 'Learning Focus', Lightbulb,
          <input
            type="text" placeholder={getFieldContent('focus')} value={learningFocus}
            onChange={(e) => setLearningFocus(e.target.value)}
            className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-semibold outline-none"
          />
        )}
        {renderField(isRtl ? 'משך זמן משוער' : 'Duration', Clock,
          <input
            type="text" placeholder={isRtl ? 'למשל: 6 חודשים' : 'e.g. 6 months'} value={durationDescription}
            onChange={(e) => setDurationDescription(e.target.value)}
            className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-semibold outline-none"
          />
        )}

        <div className="md:col-span-2">
          {type === 'mentor_offer' ? (
            renderField(isRtl ? 'על העבודה בפועל' : 'About the actual work', Info,
              <textarea
                rows={6} value={aboutWork} onChange={(e) => setAboutWork(e.target.value)}
                placeholder={isRtl ? 'למשל: עובדים בעיקר על שיפוץ דירות באזור. תלמד הכל — מהזחלות עד הגמר.' : "e.g. Mainly apartment renovations in the area. You'll learn everything — rough to finish."}
                className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:border-slate-900 transition-all font-medium outline-none resize-none"
              />
            )
          ) : (
            renderField(isRtl ? 'מה תרצה ללמוד?' : 'What do you want to learn?', GraduationCap,
              <textarea
                rows={6} value={whatIWantToLearn} onChange={(e) => setWhatIWantToLearn(e.target.value)}
                placeholder={isRtl ? 'למשל: מחפש ללמוד עבודת חשמל מעשית עם מישהו שעובד בשטח, לא בבית ספר.' : 'e.g. Looking to learn practical electrical work from someone in the field, not a classroom.'}
                className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:border-slate-900 transition-all font-medium outline-none resize-none"
              />
            )
          )}
        </div>
      </div>
    </div>
  );

  const renderSubStep3 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
          {isRtl ? 'הוסף תמונה' : 'Add a photo'}
        </h3>
        <p className="text-base text-slate-500 leading-relaxed">
          {isRtl
            ? 'תמונה מהשטח — מהסדנה או מהפרויקט — מגדילה פניות ב-40%.'
            : 'A real photo from your workshop or job site increases responses by 40%.'}
        </p>
      </div>

      <div className="max-w-2xl w-full">
        <div className="h-72 relative group">
          <input type="file" id="img-up" className="hidden" accept="image/*" onChange={handleImageChange} />
          <label htmlFor="img-up" className="w-full h-full bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 overflow-hidden">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 mx-auto">
                  <ImageIcon size={32} />
                </div>
                <div>
                  <span className="block font-bold text-slate-700">{isRtl ? 'לחץ להעלאת תמונה' : 'Click to upload'}</span>
                  <span className="block text-xs text-slate-400 mt-1">{isRtl ? 'PNG, JPG עד 10MB' : 'PNG, JPG up to 10MB'}</span>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>
    </div>
  );

  const renderSubStep4 = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-slate-900">{isRtl ? 'בדוק לפני פרסום' : 'Review before publishing'}</h3>
        <p className="text-base text-slate-500">{isRtl ? 'ברגע שתפרסם, המודעה תופיע לכל המשתמשים בפלטפורמה.' : 'Once published, this listing goes live to all users on the platform.'}</p>
      </div>
      <div className="max-w-2xl p-7 space-y-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl font-black overflow-hidden shrink-0">
            {profile?.avatar_url ? <img src={resolveAsset(profile.avatar_url) || ''} className="w-full h-full object-cover" alt="" /> : profile?.full_name?.charAt(0)}
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900">{title || (isRtl ? 'ללא כותרת' : 'No title')}</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <MapPin size={11} /> {location || '—'}
            </div>
          </div>
        </div>
        {(aboutWork || whatIWantToLearn) && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-4 bg-slate-50 rounded-xl px-4 py-3">
            {type === 'mentor_offer' ? aboutWork : whatIWantToLearn}
          </p>
        )}
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
                 <div key={i} className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border-2 transition-all ${subStep === i ? 'bg-slate-900 text-white border-slate-900 shadow-md' : subStep > i ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-white text-slate-300 border-slate-200'}`}>{i}</div>
                 </div>
              ))}
            </div>
            <div className="hidden md:block w-32" />
          </div>

          {/* ── Persistent strength card ── */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 flex items-center gap-4">
            <Lightbulb size={18} className="text-slate-400 shrink-0" />
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  {isRtl ? 'חוזק הפוסט' : 'Post Strength'}
                </span>
                <span className={`text-[11px] font-semibold truncate ${hasQualityIssue ? 'text-amber-600' : 'text-slate-500'}`}>
                  {strengthLabel}
                </span>
                <span className="text-sm font-black text-slate-700 shrink-0">{postStrength}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${postStrength}%` }}
                  transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                  className={`h-full rounded-full transition-colors duration-500 ${strengthColor}`}
                />
              </div>
            </div>
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
                    {subStep === 4 ? (isRtl ? 'פרסם עכשיו' : 'Publish Now') : (isRtl ? 'המשך' : 'Continue')}
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
