import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, MessageSquare, Search, Filter, MapPin, Clock, DollarSign, ArrowRight, ChevronDown, ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import OpportunityCard from '../components/OpportunityCard';
import RadarMap from '../components/RadarMap';

interface HomeProps {
  isRtl: boolean;
}

export default function Home({ isRtl }: HomeProps) {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mentor_offer' | 'mentee_seeking'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const response = await api.get('/opportunities', {
          params: {
            type: filter,
            q: searchQuery
          }
        });
        
        const transformedData = response.data.map((opp: any) => ({
          ...opp,
          profiles: {
            full_name: opp.ownerName,
            avatar_url: opp.ownerAvatar,
            occupation: opp.ownerTrade,
            role: opp.ownerRole,
            is_verified: opp.ownerVerified === 1,
            username: opp.ownerSupabaseId || opp.ownerUsername || opp.ownerName?.toLowerCase().replace(/\s+/g, '_')
          }
        }));
        
        setOpportunities(transformedData);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchOpportunities, 300);
    return () => clearTimeout(timer);
  }, [filter, searchQuery]);

  const filterOptions = [
    { value: 'all', label: isRtl ? 'הכל' : 'All' },
    { value: 'mentor_offer', label: isRtl ? 'מנטורים' : 'Masters' },
    { value: 'mentee_seeking', label: isRtl ? 'מתלמדים' : 'Apprentices' },
  ] as const;

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* Verification Banner */}
      {profile?.role === 'mentor' && (profile?.verification_status === 'none' || profile?.verification_status === 'rejected') && (
        <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-2xl animate-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-start">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-emerald-400" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest">
                {isRtl ? 'אמת את החשבון שלך' : 'Verify Your Account'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                {isRtl 
                  ? 'מנטורים מאומתים מקבלים פי 5 יותר פניות' 
                  : 'Verified mentors get 5x more responses'}
              </p>
            </div>
          </div>
          <Link 
            to="/app/verify"
            className="w-full sm:w-auto px-6 py-2.5 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all text-center shrink-0"
          >
            {isRtl ? 'התחל אימות' : 'Start Verification'}
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-[0.2em]">
            Professional Network
          </div>
          <h1 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isRtl ? 'זירת ההתמחות' : 'Apprenticeship Arena'}
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-base hidden sm:block">
            {isRtl ? 'מצא מנטור מומחה או חניך רציני לבניית העתיד המקצועי שלך.' : 'Find an expert Mentor or a serious Apprentice.'}
          </p>
        </div>
        {user && (
          <Link 
            to="/app/opportunities/new"
            className="shrink-0 px-4 sm:px-8 py-3 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">{isRtl ? 'פרסם הצעה' : 'Post Opportunity'}</span>
            <span className="sm:hidden">{isRtl ? 'פרסם' : 'Post'}</span>
          </Link>
        )}
      </div>

      {/* Radar Map */}
      <RadarMap isRtl={isRtl} opportunities={opportunities} />

      {/* Search + Filters */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
        {/* Search */}
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder={isRtl ? 'חפש מקצוע, מיקום...' : 'Search trade, location...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 sm:py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all font-medium shadow-sm outline-none text-sm"
          />
        </div>

        {/* Filter pills — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar sm:shrink-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-5 py-3 sm:py-3.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shrink-0 border ${
                filter === opt.value 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 sm:h-96 bg-slate-50 rounded-2xl sm:rounded-[2.5rem] animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {opportunities.map((opp) => (
            <div key={opp.id}>
              <OpportunityCard 
                opportunity={opp} 
                isRtl={isRtl} 
                currentUserId={user?.id}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="industrial-card p-10 sm:p-24 text-center space-y-6 sm:space-y-8">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
            <Briefcase className="text-slate-200" size={36} />
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'אין הזדמנויות כרגע' : 'No opportunities yet'}
            </h2>
            <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed text-sm sm:text-base">
              {isRtl ? 'היה הראשון לפרסם הזדמנות בקהילה שלך!' : 'Be the first to post an opportunity!'}
            </p>
          </div>
          {user ? (
            <Link 
              to="/app/opportunities/new"
              className="px-8 sm:px-12 py-4 sm:py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3 mx-auto w-fit"
            >
              <Plus size={20} />
              {isRtl ? 'צור פוסט ראשון' : 'Create First Post'}
            </Link>
          ) : (
            <Link 
              to="/auth?mode=login"
              className="px-8 sm:px-12 py-4 sm:py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3 mx-auto w-fit"
            >
              {isRtl ? 'התחבר לפרסום הצעה' : 'Sign in to Post'}
            </Link>
          )}
        </div>
      )}

      {/* Bottom spacer for mobile tab bar */}
      <div className="h-4 sm:h-0" />
    </div>
  );
}
