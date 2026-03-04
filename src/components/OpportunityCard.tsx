import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, GraduationCap, Trash2, ExternalLink } from 'lucide-react';

interface Opportunity {
  id: string;
  type: 'mentor_offer' | 'mentee_seeking';
  title: string;
  location: string;
  work_hours: string;
  pay_amount?: number;
  pay_period?: string;
  desired_salary?: number;
  beginners_only: boolean;
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

  return (
    <Link 
      to={`/app/opportunities/${opportunity.id}`}
      className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full relative block"
    >
      {/* Image Header */}
      <div className="h-56 bg-gray-50 relative overflow-hidden">
        {opportunity.image_url ? (
          <img 
            src={opportunity.image_url} 
            alt={opportunity.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
            {isMentorOffer ? <Briefcase size={64} strokeWidth={1.5} /> : <GraduationCap size={64} strokeWidth={1.5} />}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Type Badge */}
        <div className={`absolute top-6 ${isRtl ? 'right-6' : 'left-6'} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${
          isMentorOffer ? 'bg-blue-600/90 text-white' : 'bg-emerald-600/90 text-white'
        }`}>
          {isRtl ? (isMentorOffer ? 'הצעת מנטור' : 'חניך מחפש') : (isMentorOffer ? 'Mentor Offer' : 'Mentee Seeking')}
        </div>

        {opportunity.beginners_only && (
          <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} px-4 py-1.5 bg-white/90 backdrop-blur-md text-gray-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20`}>
            {isRtl ? 'מתחילים בלבד' : 'Beginners Only'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
              {opportunity.title}
            </h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <MapPin size={14} />
                <span>{opportunity.location || (isRtl ? 'לא צוין מיקום' : 'No location')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <Clock size={14} />
                <span>{opportunity.work_hours || (isRtl ? 'גמיש' : 'Flexible')}</span>
              </div>
              {opportunity.availability_days && (
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>
                    {Array.isArray(opportunity.availability_days) 
                      ? opportunity.availability_days.join(', ') 
                      : opportunity.availability_days}
                  </span>
                </div>
              )}
            </div>
          </div>

          {(opportunity.pay_amount || opportunity.desired_salary) && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl text-sm font-black shadow-sm border border-blue-100">
              <DollarSign size={16} strokeWidth={2.5} />
              <span>
                {isMentorOffer 
                  ? `${opportunity.pay_amount} / ${opportunity.pay_period === 'hour' ? (isRtl ? 'שעה' : 'hr') : opportunity.pay_period === 'day' ? (isRtl ? 'יום' : 'day') : (isRtl ? 'חודש' : 'mo')}`
                  : `${isRtl ? 'שכר מבוקש:' : 'Desired:'} ${opportunity.desired_salary}`}
              </span>
            </div>
          )}

          <p className="text-sm text-gray-500 font-medium line-clamp-3 leading-relaxed">
            {isMentorOffer ? (opportunity.about_work || opportunity.who_i_want_to_teach) : opportunity.what_i_want_to_learn}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-sm overflow-hidden shadow-inner">
              {opportunity.profiles?.avatar_url ? (
                <img src={opportunity.profiles.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                opportunity.profiles?.full_name?.charAt(0) || 'U'
              )}
            </div>
            <div className="text-xs">
              <p className="font-black text-gray-900">{opportunity.profiles?.full_name || (isRtl ? 'משתמש' : 'User')}</p>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{opportunity.profiles?.occupation || (isRtl ? 'חבר קהילה' : 'Member')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showActions && onDelete && (
              <button 
                onClick={(e) => { e.preventDefault(); onDelete(opportunity.id); }}
                className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title={isRtl ? 'מחיקה' : 'Delete'}
              >
                <Trash2 size={20} />
              </button>
            )}
            <div className="p-3 bg-gray-50 text-gray-900 rounded-xl group-hover:bg-black group-hover:text-white transition-all shadow-sm">
              <ExternalLink size={20} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
