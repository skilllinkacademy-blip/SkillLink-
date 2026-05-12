import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, MessageSquare, Search, Filter, MapPin, Clock, DollarSign, ArrowRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mentor_offer' | 'mentee_seeking'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecommended = async () => {
      if (!user || !profile) return;
      setLoadingRecs(true);
      try {
        const response = await api.get('/opportunities/recommended');
        const rawOpps = response.data;
        
        if (!Array.isArray(rawOpps)) {
          console.warn('Recommended opportunities response is not an array:', rawOpps);
          return;
        }

        // Use AI service to filter and score
        const { getAIOpportunityRecommendations } = await import('../services/aiService');
        const aiRecs = await getAIOpportunityRecommendations(profile, rawOpps);

        if (!Array.isArray(aiRecs)) {
          console.warn('AI recommendations did not return an array:', aiRecs);
          setRecommended([]);
          return;
        }

        const transformedData = aiRecs.map((opp: any) => ({
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
        setRecommended(transformedData);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoadingRecs(false);
      }
    };

    if (user && profile) fetchRecommended();
  }, [user, profile]);

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
        
        // Transform data to match frontend expectations if needed
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 sm:gap-8">
        <div className="space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
            SkillLink Marketplace
          </div>
          <h1 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {isRtl ? 'זירת ההתמחות' : 'The Apprenticeship Arena'}
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-lg">
            {isRtl ? 'מצא מנטור מומחה או חניך רציני לבניית העתיד המקצועי שלך.' : 'Find an expert Master or a serious Apprentice to build your professional future.'}
          </p>
        </div>
        {user && (
          <Link 
            to="/app/opportunities/new"
            className="w-full md:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Plus size={20} />
            {isRtl ? 'פרסם הצעה' : 'Post Opportunity'}
          </Link>
        )}
      </div>

      {/* Filters & Search - Moved up for better accessibility */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 sticky top-[4.5rem] z-40 bg-slate-50/80 backdrop-blur-md p-2 -mx-2 rounded-3xl">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={isRtl ? 'חפש מקצוע, מיקום או מיומנות...' : 'Search trade, location, or skill...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all font-medium shadow-sm outline-none text-sm sm:text-base"
          />
        </div>
        <div className="flex p-1 bg-slate-200/50 rounded-2xl border border-slate-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isRtl ? 'הכל' : 'All'}
          </button>
          <button
            onClick={() => setFilter('mentor_offer')}
            className={`px-6 py-2.5 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all ${
              filter === 'mentor_offer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isRtl ? 'מנטורים' : 'Masters'}
          </button>
          <button
            onClick={() => setFilter('mentee_seeking')}
            className={`px-6 py-2.5 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all ${
              filter === 'mentee_seeking' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isRtl ? 'מתלמדים' : 'Apprentices'}
          </button>
        </div>
      </div>

      {/* Radar Map Section */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <RadarMap isRtl={isRtl} opportunities={opportunities} />
      </div>

      {/* Opportunity Feed */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">
              {isRtl ? 'הזדמנויות בשבילך' : 'Opportunities for You'}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              {isRtl ? 'הזדמנויות אחרונות ומומלצות המותאמות אישית' : 'Latest and recommended matches tailored for you'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 bg-slate-50 rounded-[2.5rem] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div className="industrial-card p-24 text-center space-y-8">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
              <Briefcase className="text-slate-200" size={48} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {isRtl ? 'אין הזדמנויות כרגע' : 'No opportunities yet'}
              </h2>
              <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                {isRtl ? 'היה הראשון לפרסם הזדמנות בקהילה המקצועית שלך!' : 'Be the first to post an opportunity in your professional community!'}
              </p>
            </div>
            {user ? (
              <Link 
                to="/app/opportunities/new"
                className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3 mx-auto inline-flex"
              >
                <Plus size={24} />
                {isRtl ? 'צור פוסט ראשון' : 'Create First Post'}
              </Link>
            ) : (
              <Link 
                to="/auth?mode=login"
                className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3 mx-auto inline-flex"
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
