import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, GraduationCap, Trash2, ExternalLink, ShieldCheck, Zap, ArrowRight, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { calculateMatchScore } from '../utils/matchScore';
import { resolveAsset } from '../lib/assets';

interface Opportunity {
  id: string;
  type: 'mentor_offer' | 'mentee_seeking';
  opportunity_type?: 'apprenticeship' | 'project';
  opportunityType?: 'apprenticeship' | 'project';
  commitment_level?: 'high' | 'low' | 'flexible';
  commitmentLevel?: 'high' | 'low' | 'flexible';
  learning_focus?: string;
  learningFocus?: string;
  duration_description?: string;
  durationDescription?: string;
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
  match_score?: number;
  matchScore?: number;
  ai_reason?: string | null;
  aiReason?: string | null;
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
  const opportunityType = opportunity.opportunity_type || opportunity.opportunityType;
  const commitmentLevel = opportunity.commitment_level || opportunity.commitmentLevel;
  const durationDescription = opportunity.duration_description || opportunity.durationDescription;

  const matchScore = useMemo(() => {
    if (opportunity.matchScore !== undefined) return opportunity.matchScore;
    if (opportunity.match_score !== undefined) return opportunity.match_score;
    const { score } = calculateMatchScore(opportunity, myProfile, isRtl);
    return score;
  }, [opportunity, myProfile, isRtl]);

  const opportunityTypeLabel = useMemo(() => {
    if (!opportunityType) return null;
    const labels: any = {
      apprenticeship: isRtl ? 'חניכה' : 'Apprenticeship',
      project: isRtl ? 'עבודה מזדמנת' : 'Project Work'
    };
    return labels[opportunityType];
  }, [opportunityType, isRtl]);

  const aiReason = opportunity.aiReason || opportunity.ai_reason;

  return (
    <div 
      onClick={() => navigate(`/app/opportunities/${opportunity.id}`)}
      className="industrial-card group flex flex-col h-full relative block overflow-hidden cursor-pointer"
    >
      {/* Image Header */}
      <div className="h-64 bg-slate-100 relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={resolveAsset(imageUrl) || ''} 
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

        {/* Type Badges */}
        <div className={`absolute top-6 ${isRtl ? 'right-6' : 'left-6'} flex flex-col gap-2`}>
          <div className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md border border-white/10 ${
            isMentorOffer ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {isRtl ? (isMentorOffer ? 'הצעת מנטור' : 'מתלמד מחפש') : (isMentorOffer ? 'Master Offer' : 'Apprentice Seeking')}
          </div>
          {opportunityTypeLabel && (
            <div className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md border border-white/5 bg-white/20 text-white">
              {opportunityTypeLabel}
            </div>
          )}
        </div>

        {/* Match Score Badge */}
        {matchScore > 0 && (
          <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} px-4 py-2 rounded-lg bg-white text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 border border-slate-200 animate-in zoom-in duration-500 ${
            matchScore > 85 ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
          }`}>
            <Zap size={12} className={`${matchScore > 85 ? 'text-emerald-500 fill-emerald-500' : 'text-slate-400'}`} />
            <span>{isRtl ? 'התאמה' : 'Match'} {matchScore}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-5 sm:p-8 flex-1 flex flex-col space-y-4 sm:space-y-6 transition-colors duration-500 ${
        matchScore > 85 ? 'bg-emerald-50/30' : ''
      }`}>
        <div className="flex-1 space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2 tracking-tight">
              {opportunity.title}
            </h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                <MapPin size={14} className="text-slate-300" />
                <span>{opportunity.location || opportunity.profiles?.location || (isRtl ? 'לא צוין מיקום' : 'No location')}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                <Clock size={14} className="text-slate-300" />
                <span>{durationDescription || workHours || (isRtl ? 'גמיש' : 'Flexible')}</span>
              </div>
            </div>
          </div>

          {/* Learning Focus / About */}
          <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 sm:space-y-2 relative overflow-hidden">
            {aiReason && (
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
            )}
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-emerald-600">
               {aiReason ? (
                 <span className="flex items-center gap-1.5">
                   <Zap size={12} className="fill-current" />
                   {isRtl ? 'למה זה מתאים לך:' : 'Why it matches you:'}
                 </span>
               ) : (
                 <span className="flex items-center gap-1.5 text-slate-400">
                   <GraduationCap size={14} className="text-slate-300" />
                   {isRtl ? 'מה תלמד / על העבודה' : 'Learning Focus / About'}
                 </span>
               )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium line-clamp-2 leading-relaxed italic">
              {aiReason || (isMentorOffer ? (aboutWork || whoIWantToTeach) : whatIWantToLearn)}
            </p>
          </div>
        </div>

        {/* Financials */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-slate-100">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'שכר בסיס' : 'Base Pay'}</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1">
              <span className="text-emerald-600 font-bold">₪</span>
              {payAmount || desiredSalary || '---'}
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold">/{payPeriod === 'hour' ? (isRtl ? 'שעה' : 'hr') : (isRtl ? 'יום' : 'day')}</span>
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'סטטוס' : 'Status'}</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse" />
              {isRtl ? 'פעיל' : 'Active'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 sm:pt-6 border-t border-slate-100 flex items-center justify-between">
          <Link 
            to={`/app/u/${opportunity.ownerSupabaseId || opportunity.ownerUsername || opportunity.profiles?.username}`}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs sm:text-sm overflow-hidden border border-slate-200">
              {opportunity.profiles?.avatar_url ? (
                <img src={resolveAsset(opportunity.profiles.avatar_url) || ''} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                opportunity.profiles?.full_name?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <p className="text-xs sm:text-sm font-black text-slate-900">{opportunity.profiles?.full_name || (isRtl ? 'משתמש' : 'User')}</p>
                {opportunity.profiles?.is_verified && (
                  <ShieldCheck size={14} className="text-emerald-500 fill-emerald-500/10" />
                )}
              </div>
              <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{opportunity.profiles?.occupation || (isRtl ? 'בעל מקצוע' : 'Professional')}</p>
            </div>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {showActions && (
              <div className="flex items-center gap-0.5 sm:gap-1">
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    navigate(`/app/opportunities/${opportunity.id}/edit`);
                  }}
                  className="p-2 sm:p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
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
                    className="p-2 sm:p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            )}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm border border-slate-100">
              <ArrowRight size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
