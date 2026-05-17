import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Briefcase, GraduationCap, Trash2, ShieldCheck, Zap, Pencil, Heart } from 'lucide-react';
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
  profession?: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    occupation?: string;
    location?: string;
    is_verified?: boolean;
    username?: string;
    role?: string;
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
  const payAmount = opportunity.pay_amount || opportunity.payAmount;
  const payPeriod = opportunity.pay_period || opportunity.payPeriod;
  const desiredSalary = opportunity.desired_salary || opportunity.desiredSalary;
  const aboutWork = opportunity.about_work || opportunity.aboutWork;
  const whatIWantToLearn = opportunity.what_i_want_to_learn || opportunity.whatIWantToLearn;
  const durationDescription = opportunity.duration_description || opportunity.durationDescription;
  const aiReason = opportunity.aiReason || opportunity.ai_reason;

  const matchScore = useMemo(() => {
    if (opportunity.matchScore !== undefined) return opportunity.matchScore;
    if (opportunity.match_score !== undefined) return opportunity.match_score;
    const { score } = calculateMatchScore(opportunity, myProfile, isRtl);
    return score;
  }, [opportunity, myProfile, isRtl]);

  const pay = payAmount || desiredSalary;
  const snippet = aiReason || (isMentorOffer ? aboutWork : whatIWantToLearn);
  const location = opportunity.location || opportunity.profiles?.location;
  const ownerName = opportunity.profiles?.full_name;
  const ownerOccupation = opportunity.profiles?.occupation || opportunity.profession;
  const isVerified = opportunity.profiles?.is_verified;
  const avatarUrl = opportunity.profiles?.avatar_url;
  const profileLink = `/app/u/${opportunity.ownerSupabaseId || opportunity.ownerUsername || opportunity.profiles?.username}`;

  const daysAgo = useMemo(() => {
    const d = new Date(opportunity.created_at || opportunity.createdAt || '');
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return isRtl ? 'היום' : 'Today';
    if (diff === 1) return isRtl ? 'אתמול' : 'Yesterday';
    return isRtl ? `לפני ${diff} ימים` : `${diff}d ago`;
  }, [opportunity.created_at, isRtl]);

  return (
    <div
      onClick={() => navigate(`/app/opportunities/${opportunity.id}`)}
      className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
    >
      {/* Image strip */}
      {imageUrl ? (
        <div className="h-28 sm:h-40 overflow-hidden relative flex-shrink-0">
          <img
            src={resolveAsset(imageUrl) || ''}
            alt={opportunity.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {/* Overlay: avatar + type pill at bottom */}
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
            <div
              onClick={(e) => { e.stopPropagation(); navigate(profileLink); }}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-600 font-bold text-xs overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity shadow"
            >
              {avatarUrl
                ? <img src={resolveAsset(avatarUrl) || ''} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : ownerName?.charAt(0) || 'U'}
            </div>
            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border backdrop-blur-sm ${
              isMentorOffer
                ? 'bg-blue-600/90 text-white border-blue-500'
                : 'bg-emerald-600/90 text-white border-emerald-500'
            }`}>
              {isRtl ? (isMentorOffer ? 'מנטור' : 'חניך') : (isMentorOffer ? 'Mentor' : 'Apprentice')}
            </span>
          </div>
          {matchScore > 0 && (
            <div className="absolute top-2 right-2 bg-white/95 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
              <Zap size={8} className={matchScore > 85 ? 'text-emerald-500 fill-emerald-500' : 'text-slate-400'} />
              {matchScore}%
            </div>
          )}
        </div>
      ) : (
        /* No image: compact top strip with avatar + type */
        <div className="px-2.5 sm:px-4 pt-2.5 sm:pt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              onClick={(e) => { e.stopPropagation(); navigate(profileLink); }}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              {avatarUrl
                ? <img src={resolveAsset(avatarUrl) || ''} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : ownerName?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-900 truncate leading-tight">{ownerName || (isRtl ? 'משתמש' : 'User')}</span>
                {isVerified && <ShieldCheck size={11} className="text-emerald-500 flex-shrink-0" />}
              </div>
              <p className="text-[10px] text-slate-400 truncate leading-tight hidden sm:block">{ownerOccupation || (isRtl ? 'בעל מקצוע' : 'Professional')}</p>
            </div>
          </div>
          <span className={`flex-shrink-0 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
            isMentorOffer
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {isRtl ? (isMentorOffer ? 'מנטור' : 'חניך') : (isMentorOffer ? 'Mentor' : 'Apprentice')}
          </span>
        </div>
      )}

      <div className="p-2.5 sm:p-4 flex-1 flex flex-col gap-1.5 sm:gap-3">
        {/* Owner name when image exists (shown below image) */}
        {imageUrl && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-700 truncate">{ownerName || (isRtl ? 'משתמש' : 'User')}</span>
            {isVerified && <ShieldCheck size={10} className="text-emerald-500 flex-shrink-0" />}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
          {opportunity.title}
        </h3>

        {/* Snippet — 1 line mobile, 2 lines desktop */}
        {snippet && (
          <p className={`text-[11px] sm:text-xs line-clamp-1 sm:line-clamp-2 leading-relaxed ${aiReason ? 'text-emerald-700' : 'text-slate-500'}`}>
            {aiReason && <Zap size={9} className="inline mr-0.5 text-emerald-500 fill-emerald-500" />}
            {snippet}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-1 mt-auto pt-0.5">
          {location && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
              <MapPin size={9} className="text-slate-400" />
              <span className="truncate max-w-[60px] sm:max-w-none">{location}</span>
            </span>
          )}
          {pay ? (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
              ₪{pay}
              <span className="hidden sm:inline">/{payPeriod === 'hour' ? (isRtl ? 'שעה' : 'hr') : (isRtl ? 'יום' : 'day')}</span>
            </span>
          ) : null}
          {matchScore > 0 && !imageUrl && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
              <Zap size={9} className={matchScore > 85 ? 'text-emerald-500 fill-emerald-500' : 'text-slate-400'} />
              {matchScore}%
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1.5 sm:pt-2.5 border-t border-slate-100 mt-0.5">
          <span className="text-[10px] text-slate-400">{daysAgo}</span>
          <div className="flex items-center gap-1">
            {showActions && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/app/opportunities/${opportunity.id}/edit`); }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Pencil size={13} />
                </button>
                {onDelete && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(opportunity.id); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
