import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, GraduationCap, Trash2, ExternalLink, ShieldCheck, Zap, ArrowRight, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { calculateMatchScore } from '../utils/matchScore';

interface Opportunity {
  id: string;
  type: 'mentor_offer' | 'mentee_seeking';
  title: string;
  location: string;
  work_hours?: string;
  workHours?: string;
  pay_amount?: number;
  payAmount?: number;
  pay_period?: string;
  payPeriod?: string;
  desired_salary?: number;
  desiredSalary?: number;
  image_url?: string;
  imageUrl?: string;
  created_at: string;
  createdAt?: string;
  owner_id?: string;
  ownerId?: string;
  about_work?: string;
  aboutWork?: string;
  what_i_want_to_learn?: string;
  whatIWantToLearn?: string;
  who_i_want_to_teach?: string;
  whoIWantToTeach?: string;
  availability_days?: string[];
  availabilityDays?: string[];
  profiles?: {
    full_name: string;
    avatar_url?: string;
    occupation?: string;
    location?: string;
    is_verified?: boolean;
    username?: string;
  };
  ownerUsername?: string;
  ownerSupabaseId?: string;
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

  const imageUrl = opportunity.image_url || opportunity.imageUrl;
  const workHours = opportunity.work_hours || opportunity.workHours;
  const payAmount = opportunity.pay_amount || opportunity.payAmount;
  const payPeriod = opportunity.pay_period || opportunity.payPeriod;
  const desiredSalary = opportunity.desired_salary || opportunity.desiredSalary;
  const aboutWork = opportunity.about_work || opportunity.aboutWork;
  const whoIWantToTeach = opportunity.who_i_want_to_teach || opportunity.whoIWantToTeach;
  const whatIWantToLearn = opportunity.what_i_want_to_learn || opportunity.whatIWantToLearn;

  const matchScore = useMemo(() => {
    const { score } = calculateMatchScore(opportunity, myProfile, isRtl);
    return score;
  }, [opportunity, myProfile, isRtl]);

  return (
    <div 
      onClick={() => navigate(`/app/opportunities/${opportunity.id}`)}
      className="industrial-card group flex flex-col h-full relative block overflow-hidden cursor-pointer"
    >
      {/* Image Header — smaller on mobile */}
      <div className="h-44 sm:h-56 bg-slate-100 relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={opportunity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
            {isMentorOffer ? <Briefcase size={56} strokeWidth={1} /> : <GraduationCap size={56} strokeWidth={1} />}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Type Badge */}
        <div className={`absolute top-3 sm:top-4 ${isRtl ? 'right-3 sm:right-4' : 'left-3 sm:left-4'} px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] shadow-lg backdrop-blur-md border border-white/10 ${
          isMentorOffer ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {isRtl ? (isMentorOffer ? 'הצעת מנטור' : 'מתלמד מחפש') : (isMentorOffer ? 'Master Offer' : 'Apprentice Seeking')}
        </div>

        {/* Match Score Badge */}
        {matchScore > 0 && (
          <div className={`absolute top-3 sm:top-4 ${isRtl ? 'left-3 sm:left-4' : 'right-3 sm:right-4'} px-3 py-1.5 rounded-lg bg-white text-slate-900 text-[9px] font-black uppercase tracking-[0.1em] shadow-lg flex items-center gap-1.5 border border-slate-200`}>
            <Zap size={10} className="text-emerald-500 fill-emerald-500" />
            <span>{isRtl ? 'התאמה' : 'Match'} {matchScore}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col space-y-3 sm:space-y-5">
        <div className="flex-1 space-y-2 sm:space-y-3">
          {/* Title + meta */}
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2 tracking-tight">
              {opportunity.title}
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-1 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                <MapPin size={11} className="text-slate-300 shrink-0" />
                <span className="truncate max-w-[100px] sm:max-w-none">{opportunity.location || opportunity.profiles?.location || (isRtl ? 'לא צוין' : 'No location')}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                <Clock size={11} className="text-slate-300 shrink-0" />
                <span>{workHours || (isRtl ? 'גמיש' : 'Flexible')}</span>
              </div>
            </div>
          </div>

          {/* Learning focus */}
          <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
              <GraduationCap size={11} className="text-slate-300" />
              {isRtl ? 'על העבודה' : 'About'}
            </div>
            <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
              {isMentorOffer ? (aboutWork || whoIWantToTeach) : whatIWantToLearn}
            </p>
          </div>
        </div>

        {/* Financials */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 pt-3 border-t border-slate-100">
          <div className="space-y-0.5">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{isRtl ? 'שכר' : 'Pay'}</div>
            <div className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-0.5">
              <span className="text-emerald-600 font-bold text-sm">₪</span>
              {payAmount || desiredSalary || '---'}
              <span className="text-[9px] text-slate-400 font-bold">/{payPeriod === 'hour' ? (isRtl ? 'שעה' : 'hr') : (isRtl ? 'יום' : 'day')}</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{isRtl ? 'סטטוס' : 'Status'}</div>
            <div className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {isRtl ? 'פעיל' : 'Active'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <Link 
            to={`/app/u/${opportunity.ownerSupabaseId || opportunity.ownerUsername || opportunity.profiles?.username}`}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs overflow-hidden border border-slate-200 shrink-0">
              {opportunity.profiles?.avatar_url ? (
                <img src={opportunity.profiles.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                opportunity.profiles?.full_name?.charAt(0) || 'U'
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-black text-slate-900 truncate max-w-[80px] sm:max-w-none">{opportunity.profiles?.full_name || (isRtl ? 'משתמש' : 'User')}</p>
                {opportunity.profiles?.is_verified && (
                  <ShieldCheck size={11} className="text-emerald-500 fill-emerald-500/10 shrink-0" />
                )}
              </div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">{opportunity.profiles?.occupation || (isRtl ? 'בעל מקצוע' : 'Pro')}</p>
            </div>
          </Link>

          <div className="flex items-center gap-1 shrink-0">
            {showActions && (
              <div className="flex items-center gap-0.5">
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    navigate(`/app/opportunities/${opportunity.id}/edit`);
                  }}
                  className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <Pencil size={16} />
                </button>
                {onDelete && (
                  <button 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation();
                      onDelete(opportunity.id); 
                    }}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm border border-slate-100">
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
