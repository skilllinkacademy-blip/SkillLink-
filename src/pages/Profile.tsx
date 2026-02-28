import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, CheckCircle2, Clock, Award, MessageSquare, BookOpen, CheckSquare, PlusSquare, Camera, Pencil, Plus, ExternalLink, Briefcase, GraduationCap, ShieldCheck, Calendar, UserCheck, Info, Hammer, AlertCircle, ArrowRight, X, ChevronRight, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/ui/Modal';
import { userService, requestService } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const isHe = lang === 'he';
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form state for request
  const [requestMessage, setRequestMessage] = useState('');
  const [startDate, setStartDate] = useState('');

  const isMe = id === 'me';

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = isMe ? await userService.getMe() : await userService.getUserById(id!);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast(isHe ? 'שגיאה בטעינת הפרופיל' : 'Error loading profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!requestMessage || !startDate) {
      showToast(isHe ? 'אנא מלא את כל השדות' : 'Please fill all fields', 'error');
      return;
    }
    
    try {
      await requestService.createRequest({
        mentorId: profile.id,
        message: requestMessage,
        startDate
      });
      showToast(isHe ? 'הבקשה נשלחה בהצלחה!' : 'Request sent successfully!', 'success');
      setIsApplyModalOpen(false);
    } catch (error) {
      console.error('Error sending request:', error);
      showToast(isHe ? 'שגיאה בשליחת הבקשה' : 'Error sending request', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
          <AlertCircle className="text-gray-200" size={48} />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-black text-black">
            {isHe ? 'פרופיל לא נמצא' : 'Profile Not Found'}
          </h2>
          <p className="text-gray-400 font-medium">
            {isHe ? 'המשתמש שחיפשת אינו קיים או שטרם אושר במערכת.' : 'The user you are looking for does not exist or has not been approved yet.'}
          </p>
        </div>
        <Link to="/home" className="btn-primary px-10">
          {isHe ? 'חזור לדף הבית' : 'Back to Home'}
        </Link>
      </div>
    );
  }

  const isMentor = profile.role === 'mentor';

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="linkedin-card overflow-hidden">
        <div className="h-64 bg-black relative group">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          {isMe && (
            <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all">
              <Camera size={20} />
            </button>
          )}
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-end -mt-20 md:-mt-24 mb-8 gap-6">
            <div className="relative group">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-white p-2 shadow-2xl">
                <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center text-white text-5xl font-black">
                  {profile.name?.substring(0, 2).toUpperCase()}
                </div>
              </div>
              {isMe && (
                <div className="absolute inset-2 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm">
                  <Camera size={32} className="text-white" />
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {isMe ? (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-black text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-gray-800 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                >
                  <Pencil size={18} />
                  {isHe ? 'ערוך פרופיל' : 'Edit Profile'}
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => navigate(`/messaging?user=${profile.id}`)}
                    className="border-2 border-black text-black font-bold px-8 py-3.5 rounded-2xl hover:bg-black/5 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <MessageSquare size={18} />
                    {isHe ? 'שלח הודעה' : 'Message'}
                  </button>
                  {isMentor && (
                    <button 
                      onClick={() => setIsApplyModalOpen(true)}
                      className="bg-black text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-gray-800 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                    >
                      <PlusSquare size={18} />
                      {isHe ? 'הגש מועמדות להתמחות' : 'Apply for Apprenticeship'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-black tracking-tight">
                  {profile.name}
                </h1>
                {profile.verified && <ShieldCheck size={24} className="text-black" />}
                <span className="px-3 py-1 bg-gray-100 text-black text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-200">
                  {isHe ? (isMentor ? 'מנטור' : 'חניך') : profile.role}
                </span>
              </div>
              <p className="text-xl text-gray-400 font-medium">
                {profile.trade || (isHe ? 'מקצוע לא הוגדר' : 'Trade not specified')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-gray-500 font-bold text-sm">
              <span className="flex items-center gap-2"><MapPin size={18} className="text-black" /> {profile.location || (isHe ? 'מיקום לא מוגדר' : 'Location not set')}</span>
              <span className="flex items-center gap-2"><Briefcase size={18} className="text-black" /> {profile.experience || '0'} {isHe ? 'שנות ניסיון' : 'years experience'}</span>
              <div className="flex items-center gap-2">
                <Star size={18} className="text-black fill-current" />
                <span className="text-black">{profile.rating || '5.0'}</span>
                <span className="text-gray-300">({profile.reviewCount || 0} {isHe ? 'ביקורות' : 'reviews'})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="linkedin-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-black">{isHe ? 'אודות' : 'About'}</h2>
              {isMe && <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black"><Pencil size={20} /></button>}
            </div>
            <p className="text-gray-400 font-medium leading-relaxed text-lg">
              {profile.bio || (isHe ? 'עדיין לא הוספת תיאור לפרופיל שלך.' : 'You haven\'t added a bio to your profile yet.')}
            </p>
          </div>

          {/* Experience / Portfolio */}
          <div className="linkedin-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-black">{isHe ? 'תיק עבודות וניסיון' : 'Portfolio & Experience'}</h2>
              {isMe && <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black"><Plus size={24} /></button>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center group cursor-pointer hover:border-black transition-all">
                  <Plus size={32} className="text-gray-200 group-hover:text-black transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="linkedin-card p-8">
            <h3 className="text-xl font-black text-black mb-6">{isHe ? 'מידע נוסף' : 'Quick Info'}</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isHe ? 'הצטרף ב' : 'Joined'}</p>
                  <p className="text-sm font-bold text-black">{new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isHe ? 'חניכים' : 'Apprentices'}</p>
                  <p className="text-sm font-bold text-black">{profile.apprenticeCount || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-2xl font-black mb-4 relative z-10">{isHe ? 'השלם את הפרופיל' : 'Complete Profile'}</h3>
            <p className="text-gray-400 font-medium leading-relaxed relative z-10 mb-8">
              {isHe ? 'פרופיל מלא עוזר למנטורים ולאפליקנטים למצוא אותך מהר יותר.' : 'A complete profile helps mentors and apprentices find you faster.'}
            </p>
            <button className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group">
              {isHe ? 'עדכן עכשיו' : 'Update Now'}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)}
        title={isHe ? 'הגשת מועמדות להתמחות' : 'Apply for Apprenticeship'}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-black text-sm">
              {profile.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-black">{profile.name}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{profile.trade}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                {isHe ? 'הודעה למנטור' : 'Message to Mentor'}
              </label>
              <textarea 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all min-h-[120px] font-medium"
                placeholder={isHe ? 'ספר למנטור למה אתה רוצה ללמוד ממנו...' : 'Tell the mentor why you want to learn from them...'}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                {isHe ? 'תאריך התחלה מועדף' : 'Preferred Start Date'}
              </label>
              <input 
                type="date"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleSendRequest}
            className="w-full bg-black text-white font-black py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-xl active:scale-95"
          >
            {isHe ? 'שלח בקשה' : 'Send Request'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
