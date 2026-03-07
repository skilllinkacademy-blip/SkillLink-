import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, GraduationCap, ArrowLeft, ShieldCheck, User, Calendar, Info, Share2, Heart, MessageSquare, Users, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('opportunities')
        .select('*, profiles(*)')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching opportunity:', error);
        navigate('/app/opportunities');
      } else {
        setOpportunity(data);
      }
      setLoading(false);
    };

    fetchOpportunity();
  }, [id, navigate]);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user || !id || !opportunity) return;
      
      try {
        // Check saved status
        const { data: savedData } = await supabase
          .from('saved_opportunities')
          .select('id')
          .eq('user_id', user.id)
          .eq('opportunity_id', id)
          .maybeSingle();
        
        if (savedData) {
          setIsSaved(true);
        }

        // Check if already expressed interest for this specific opportunity
        const { data: interestData } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', opportunity.owner_id)
          .eq('sender_id', user.id)
          .eq('type', 'interest')
          .eq('link', `/app/opportunities/${id}`)
          .maybeSingle();
        
        if (interestData) {
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
    console.log('handleInterested called');
    if (!user || !opportunity) {
      console.log('Missing user or opportunity');
      return;
    }
    
    if (interesting || isInterested) {
      console.log('Already interesting or interested');
      return;
    }
    
    // Prevent self-interest
    if (user.id === opportunity.owner_id) {
      alert(isRtl ? 'אינך יכול להביע עניין בהזדמנות של עצמך' : 'You cannot express interest in your own opportunity');
      return;
    }

    setInteresting(true);
    try {
      const senderName = profile?.full_name || user.user_metadata?.full_name || (isRtl ? 'משתמש' : 'User');
      console.log('Sending interest notification from:', senderName, 'to:', opportunity.owner_id);
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: opportunity.owner_id,
          sender_id: user.id,
          type: 'interest',
          title: isRtl ? 'מישהו מעוניין בהזדמנות שלך!' : 'Someone is interested in your opportunity!',
          content: isRtl 
            ? `${senderName} התעניין בעבודה "${opportunity.title}", במידה וזה רלוונטי שווה לחזור אליו.`
            : `${senderName} is interested in "${opportunity.title}". If relevant, it's worth getting back to them.`,
          link: `/app/opportunities/${opportunity.id}`,
          is_read: false
        })
        .select();

      if (error) {
        console.error('Supabase error inserting notification:', error);
        throw error;
      }
      
      console.log('Notification inserted successfully:', data);
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
      if (isSaved) {
        await supabase
          .from('saved_opportunities')
          .delete()
          .eq('user_id', user.id)
          .eq('opportunity_id', id);
        setIsSaved(false);
      } else {
        await supabase
          .from('saved_opportunities')
          .insert({ user_id: user.id, opportunity_id: id });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  if (!opportunity) return null;

  const isMentorOffer = opportunity.type === 'mentor_offer';

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={18} className="rtl:rotate-180" />
        {isRtl ? 'חזרה' : 'Back'}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-xl">
            {/* Image Header */}
            <div className="h-80 bg-gray-50 relative overflow-hidden">
              {opportunity.image_url ? (
                <img 
                  src={opportunity.image_url} 
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  {isMentorOffer ? <Briefcase size={80} /> : <GraduationCap size={80} />}
                </div>
              )}
              <div className={`absolute top-6 ${isRtl ? 'right-6' : 'left-6'} px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${
                isMentorOffer ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {isRtl ? (isMentorOffer ? 'הצעת מנטור' : 'מתלמד מחפש') : (isMentorOffer ? 'Mentor Offer' : 'Apprentice Seeking')}
              </div>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-black text-gray-900 leading-tight">{opportunity.title}</h1>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-gray-500 font-bold">
                    <MapPin size={20} className="text-blue-600" />
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 font-bold">
                    <Clock size={20} className="text-blue-600" />
                    <span>{opportunity.work_hours}</span>
                  </div>
                  {(opportunity.pay_amount || opportunity.desired_salary) && (
                    <div className="flex items-center gap-2 text-blue-700 font-black">
                      <DollarSign size={20} />
                      <span>
                        {isMentorOffer 
                          ? `${opportunity.pay_amount} / ${opportunity.pay_period === 'hour' ? (isRtl ? 'שעה' : 'hr') : opportunity.pay_period === 'day' ? (isRtl ? 'יום' : 'day') : (isRtl ? 'חודש' : 'mo')}`
                          : `${isRtl ? 'שכר מבוקש:' : 'Desired:'} ${opportunity.desired_salary}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-gray-50">
                {isMentorOffer ? (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Info size={22} className="text-blue-600" />
                        {isRtl ? 'על העבודה' : 'About the Work'}
                      </h3>
                      <p className="text-gray-500 font-medium leading-relaxed">{opportunity.about_work}</p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Users size={22} className="text-blue-600" />
                        {isRtl ? 'את מי אני רוצה ללמד' : 'Who I want to teach'}
                      </h3>
                      <p className="text-gray-500 font-medium leading-relaxed">{opportunity.who_i_want_to_teach}</p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <GraduationCap size={22} className="text-blue-600" />
                        {isRtl ? 'מה תלמדו' : 'What you will learn'}
                      </h3>
                      <p className="text-gray-500 font-medium leading-relaxed">{opportunity.mentee_will_learn}</p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Award size={22} className="text-blue-600" />
                        {isRtl ? 'דרישות' : 'Requirements'}
                      </h3>
                      <p className="text-gray-500 font-medium leading-relaxed">{opportunity.requirements}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Info size={22} className="text-emerald-600" />
                        {isRtl ? 'מה אני רוצה ללמוד' : 'What I want to learn'}
                      </h3>
                      <p className="text-gray-500 font-medium leading-relaxed">{opportunity.what_i_want_to_learn}</p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Calendar size={22} className="text-emerald-600" />
                        {isRtl ? 'זמינות' : 'Availability'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(opportunity.availability_days) ? (
                          opportunity.availability_days.map((day: string) => (
                            <span key={day} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black uppercase tracking-widest border border-emerald-100">
                              {day}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 font-medium leading-relaxed">{opportunity.availability_days}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Award size={22} className="text-emerald-600" />
                        {isRtl ? 'ניסיון קודם' : 'Prior Experience'}
                      </h3>
                      <p className="text-gray-500 font-medium leading-relaxed">{opportunity.experience_note || (isRtl ? 'אין ניסיון קודם' : 'No prior experience')}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Owner Card */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{isRtl ? 'פורסם על ידי' : 'Posted By'}</h3>
            <div 
              className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                if (opportunity.profiles?.username) {
                  navigate(`/app/u/${opportunity.profiles.username}`);
                }
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white font-black text-2xl shadow-xl overflow-hidden">
                {opportunity.profiles?.avatar_url ? (
                  <img src={opportunity.profiles.avatar_url} alt={opportunity.profiles.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  opportunity.profiles?.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-black text-gray-900">{opportunity.profiles?.full_name}</h4>
                  {opportunity.profiles?.is_verified && (
                    <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest border border-green-100">
                      {isRtl ? 'מאומת' : 'Verified'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-bold">{opportunity.profiles?.occupation || (isRtl ? 'חבר קהילה' : 'Community Member')}</p>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-50 space-y-4">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-gray-400 uppercase tracking-widest">{isRtl ? 'מיקום' : 'Location'}</span>
                <span className="text-gray-900">{opportunity.profiles?.city || opportunity.profiles?.location}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-gray-400 uppercase tracking-widest">{isRtl ? 'חבר מאז' : 'Member Since'}</span>
                <span className="text-gray-900">{new Date(opportunity.profiles?.created_at).getFullYear()}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={handleInterested}
                disabled={interesting || isInterested || user?.id === opportunity.owner_id}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isInterested 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                }`}
              >
                {isInterested ? <ShieldCheck size={18} /> : <Heart size={18} />}
                {isInterested 
                  ? (isRtl ? 'כבר הבעת עניין' : 'Interest Sent') 
                  : (isRtl ? 'אני מעוניין!' : "I'm Interested!")}
              </button>

              <button 
                onClick={() => navigate('/app/messages', { state: { recipientId: opportunity.owner_id, recipientName: opportunity.profiles?.full_name } })}
                className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                {isRtl ? 'שלח הודעה' : 'Send Message'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <button 
                onClick={handleShare}
                className="flex-1 bg-gray-50 text-gray-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-100"
              >
                <Share2 size={18} />
                {isRtl ? 'שתף' : 'Share'}
              </button>
              <button 
                onClick={toggleSave}
                disabled={saving}
                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 border ${
                  isSaved 
                    ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                    : 'bg-gray-50 text-gray-900 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <Heart size={18} className={isSaved ? 'fill-current' : ''} />
                {isRtl ? (isSaved ? 'הסר' : 'שמור') : (isSaved ? 'Saved' : 'Save')}
              </button>
            </div>
            
            <div className="text-center">
              {isSaved ? (
                <p className="text-xs font-bold text-red-600 animate-in fade-in slide-in-from-top-2">
                  {isRtl ? 'נוסף למועדפים ניתן לראות בפרופיל האישי' : 'Added to favorites, can be seen in personal profile'}
                </p>
              ) : (
                <p className="text-xs font-bold text-gray-400">
                  {isRtl ? 'להוסיף למועדפים' : 'Add to favorites'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
