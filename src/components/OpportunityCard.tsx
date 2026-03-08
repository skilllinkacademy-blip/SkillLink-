import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, GraduationCap, Trash2, ExternalLink, ShieldCheck, Zap, ArrowRight, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Opportunity {
  id: string;
  type: 'mentor_offer' | 'mentee_seeking';
  title: string;
  location: string;
  work_hours: string;
  pay_amount?: number;
  pay_period?: string;
  desired_salary?: number;
  image_url?: string;
  created_at: string;
  owner_id: string;
  about_work?: string;
  what_i_want_to_learn?: string;
  who_i_want_to_teach?: string;
  availability_days?: string[];
  profiles?: {
    full_name: string;
    avatar_url?: string;
    occupation?: string;
    city?: string;
    is_verified?: boolean;
    username?: string;
  };
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  isRtl: boolean;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  currentUserId?: string;
}

export default function OpportunityCard({ opportunity, isRtl, onDelete, showActions, currentUserId }: OpportunityCardProps) {
  const isMentorOffer = opportunity.type === 'mentor_offer';
  const navigate = useNavigate();
  const { profile: myProfile } = useAuth();

  const matchScore = useMemo(() => {
    if (!myProfile) return 0;
    let score = 0;
    
    // Location match
    if (opportunity.location === myProfile.city || opportunity.location === myProfile.location) {
      score += 35;
    } else if (opportunity.location?.includes(myProfile.city || '') || (myProfile.city && opportunity.location?.includes(myProfile.city))) {
      score += 20;
    }

    // Role alignment
    if (opportunity.type === 'mentor_offer' && myProfile.role === 'mentee') score += 25;
    if (opportunity.type === 'mentee_seeking' && myProfile.role === 'mentor') score += 25;

    // Occupation match
    if (myProfile.occupation && (
      opportunity.title.toLowerCase().includes(myProfile.occupation.toLowerCase()) ||
      opportunity.about_work?.toLowerCase().includes(myProfile.occupation.toLowerCase())
    )) {
      score += 30;
    }

    // Verified bonus
    if (opportunity.profiles?.is_verified) score += 10;

    return Math.min(100, score);
  }, [opportunity, myProfile]);

  return (
    <Link 
      to={`/app/opportunities/${opportunity.id}`}
      className="industrial-card group flex flex-col h-full relative block overflow-hidden"
    >
      {/* Image Header */}
      <div className="h-64 bg-slate-100 relative overflow-hidden">
        {opportunity.image_url ? (
          <img 
            src={opportunity.image_url} 
            alt={opportunity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
            {isMentorOffer ? <Briefcase size={80} strokeWidth={1} /> : <GraduationCap size={80} strokeWidth={1} />}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Type Badge */}
        <div className={`absolute top-6 ${isRtl ? 'right-6' : 'left-6'} px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md border border-white/10 ${
          isMentorOffer ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {isRtl ? (isMentorOffer ? 'הצעת מנטור' : 'מתלמד מחפש') : (isMentorOffer ? 'Master Offer' : 'Apprentice Seeking')}
        </div>

        {/* Match Score Badge */}
        {matchScore > 0 && (
          <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} px-4 py-2 rounded-lg bg-white text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 border border-slate-200 animate-in zoom-in duration-500`}>
            <Zap size={12} className="text-emerald-500 fill-emerald-500" />
            <span>{isRtl ? 'התאמה' : 'Match'} {matchScore}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 flex-1 flex flex-col space-y-6">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2 tracking-tight">
              {opportunity.title}
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <MapPin size={14} className="text-slate-300" />
                <span>{opportunity.location || opportunity.profiles?.city || (isRtl ? 'לא צוין מיקום' : 'No location')}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <Clock size={14} className="text-slate-300" />
                <span>{opportunity.work_hours || (isRtl ? 'גמיש' : 'Flexible')}</span>
              </div>
            </div>
          </div>

          {/* Learning Focus / About */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <GraduationCap size={14} className="text-slate-300" />
              {isRtl ? 'מה תלמד / על העבודה' : 'Learning Focus / About'}
            </div>
            <p className="text-sm text-slate-600 font-medium line-clamp-2 leading-relaxed">
              {isMentorOffer ? (opportunity.about_work || opportunity.who_i_want_to_teach) : opportunity.what_i_want_to_learn}
            </p>
          </div>
        </div>

        {/* Financials */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-1">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'שכר בסיס' : 'Base Pay'}</div>
            <div className="text-xl font-black text-slate-900 flex items-center gap-1">
              <DollarSign size={18} className="text-emerald-500" />
              {opportunity.pay_amount || opportunity.desired_salary || '---'}
              <span className="text-[10px] text-slate-400 font-bold">/{opportunity.pay_period === 'hour' ? (isRtl ? 'שעה' : 'hr') : (isRtl ? 'יום' : 'day')}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'סטטוס' : 'Status'}</div>
            <div className="text-xl font-black text-slate-900 flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {isRtl ? 'פעיל' : 'Active'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (opportunity.profiles?.username) {
                navigate(`/app/u/${opportunity.profiles.username}`);
              }
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm overflow-hidden border border-slate-200">
              {opportunity.profiles?.avatar_url ? (
                <img src={opportunity.profiles.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                opportunity.profiles?.full_name?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-slate-900">{opportunity.profiles?.full_name || (isRtl ? 'משתמש' : 'User')}</p>
                {opportunity.profiles?.is_verified && (
                  <ShieldCheck size={14} className="text-emerald-500 fill-emerald-500/10" />
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{opportunity.profiles?.occupation || (isRtl ? 'בעל מקצוע' : 'Professional')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showActions && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    navigate(`/app/opportunities/${opportunity.id}/edit`);
                  }}
                  className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <Pencil size={20} />
                </button>
                {onDelete && (
                  <button 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation();
                      onDelete(opportunity.id); 
                    }}
                    className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            )}
            <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm border border-slate-100">
              <ArrowRight size={24} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
