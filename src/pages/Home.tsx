import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Search, Zap, X, UserCircle, FileText, Users } from 'lucide-react';
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
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('skilllink_welcomed');
  });

  const dismissOnboarding = () => {
    localStorage.setItem('skilllink_welcomed', '1');
    setShowOnboarding(false);
  };

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

      {/* Onboarding banner — shown once, only if profile is incomplete */}
      {showOnboarding && user && (!profile?.bio || !profile?.avatar_url || !profile?.occupation) && (
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 60%)' }} />
          <button
            onClick={dismissOnboarding}
            className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
          >
            <X size={14} />
          </button>
          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">
                {isRtl ? `שלום, ${profile?.full_name?.split(' ')[0] || 'חבר'} 👋` : `Hey, ${profile?.full_name?.split(' ')[0] || 'there'} 👋`}
              </p>
              <h2 className="text-lg font-black leading-snug">
                {isRtl ? 'ברוך הבא ל-SkillLink. הנה איך מתחילים:' : 'Welcome to SkillLink. Here\'s how to start:'}
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: UserCircle, step: isRtl ? '1. מלא פרופיל' : '1. Complete profile', to: '/app/profile', color: 'bg-blue-500/20 border-blue-500/30' },
                { icon: FileText,   step: isRtl ? '2. פרסם הזדמנות' : '2. Post an opportunity', to: '/app/opportunities/new', color: 'bg-emerald-500/20 border-emerald-500/30' },
                { icon: Users,      step: isRtl ? '3. מצא מנטורים' : '3. Find mentors', to: '/app/explore', color: 'bg-purple-500/20 border-purple-500/30' },
              ].map(({ icon: Icon, step, to, color }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={dismissOnboarding}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${color} backdrop-blur-sm hover:scale-105 transition-transform text-center`}
                >
                  <Icon size={18} className="text-white/80" />
                  <span className="text-[10px] font-semibold text-white/80 leading-tight">{step}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 sm:h-52 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {recommended.length > 0 && searchQuery === '' && filter === 'all' && recommended.map((opp) => (
            <OpportunityCard
              key={`rec-${opp.id}`}
              opportunity={{ ...opp, matchScore: opp.matchScore, aiReason: opp.aiReason }}
              isRtl={isRtl}
              currentUserId={user?.id}
            />
          ))}
          {opportunities
            .filter(opp => searchQuery === '' && filter === 'all' ? !recommended.find(r => r.id === opp.id) : true)
            .map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} isRtl={isRtl} currentUserId={user?.id} />
            ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 space-y-5">
          {searchQuery ? (
            /* No search results */
            <div className="text-center space-y-3 py-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                <Search className="text-slate-300" size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 text-sm">
                  {isRtl ? `לא נמצאו תוצאות עבור "${searchQuery}"` : `No results for "${searchQuery}"`}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isRtl ? 'נסה מילים אחרות או שנה את הסינון' : 'Try different keywords or clear the filter'}
                </p>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {isRtl ? 'נקה חיפוש' : 'Clear search'}
              </button>
            </div>
          ) : (
            /* Empty community */
            <div className="text-center space-y-4 py-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                <Briefcase className="text-slate-300" size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 text-sm">
                  {isRtl ? 'הקהילה עוד מתחממת 🔥' : 'Community warming up 🔥'}
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  {isRtl ? 'היה הראשון לפרסם — כל קהילה גדולה התחילה מפוסט אחד.' : 'Be the first to post — every great community started with one post.'}
                </p>
              </div>
              {user ? (
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Link to="/app/opportunities/new" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95">
                    <Plus size={14} />
                    {isRtl ? 'פרסם ראשון' : 'Post first'}
                  </Link>
                  <Link to="/app/explore" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all active:scale-95">
                    {isRtl ? 'חפש אנשים' : 'Find people'}
                  </Link>
                </div>
              ) : (
                <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all active:scale-95">
                  {isRtl ? 'הצטרף והיה ראשון' : 'Join and be first'}
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
