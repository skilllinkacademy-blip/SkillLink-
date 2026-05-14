import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Search, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import OpportunityCard from '../components/OpportunityCard';

interface HomeProps {
  isRtl: boolean;
}

export default function Home({ isRtl }: HomeProps) {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mentor_offer' | 'mentee_seeking'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || !profile) return;
    const fetchRecommended = async () => {
      try {
        const { data: rawOpps } = await supabase
          .from('opportunities')
          .select('*, profiles!opportunities_owner_id_fkey(full_name, avatar_url, occupation, username, is_verified, role)')
          .eq('status', 'active')
          .neq('owner_id', user.id)
          .limit(20);
        if (!rawOpps?.length) return;
        const { getAIOpportunityRecommendations } = await import('../services/aiService');
        const aiRecs = await getAIOpportunityRecommendations(profile, rawOpps);
        setRecommended(Array.isArray(aiRecs) ? aiRecs : rawOpps);
      } catch {}
    };
    fetchRecommended();
  }, [user?.id, profile?.id]);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('opportunities')
          .select('*, profiles!opportunities_owner_id_fkey(full_name, avatar_url, occupation, username, is_verified, role)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(30);
        if (filter !== 'all') query = query.eq('type', filter);
        if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,profession.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
        const { data } = await query;
        setOpportunities(data || []);
      } catch {}
      finally { setLoading(false); }
    };
    const timer = setTimeout(fetchOpportunities, 300);
    return () => clearTimeout(timer);
  }, [filter, searchQuery]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">

      {/* Minimal header */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-xl font-bold text-slate-900">
          {isRtl ? 'הזדמנויות' : 'Opportunities'}
        </h1>
        {user && (
          <Link
            to="/app/opportunities/new"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <Plus size={14} />
            {isRtl ? 'פרסם' : 'Post'}
          </Link>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2 sticky top-14 z-40 bg-white/95 backdrop-blur-sm py-2 -my-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3" size={14} />
          <input
            type="text"
            placeholder={isRtl ? 'חיפוש לפי מקצוע, מיקום...' : 'Search by trade, location...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm transition-all"
          />
        </div>
        <div className="flex p-1 bg-slate-100 rounded-xl gap-0.5 shrink-0">
          {[
            { value: 'all',             labelHe: 'הכל',     labelEn: 'All'         },
            { value: 'mentor_offer',    labelHe: 'מנטורים', labelEn: 'Mentors'     },
            { value: 'mentee_seeking',  labelHe: 'חניכים',  labelEn: 'Apprentices' },
          ].map(({ value, labelHe, labelEn }) => (
            <button
              key={value}
              onClick={() => setFilter(value as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {isRtl ? labelHe : labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-52 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommended.length > 0 && searchQuery === '' && filter === 'all' && recommended.map((opp) => (
            <div key={`rec-${opp.id}`} className="relative">
              <div className="absolute -top-2 right-3 z-10 flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                <Zap size={8} className="fill-white" />
                {opp.matchScore}% {isRtl ? 'התאמה' : 'match'}
              </div>
              <OpportunityCard
                opportunity={{ ...opp, matchScore: opp.matchScore, aiReason: opp.aiReason }}
                isRtl={isRtl}
                currentUserId={user?.id}
              />
            </div>
          ))}
          {opportunities
            .filter(opp => searchQuery === '' && filter === 'all' ? !recommended.find(r => r.id === opp.id) : true)
            .map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} isRtl={isRtl} currentUserId={user?.id} />
            ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl p-14 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
            <Briefcase className="text-slate-300" size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">{isRtl ? 'אין הזדמנויות כרגע' : 'No opportunities yet'}</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {isRtl ? 'היה הראשון לפרסם הזדמנות בקהילה!' : 'Be the first to post an opportunity!'}
            </p>
          </div>
          {user ? (
            <Link to="/app/opportunities/new" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95">
              <Plus size={14} />
              {isRtl ? 'צור פוסט ראשון' : 'Create First Post'}
            </Link>
          ) : (
            <Link to="/auth?mode=login" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all active:scale-95">
              {isRtl ? 'התחבר לפרסום' : 'Sign in to Post'}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
