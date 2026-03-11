import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, GraduationCap, ArrowLeft, ShieldCheck, User, Calendar, Info, Share2, Heart, MessageSquare, Users, Award, Pencil, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { calculateMatchScore, MatchBreakdown } from '../utils/matchScore';

interface OpportunityDetailsProps {
  isRtl: boolean;
}

export default function OpportunityDetails({ isRtl }: OpportunityDetailsProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [saving, setSaving] = useState(false);
  const [interesting, setInteresting] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchBreakdown, setMatchBreakdown] = useState<MatchBreakdown | null>(null);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [interestedUsers, setInterestedUsers] = useState<any[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(false);

  useEffect(() => {
    if (opportunity && user && opportunity.owner_id === user.id) {
      fetchInterests();
    }
  }, [opportunity, user]);

  const fetchInterests = async () => {
    setLoadingInterests(true);
    try {
      const response = await api.get(`/opportunities/${id}/interests`);
      setInterestedUsers(response.data);
    } catch (error) {
      console.error('Error fetching interests:', error);
    } finally {
      setLoadingInterests(false);
    }
  };

  const removeInterest = async (userId: string) => {
    if (!window.confirm(isRtl ? 'האם אתה בטוח שברצונך להסיר את המשתמש מרשימת המעוניינים?' : 'Are you sure you want to remove this user from the interested list?')) return;
    try {
      await api.delete(`/opportunities/${id}/interest/${userId}`);
      setInterestedUsers(prev => prev.filter(u => u.userId !== userId));
    } catch (error) {
      console.error('Error removing interest:', error);
    }
  };

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/opportunities/${id}`);
        const data = response.data;
        
        // Transform data to match frontend expectations
        const transformedData = {
          ...data,
          owner_id: data.ownerId,
          image_url: data.imageUrl,
          work_hours: data.workHours,
          pay_amount: data.payAmount,
          pay_period: data.payPeriod,
          about_work: data.aboutWork,
          who_i_want_to_teach: data.whoIWantToTeach,
          mentee_will_learn: data.menteeWillLearn,
          requirements: data.requirements,
          what_i_want_to_learn: data.whatIWantToLearn,
          experience_note: data.experienceNote,
          desired_salary: data.desiredSalary,
          created_at: data.createdAt,
          ownerUsername: data.ownerUsername,
          profiles: {
            full_name: data.ownerName,
            avatar_url: data.ownerAvatar,
            occupation: data.ownerTrade,
            role: data.ownerRole,
            is_verified: data.ownerVerified === 1,
            username: data.ownerUsername || data.ownerName?.toLowerCase().replace(/\s+/g, '_'),
            location: data.location,
            created_at: data.createdAt
          }
        };

        setOpportunity(transformedData);
        setIsSaved(data.isSaved === 1);

        // Calculate match score if user is logged in
        if (profile && transformedData) {
          const { score, breakdown } = calculateMatchScore(transformedData, profile, isRtl);
          setMatchScore(score);
          setMatchBreakdown(breakdown);
        }
      } catch (error) {
        console.error('Error fetching opportunity:', error);
        navigate('/app/opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id, navigate, profile]);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user || !id || !opportunity) return;
      
      try {
        // Check if already expressed interest for this specific opportunity
        const response = await api.get('/notifications');
        const notifications = response.data;
        
        const hasInterest = notifications.some((n: any) => 
          n.senderId === user.id && 
          n.type === 'interest' && 
          n.link === `/app/opportunities/${id}`
        );
        
        if (hasInterest) {
          setIsInterested(true);
        }
      } catch (err) {
        console.error('Error checking status:', err);
      }
    };

    if (opportunity && user) {
      checkStatus();
    }
  }, [user, id, opportunity]);

  const handleShare = async () => {
    if (!opportunity) return;
    const shareData = {
      title: opportunity.title,
      text: isRtl 
        ? `היי, מצאתי הזדמנות מעניינת ב-SkillLink: ${opportunity.title}`
        : `Hey, I found an interesting opportunity on SkillLink: ${opportunity.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert(isRtl ? 'הקישור הועתק ללוח!' : 'Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleInterested = async () => {
    if (!user || !opportunity) return;
    
    if (interesting || isInterested) return;
    
    // Prevent self-interest
    if (user.id === opportunity.owner_id) {
      alert(isRtl ? 'אינך יכול להביע עניין בהזדמנות של עצמך' : 'You cannot express interest in your own opportunity');
      return;
    }

    setInteresting(true);
    try {
      // 1. Save interest in DB
      await api.post(`/opportunities/${id}/interest`);

      const senderName = profile?.full_name || (isRtl ? 'משתמש' : 'User');
      
      await api.post('/notifications', {
        userId: opportunity.owner_id,
        type: 'interest',
        title: isRtl ? 'מישהו מעוניין בהזדמנות שלך!' : 'Someone is interested in your opportunity!',
        content: isRtl 
          ? `${senderName} התעניין בעבודה "${opportunity.title}", במידה וזה רלוונטי שווה לחזור אליו.`
          : `${senderName} is interested in "${opportunity.title}". If relevant, it's worth getting back to them.`,
        link: `/app/opportunities/${opportunity.id}`
      });
      
      setIsInterested(true);
      alert(isRtl ? 'הודעה נשלחה למפרסם ההזדמנות!' : 'Notification sent to the opportunity poster!');
    } catch (error: any) {
      console.error('Error in handleInterested:', error);
      alert(isRtl ? `שגיאה בשליחת ההודעה: ${error.message || 'אנא נסה שוב'}` : `Error sending notification: ${error.message || 'Please try again'}`);
    } finally {
      setInteresting(false);
    }
  };

  const toggleSave = async () => {
    if (!user || !id) return;
    setSaving(true);
    try {
      await api.post(`/opportunities/${id}/save`);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error toggling save status:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  if (!opportunity) return null;

  const isMentorOffer = opportunity.type === 'mentor_offer';

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8 sm:space-y-10 animate-in fade-in duration-500">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-[0.2em] group"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
          <ArrowLeft size={16} className="rtl:rotate-180" />
        </div>
        {isRtl ? 'חזרה' : 'Back'}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8 sm:space-y-10">
          <div className="industrial-card overflow-hidden">
            {/* Image Header */}
            <div className="h-64 sm:h-96 bg-slate-50 relative overflow-hidden">
              {opportunity.image_url ? (
                <img 
                  src={opportunity.image_url} 
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
                  {isMentorOffer ? <Briefcase size={60} sm:size={100} strokeWidth={1} /> : <GraduationCap size={60} sm:size={100} strokeWidth={1} />}
                </div>
              )}
              <div className={`absolute top-4 sm:top-8 ${isRtl ? 'right-4 sm:right-8' : 'left-4 sm:left-8'} px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md border border-white/10 ${
                isMentorOffer ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {isRtl ? (isMentorOffer ? 'הצעת מנטור' : 'מתלמד מחפש') : (isMentorOffer ? 'Master Offer' : 'Apprentice Seeking')}
              </div>
            </div>

            <div className="p-6 sm:p-12 space-y-8 sm:space-y-10">
              {matchScore !== null && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-slate-200 sm:hidden"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-slate-200 hidden sm:block"
                          />
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={150.8}
                            strokeDashoffset={150.8 - (150.8 * matchScore) / 100}
                            className="text-emerald-500 transition-all duration-1000 ease-out sm:hidden"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={226.2}
                            strokeDashoffset={226.2 - (226.2 * matchScore) / 100}
                            className="text-emerald-500 transition-all duration-1000 ease-out hidden sm:block"
                          />
                        </svg>
                        <span className="absolute text-sm sm:text-lg font-black text-slate-900">{matchScore}%</span>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        <h4 className="text-base sm:text-xl font-black text-slate-900">{isRtl ? 'התאמה חכמה' : 'Smart Match'}</h4>
                        <p className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">{isRtl ? 'מבוסס על המיקום והכישורים שלך' : 'Based on your location and skills'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="hidden md:block">
                        <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isRtl ? 'סטטוס' : 'Status'}</p>
                          <p className="text-sm font-black text-emerald-600">
                            {matchScore > 80 ? (isRtl ? 'התאמה מעולה!' : 'Excellent Match!') : matchScore > 50 ? (isRtl ? 'התאמה טובה' : 'Good Match') : (isRtl ? 'פוטנציאל למידה' : 'Learning Potential')}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowMatchDetails(!showMatchDetails)}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                      >
                        <ArrowRight size={16} className={`transition-transform duration-300 ${showMatchDetails ? '-rotate-90' : 'rotate-90'}`} />
                      </button>
                    </div>
                  </div>

                  {showMatchDetails && matchBreakdown && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-900 text-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 space-y-6 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'מיקום' : 'Location'}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg sm:text-xl font-black">{matchBreakdown.location}/30</span>
                            <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${(matchBreakdown.location / 30) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'תחום ועיסוק' : 'Field & Role'}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg sm:text-xl font-black">{matchBreakdown.role}/40</span>
                            <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${(matchBreakdown.role / 40) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isRtl ? 'אמינות' : 'Trust'}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg sm:text-xl font-black">{matchBreakdown.trust}/30</span>
                            <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500" style={{ width: `${(matchBreakdown.trust / 30) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{isRtl ? 'פירוט נוסף' : 'Additional Details'}</p>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {matchBreakdown.details.map((detail, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-800 rounded-xl text-[9px] sm:text-[10px] font-bold">
                              {detail}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">{opportunity.title}</h1>
                <div className="flex flex-wrap gap-4 sm:gap-8">
                  <div className="flex items-center gap-2 sm:gap-3 text-slate-500 font-bold text-sm sm:text-base">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin size={18} />
                    </div>
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-slate-500 font-bold text-sm sm:text-base">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Clock size={18} />
                    </div>
                    <span>{opportunity.work_hours}</span>
                  </div>
                  {(opportunity.pay_amount || opportunity.desired_salary) && (
                    <div className="flex items-center gap-2 sm:gap-3 text-slate-900 font-black text-sm sm:text-base">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg">
                        ₪
                      </div>
                      <span className="text-base sm:text-xl">
                        {isMentorOffer 
                          ? `${opportunity.pay_amount} ₪ / ${opportunity.pay_period === 'hour' ? (isRtl ? 'שעה' : 'hr') : opportunity.pay_period === 'day' ? (isRtl ? 'יום' : 'day') : (isRtl ? 'חודש' : 'mo')}`
                          : `${isRtl ? 'שכר מבוקש:' : 'Desired:'} ${opportunity.desired_salary} ₪`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 pt-8 sm:pt-12 border-t border-slate-100">
                {isMentorOffer ? (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Info size={16} className="text-slate-300" />
                        {isRtl ? 'על העבודה' : 'About the Work'}
                      </h3>
                      <p className="text-slate-600 font-medium leading-relaxed text-lg">{opportunity.about_work}</p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Users size={16} className="text-slate-300" />
                        {isRtl ? 'את מי אני רוצה ללמד' : 'Who I want to teach'}
                      </h3>
                      <p className="text-slate-600 font-medium leading-relaxed text-lg">{opportunity.who_i_want_to_teach}</p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <GraduationCap size={16} className="text-slate-300" />
                        {isRtl ? 'מה תלמדו' : 'What you will learn'}
                      </h3>
                      <p className="text-slate-600 font-medium leading-relaxed text-lg">{opportunity.mentee_will_learn}</p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Award size={16} className="text-slate-300" />
                        {isRtl ? 'דרישות' : 'Requirements'}
                      </h3>
                      <p className="text-slate-600 font-medium leading-relaxed text-lg">{opportunity.requirements}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Info size={16} className="text-slate-300" />
                        {isRtl ? 'מה אני רוצה ללמוד' : 'What I want to learn'}
                      </h3>
                      <p className="text-slate-600 font-medium leading-relaxed text-lg">{opportunity.what_i_want_to_learn}</p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Calendar size={16} className="text-slate-300" />
                        {isRtl ? 'זמינות' : 'Availability'}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {Array.isArray(opportunity.availability_days) ? (
                          opportunity.availability_days.map((day: string) => (
                            <span key={day} className="px-4 py-2 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                              {day}
                            </span>
                          ))
                        ) : (
                          <p className="text-slate-600 font-medium leading-relaxed text-lg">{opportunity.availability_days}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Award size={16} className="text-slate-300" />
                        {isRtl ? 'ניסיון קודם' : 'Prior Experience'}
                      </h3>
                      <p className="text-slate-600 font-medium leading-relaxed text-lg">{opportunity.experience_note || (isRtl ? 'אין ניסיון קודם' : 'No prior experience')}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          {/* Owner Card */}
          <div className="industrial-card p-6 sm:p-10 space-y-6 sm:space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{isRtl ? 'פורסם על ידי' : 'Posted By'}</h3>
            <div 
              className="flex items-center gap-4 sm:gap-5 cursor-pointer group/owner"
              onClick={() => {
                if (opportunity.profiles?.username) {
                  navigate(`/app/u/${opportunity.profiles.username}`);
                }
              }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.2rem] sm:rounded-[1.5rem] bg-slate-100 flex items-center justify-center text-slate-400 font-black text-2xl sm:text-3xl shadow-xl overflow-hidden border border-slate-200 group-hover/owner:scale-105 transition-transform">
                {opportunity.profiles?.avatar_url ? (
                  <img src={opportunity.profiles.avatar_url} alt={opportunity.profiles.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  opportunity.profiles?.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 group-hover/owner:text-emerald-600 transition-colors">{opportunity.profiles?.full_name}</h4>
                  {opportunity.profiles?.is_verified && (
                    <ShieldCheck size={16} className="text-emerald-600 fill-emerald-500/10" />
                  )}
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest">{opportunity.profiles?.occupation || (isRtl ? 'חבר קהילה' : 'Community Member')}</p>
              </div>
            </div>

            {/* Interested Users (Owner Only) */}
            {user?.id === opportunity.owner_id && (
              <div className="industrial-card p-6 sm:p-10 space-y-6 sm:space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{isRtl ? 'משתמשים שגילו עניין' : 'Interested Users'}</h3>
                  <span className="px-3 py-1 bg-slate-100 text-slate-900 text-[10px] font-black rounded-full border border-slate-200">
                    {interestedUsers.length}
                  </span>
                </div>

                {loadingInterests ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-slate-400" size={24} />
                  </div>
                ) : interestedUsers.length > 0 ? (
                  <div className="space-y-4">
                    {interestedUsers.map((interestedUser) => (
                      <div key={interestedUser.userId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group/user">
                        <div 
                          className="flex items-center gap-4 cursor-pointer"
                          onClick={() => navigate(`/app/u/${interestedUser.userUsername || interestedUser.userId}`)}
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden border border-slate-300">
                            {interestedUser.userAvatar ? (
                              <img src={interestedUser.userAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">
                                {interestedUser.userName?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{interestedUser.userName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{interestedUser.userTrade || (isRtl ? 'חבר קהילה' : 'Community Member')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover/user:opacity-100 transition-opacity">
                          <button 
                            onClick={() => navigate('/app/messages', { state: { recipientId: interestedUser.userId, recipientName: interestedUser.userName } })}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title={isRtl ? 'שלח הודעה' : 'Send Message'}
                          >
                            <MessageSquare size={18} />
                          </button>
                          <button 
                            onClick={() => removeInterest(interestedUser.userId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={isRtl ? 'התעלם/מחק' : 'Ignore/Delete'}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-slate-400 font-medium italic">
                    {isRtl ? 'עדיין אין משתמשים שגילו עניין' : 'No interested users yet'}
                  </p>
                )}
              </div>
            )}

            {/* Trust Score Element */}
            <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'מדד אמינות' : 'Trust Score'}</span>
                <span className="text-xs font-black text-slate-900">
                  {Math.min(100, 75 + (opportunity.profiles?.is_verified ? 20 : 0) + (opportunity.profiles?.reviews_count || 0) * 2)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-900 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, 75 + (opportunity.profiles?.is_verified ? 20 : 0) + (opportunity.profiles?.reviews_count || 0) * 2)}%` }}
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">{isRtl ? 'מיקום' : 'Location'}</span>
                <span className="text-slate-900">{opportunity.profiles?.location}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">{isRtl ? 'חבר מאז' : 'Member Since'}</span>
                <span className="text-slate-900">{new Date(opportunity.profiles?.created_at).getFullYear()}</span>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
              {user?.id === opportunity.owner_id ? (
                <button 
                  onClick={() => navigate(`/app/opportunities/${opportunity.id}/edit`)}
                  className="w-full bg-slate-900 text-white py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Pencil size={18} />
                  {isRtl ? 'ערוך הזדמנות' : 'Edit Opportunity'}
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleInterested}
                    disabled={interesting || isInterested || user?.id === opportunity.owner_id}
                    className={`w-full py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                      isInterested 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default' 
                        : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50'
                    }`}
                  >
                    {isInterested ? <ShieldCheck size={18} /> : <Heart size={18} />}
                    {isInterested 
                      ? (isRtl ? 'כבר הבעת עניין' : 'Interest Sent') 
                      : (isRtl ? 'אני מעוניין!' : "I'm Interested!")}
                  </button>

                  <button 
                    onClick={() => navigate('/app/messages', { state: { recipientId: opportunity.owner_id, recipientName: opportunity.profiles?.full_name } })}
                    className="w-full bg-white text-slate-900 border-2 border-slate-900 py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <MessageSquare size={18} />
                    {isRtl ? 'שלח הודעה' : 'Send Message'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <button 
                onClick={handleShare}
                className="flex-1 bg-white text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
              >
                <Share2 size={16} />
                {isRtl ? 'שתף' : 'Share'}
              </button>
              <button 
                onClick={toggleSave}
                disabled={saving}
                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border shadow-sm ${
                  isSaved 
                    ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                    : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Heart size={16} className={isSaved ? 'fill-current' : ''} />
                {isRtl ? (isSaved ? 'הסר' : 'שמור') : (isSaved ? 'Saved' : 'Save')}
              </button>
            </div>
            
            <div className="text-center">
              <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSaved ? 'text-red-600' : 'text-slate-400'}`}>
                {isSaved 
                  ? (isRtl ? 'נוסף למועדפים' : 'Added to favorites') 
                  : (isRtl ? 'שמור להמשך' : 'Save for later')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
