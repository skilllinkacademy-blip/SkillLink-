import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Presentation, GraduationCap, MapPin, Clock, DollarSign, Image as ImageIcon, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OpportunityNewProps {
  isRtl: boolean;
}

export default function OpportunityNew({ isRtl }: OpportunityNewProps) {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
  const [trainingIncludes, setTrainingIncludes] = useState('');
  const [menteeWillLearn, setMenteeWillLearn] = useState('');
  const [whoIWantToTeach, setWhoIWantToTeach] = useState('');
  const [availabilityDays, setAvailabilityDays] = useState<string[]>([]);

  const daysOfWeek = isRtl 
    ? ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'] 
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: string) => {
    setAvailabilityDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };
  const [desiredSalary, setDesiredSalary] = useState('');
  const [whatIWantToLearn, setWhatIWantToLearn] = useState('');
  const [experienceNote, setExperienceNote] = useState('');

  // Sync type with profile role once loaded
  useEffect(() => {
    if (profile) {
      const defaultType = profile.role === 'mentor' ? 'mentor_offer' : 'mentee_seeking';
      setType(defaultType);
      setLocation(profile.city || profile.location || '');
    }
  }, [profile]);

  const isApprentice = profile?.role === 'mentee';
  const isVerifiedMentor = profile?.role === 'mentor' && profile?.is_verified === true;

  if (authLoading || (user && !profile)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full" />
          <p className="text-gray-500 font-medium">
            {isRtl ? 'טוען...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isApprentice && !isVerifiedMentor) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900">
            {isRtl
              ? 'רק מנטורים מאומתים יכולים לפרסם הצעות'
              : 'Only verified mentors can post offers'}
          </h1>
          <p className="text-gray-500 font-medium max-w-md mx-auto">
            {isRtl
              ? 'השלם תהליך אימות מנטור והמתן לאישור מנהל המערכת כדי לקבל גישה לפרסום הצעות מנטור.'
              : 'Complete the mentor verification process and wait for admin approval to gain access to post mentor offers.'}
          </p>
        </div>
        <button 
          onClick={() => navigate(profile?.role === 'mentor' ? '/app/verify' : '/app/opportunities')}
          className="px-8 py-3 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-gray-800 transition-all active:scale-95"
        >
          {profile?.role === 'mentor' 
            ? (isRtl ? 'עבור לדף אימות' : 'Go to Verification')
            : (isRtl ? 'חזרה להזדמנויות' : 'Back to Opportunities')}
        </button>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let imageUrl = null;

      // 1. Upload Image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('opportunities_images')
          .upload(filePath, imageFile);

        if (uploadError) {
          if (uploadError.message.includes('Bucket not found')) {
            throw new Error('Storage bucket "opportunities_images" not found. Please run the SQL script in Supabase to create the required buckets.');
          }
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('opportunities_images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      // 2. Create Opportunity
      const { data, error: insertError } = await supabase
        .from('opportunities')
        .insert({
          owner_id: user.id,
          type,
          title,
          location,
          work_hours: workHours,
          beginners_only: type === 'mentor_offer' ? true : false,
          pay_amount: payAmount ? (parseFloat(payAmount) || 0) : null,
          pay_period: payAmount ? payPeriod : null,
          about_work: type === 'mentor_offer' ? aboutWork : null,
          requirements: type === 'mentor_offer' ? requirements : null,
          who_i_want_to_teach: type === 'mentor_offer' ? whoIWantToTeach : null,
          training_includes: type === 'mentor_offer' ? trainingIncludes : null,
          mentee_will_learn: type === 'mentor_offer' ? menteeWillLearn : null,
          availability_days: type === 'mentee_seeking' ? availabilityDays : null,
          desired_salary: type === 'mentee_seeking' ? (parseFloat(desiredSalary) || 0) : null,
          what_i_want_to_learn: type === 'mentee_seeking' ? whatIWantToLearn : null,
          experience_note: type === 'mentee_seeking' ? experienceNote : null,
          image_url: imageUrl
        })
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/app/opportunities/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-gray-900">{isRtl ? 'מה תרצה לפרסם?' : 'What would you like to post?'}</h2>
        <p className="text-gray-500 font-medium">{isRtl ? 'בחר את סוג ההזדמנות המתאים לתפקידך' : 'Choose the opportunity type that fits your role'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <button
            type="button"
            onClick={() => { 
              if (profile?.role !== 'mentor') {
                alert(isRtl ? 'רק מנטורים יכולים לפרסם הצעת התלמדות.' : 'Only mentors can post an apprentice offer.');
                return;
              }
              if (profile.verification_status === 'approved') {
                setType('mentor_offer'); 
                setStep(2); 
              } else {
                navigate('/app/verify');
              }
            }}
            className={`w-full group p-8 rounded-[2.5rem] border-2 text-start transition-all relative overflow-hidden cursor-pointer ${
              profile?.role === 'mentor' 
                ? 'border-blue-600 bg-blue-50/50 hover:shadow-xl' 
                : 'border-gray-100 bg-gray-50 opacity-50 hover:opacity-75'
            }`}
          >
            <div className="relative z-10 space-y-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                profile?.role === 'mentor' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                <Presentation size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{isRtl ? 'הצעת מנטור' : 'Mentor Offer'}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  {isRtl ? 'פרסם הזדמנות למתלמד לבוא ללמוד ולעבוד אצלך.' : 'Post an opportunity for an apprentice to learn and work with you.'}
                </p>
              </div>
            </div>
            {profile?.role === 'mentor' && profile.verification_status !== 'approved' && (
              <div className="absolute top-4 right-4 text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                <ShieldCheck size={14} />
                {isRtl ? 'נדרש אימות' : 'Verify Required'}
              </div>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => { 
            if (profile?.role !== 'mentee') {
              alert(isRtl ? 'רק מתלמדים יכולים לפרסם בקשת התלמדות.' : 'Only apprentices can post a seeking request.');
              return;
            }
            setType('mentee_seeking'); 
            setStep(2); 
          }}
          className={`group p-8 rounded-[2.5rem] border-2 text-start transition-all relative overflow-hidden cursor-pointer ${
            profile?.role === 'mentee' 
              ? 'border-emerald-600 bg-emerald-50/50 hover:shadow-xl' 
              : 'border-gray-100 bg-gray-50 opacity-50 hover:opacity-75'
          }`}
        >
          <div className="relative z-10 space-y-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
              profile?.role === 'mentee' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              <GraduationCap size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">{isRtl ? 'מתלמד מחפש' : 'Apprentice Seeking'}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {isRtl ? 'פרסם את עצמך, היכולות שלך ומה אתה רוצה ללמוד.' : 'Post about yourself, your skills, and what you want to learn.'}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
          <ArrowLeft size={18} className="rtl:rotate-180" />
          {isRtl ? 'חזרה' : 'Back'}
        </button>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
          type === 'mentor_offer' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {isRtl ? (type === 'mentor_offer' ? 'הצעת מנטור' : 'מתלמד מחפש') : (type === 'mentor_offer' ? 'Mentor Offer' : 'Apprentice Seeking')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Basics */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'כותרת ההזדמנות' : 'Opportunity Title'}</label>
            <input 
              type="text" 
              required
              placeholder={isRtl ? 'למשל: דרוש חניך לחשמלאות בניין' : 'e.g. Apprentice needed for electrical work'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'מיקום' : 'Location'}</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder={isRtl ? 'עיר' : 'City'}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'שעות עבודה' : 'Work Hours'}</label>
              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder={isRtl ? 'למשל: 08:00-16:00' : 'e.g. 08:00-16:00'}
                  value={workHours}
                  onChange={(e) => setWorkHours(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
              {type === 'mentor_offer' ? (isRtl ? 'תשלום למתלמד' : 'Pay to Apprentice') : (isRtl ? 'שכר מבוקש' : 'Desired Salary')}
            </label>
            <div className="flex gap-2">
              <div className="relative group flex-1">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                <input 
                  type="number" 
                  placeholder="0"
                  value={type === 'mentor_offer' ? payAmount : desiredSalary}
                  onChange={(e) => type === 'mentor_offer' ? setPayAmount(e.target.value) : setDesiredSalary(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none"
                />
              </div>
              {type === 'mentor_offer' && (
                <select 
                  value={payPeriod}
                  onChange={(e) => setPayPeriod(e.target.value as any)}
                  className="px-4 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-black transition-all"
                >
                  <option value="hour">{isRtl ? 'לשעה' : '/hr'}</option>
                  <option value="day">{isRtl ? 'ליום' : '/day'}</option>
                  <option value="month">{isRtl ? 'לחודש' : '/mo'}</option>
                </select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'תמונת הזדמנות' : 'Opportunity Image'}</label>
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label 
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-100 hover:border-black transition-all overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="text-gray-300 mb-2" size={32} />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isRtl ? 'לחץ להעלאה' : 'Click to upload'}</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="space-y-6">
          {type === 'mentor_offer' ? (
            <>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'על העבודה' : 'About the Work'}</label>
                <textarea 
                  required
                  rows={3}
                  placeholder={isRtl ? 'תאר את העבודה היומיומית...' : 'Describe the daily work...'}
                  value={aboutWork}
                  onChange={(e) => setAboutWork(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'את מי אני רוצה ללמד' : 'Who I want to teach'}</label>
                <textarea 
                  required
                  rows={2}
                  placeholder={isRtl ? 'תאר את המתלמד האידיאלי עבורך...' : 'Describe your ideal apprentice...'}
                  value={whoIWantToTeach}
                  onChange={(e) => setWhoIWantToTeach(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'דרישות (למתחילים)' : 'Requirements (For Beginners)'}</label>
                <textarea 
                  required
                  rows={2}
                  placeholder={isRtl ? 'למשל: רצינות, הגעה בזמן, רצון ללמוד' : 'e.g. Punctuality, willingness to learn'}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none resize-none"
                />
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-1">
                  {isRtl ? '* מיועד למתחילים בלבד - אין לדרוש ניסיון קודם' : '* For beginners only - do not require prior experience'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'מה המתלמד ילמד' : 'What the Apprentice will learn'}</label>
                <textarea 
                  required
                  rows={3}
                  placeholder={isRtl ? 'פרט את הידע המקצועי שיועבר...' : 'Detail the professional knowledge to be shared...'}
                  value={menteeWillLearn}
                  onChange={(e) => setMenteeWillLearn(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'מה אני רוצה ללמוד' : 'What I want to learn'}</label>
                <textarea 
                  required
                  rows={4}
                  placeholder={isRtl ? 'תאר את המקצוע שאתה רוצה ללמוד ולמה...' : 'Describe the trade you want to learn and why...'}
                  value={whatIWantToLearn}
                  onChange={(e) => setWhatIWantToLearn(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'זמינות (ימים בשבוע)' : 'Availability (Days per week)'}</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`w-10 h-10 rounded-xl font-black text-xs transition-all border-2 ${
                        availabilityDays.includes(day)
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100'
                          : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'ניסיון קודם או רקע טכני' : 'Prior Experience or Technical Background'}</label>
                <textarea 
                  rows={3}
                  placeholder={isRtl ? 'ספר בקצרה על רקע טכני או עבודות קודמות...' : 'Briefly tell about any technical background or past jobs...'}
                  value={experienceNote}
                  onChange={(e) => setExperienceNote(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none resize-none"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-medium animate-shake">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-end pt-8">
        <button
          type="submit"
          disabled={loading}
          className="px-12 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
          ) : (
            <>
              {isRtl ? 'פרסם הזדמנות' : 'Post Opportunity'}
              <ArrowRight size={18} className="rtl:rotate-180" />
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-12">
          {step === 1 ? renderStep1() : renderStep2()}
        </div>
      </div>
    </div>
  );
}
