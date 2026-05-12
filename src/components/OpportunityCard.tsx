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
      {/* Image strip — only when image exists */}
      {imageUrl && (
        <div className="h-44 overflow-hidden relative flex-shrink-0">
          <img
            src={resolveAsset(imageUrl) || ''}
            alt={opportunity.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {matchScore > 0 && (
            <div className="absolute top-3 right-3 bg-white/95 text-slate-900 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Zap size={9} className={matchScore > 85 ? 'text-emerald-500 fill-emerald-500' : 'text-slate-400'} />
              {matchScore}%
            </div>
          )}
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div
              onClick={(e) => { e.stopPropagation(); navigate(profileLink); }}
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              {avatarUrl
                ? <img src={resolveAsset(avatarUrl) || ''} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : ownerName?.charAt(0) || 'U'}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-slate-900 truncate">{ownerName || (isRtl ? 'משתמש' : 'User')}</span>
                {isVerified && <ShieldCheck size={13} className="text-emerald-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-slate-400 truncate">{ownerOccupation || (isRtl ? 'בעל מקצוע' : 'Professional')}</p>
            </div>
          </div>

          {/* Type pill */}
          <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isMentorOffer
              ? 'bg-slate-900 text-white'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {isRtl ? (isMentorOffer ? 'מנטור' : 'חניך') : (isMentorOffer ? 'Master' : 'Apprentice')}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 -mt-1">
          {opportunity.title}
        </h3>

        {/* Snippet */}
        {snippet && (
          <p className={`text-sm text-slate-500 line-clamp-2 leading-relaxed ${aiReason ? 'text-emerald-700' : ''}`}>
            {aiReason && <Zap size={11} className="inline mr-1 text-emerald-500 fill-emerald-500" />}
            {snippet}
          </p>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 mt-auto pt-1">
          {location && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
              <MapPin size={10} className="text-slate-400" />
              {location}
            </span>
          )}
          {durationDescription && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
              <Clock size={10} className="text-slate-400" />
              {durationDescription}
            </span>
          )}
          {pay ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
              ₪{pay}/{payPeriod === 'hour' ? (isRtl ? 'שעה' : 'hr') : (isRtl ? 'יום' : 'day')}
            </span>
          ) : null}
          {matchScore > 0 && !imageUrl && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
              <Zap size={10} className={matchScore > 85 ? 'text-emerald-500 fill-emerald-500' : 'text-slate-400'} />
              {matchScore}% {isRtl ? 'התאמה' : 'match'}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
          <span className="text-[11px] text-slate-400">{daysAgo}</span>

          <div className="flex items-center gap-1">
            {showActions && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/app/opportunities/${opportunity.id}/edit`); }}
                  className="p-1.5 text-slate-300 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <Pencil size={15} />
                </button>
                {onDelete && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(opportunity.id); }}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </>
            )}
            <span className="text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors px-2">
              {isRtl ? 'פרטים ←' : 'View →'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
