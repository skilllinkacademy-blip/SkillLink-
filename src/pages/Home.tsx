import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Search, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import OpportunityCard from '../components/OpportunityCard';
import ProductShowcase from '../components/ProductShowcase';

interface HomeProps {
  isRtl: boolean;
}

export default function Home({ isRtl }: HomeProps) {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mentor_offer' | 'mentee_seeking'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || !profile) return;
    const fetchRecommended = async () => {
      setLoadingRecs(true);
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
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoadingRecs(false);
      }
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
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchOpportunities, 300);
    return () => clearTimeout(timer);
  }, [filter, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Verification Banner for Mentors */}
      {profile?.role === 'mentor' && (profile?.verification_status === 'none' || profile?.verification_status === 'rejected') && (
        <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4 text-center sm:text-start">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-emerald-400" size={24} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-widest">
                {isRtl ? 'אמת את החשבון שלך' : 'Verify Your Account'}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                {isRtl 
                  ? 'מנטורים מאומתים מקבלים פי 5 יותר פניות וזוכים לאמון הקהילה.' 
                  : 'Verified mentors get 5x more responses and gain community trust.'}
              </p>
            </div>
          </div>
          <Link 
            to="/app/verify"
            className="w-full sm:w-auto px-8 py-3 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all text-center"
          >
            {isRtl ? 'התחל אימות עכשיו' : 'Start Verification'}
          </Link>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isRtl ? 'הזדמנויות התמחות' : 'Apprenticeship Feed'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isRtl ? 'מנטורים וחניכים מחפשים זה את זה' : 'Masters and apprentices looking for each other'}
          </p>
        </div>
        {user && (
          <Link
            to="/app/opportunities/new"
            className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <Plus size={16} />
            {isRtl ? 'פרסם' : 'Post'}
          </Link>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 sticky top-14 z-40 bg-slate-50/95 backdrop-blur-sm py-3 -my-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={isRtl ? 'חיפוש לפי מקצוע, מיקום...' : 'Search by trade, location...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm transition-all"
          />
        </div>
        <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200 gap-0.5">
          {[
            { value: 'all', labelHe: 'הכל', labelEn: 'All' },
            { value: 'mentor_offer', labelHe: 'מנטורים', labelEn: 'Masters' },
            { value: 'mentee_seeking', labelHe: 'חניכים', labelEn: 'Apprentices' },
          ].map(({ value, labelHe, labelEn }) => (
            <button
              key={value}
              onClick={() => setFilter(value as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filter === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {isRtl ? labelHe : labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Product Showcase Section */}
      <ProductShowcase isRtl={isRtl} />

      {/* Opportunity Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-56 bg-slate-100 rounded-xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : opportunities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Show recommended first if available and score is high */}
            {recommended.length > 0 && searchQuery === '' && filter === 'all' && (
              recommended.map((opp) => (
                <div key={`rec-${opp.id}`} className="relative group">
                  <div className="absolute -top-3 -right-3 z-10 bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg transform group-hover:scale-110 transition-transform">
                    {opp.matchScore}% Match
                  </div>
                  <OpportunityCard 
                    opportunity={{...opp, matchScore: opp.matchScore, aiReason: opp.aiReason}} 
                    isRtl={isRtl} 
                    currentUserId={user?.id}
                  />
                </div>
              ))
            )}
            
            {/* Show other opportunities, filtering out ones already shown in recommended if in default view */}
            {opportunities
              .filter(opp => {
                if (searchQuery === '' && filter === 'all') {
                  return !recommended.find(r => r.id === opp.id);
                }
                return true;
              })
              .map((opp) => (
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
          <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center space-y-4">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
              <Briefcase className="text-slate-200" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">{isRtl ? 'אין הזדמנויות כרגע' : 'No opportunities yet'}</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                {isRtl ? 'היה הראשון לפרסם הזדמנות בקהילה המקצועית שלך!' : 'Be the first to post an opportunity in your professional community!'}
              </p>
            </div>
            {user ? (
              <Link
                to="/app/opportunities/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
              >
                <Plus size={16} />
                {isRtl ? 'צור פוסט ראשון' : 'Create First Post'}
              </Link>
            ) : (
              <Link
                to="/auth?mode=login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all active:scale-95"
              >
                {isRtl ? 'התחבר לפרסום הצעה' : 'Sign in to Post'}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
