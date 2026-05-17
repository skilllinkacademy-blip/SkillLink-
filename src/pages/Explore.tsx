import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Filter, ArrowRight, ShieldCheck, Zap, X, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resolveAsset } from '../lib/assets';

interface ExploreProps {
  isRtl: boolean;
}

const CATEGORIES = [
  { id: 'all', he: 'הכל', en: 'All' },
  { id: 'electrician', he: 'חשמל', en: 'Electrical' },
  { id: 'plumbing', he: 'אינסטלציה', en: 'Plumbing' },
  { id: 'carpentry', he: 'נגרות', en: 'Carpentry' },
  { id: 'construction', he: 'בנייה', en: 'Construction' },
  { id: 'hvac', he: 'מיזוג אוויר', en: 'HVAC' },
  { id: 'automotive', he: 'רכב', en: 'Automotive' },
  { id: 'tech', he: 'דיגיטל', en: 'Digital' },
  { id: 'welding', he: 'ריתוך', en: 'Welding' },
];

export default function Explore({ isRtl }: ExploreProps) {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'mentor' | 'mentee'>('all');
  const [experienceFilter, setExperienceFilter] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, username, occupation, city, bio, avatar_url, role, is_verified, years_experience, updated_at')
        .neq('role', 'admin');

      if (roleFilter !== 'all') query = query.eq('role', roleFilter);
      if (verifiedOnly) query = query.eq('is_verified', true);
      if (locationQuery) query = query.ilike('city', `%${locationQuery}%`);
      if (experienceFilter) query = query.gte('years_experience', experienceFilter);
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,occupation.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
      }
      if (categoryFilter !== 'all') {
        query = query.ilike('occupation', `%${categoryFilter}%`);
      }

      const { data, error: queryError } = await query.order('updated_at', { ascending: false }).limit(50);
      if (queryError) throw queryError;
      const rawResults = data || [];

      if (profile && rawResults.length > 0) {
        try {
          const { getAIProfileRecommendations } = await import('../services/aiService');
          const aiResults = await getAIProfileRecommendations(profile, rawResults);
          setResults(aiResults);
        } catch {
          setResults(rawResults);
        }
      } else {
        setResults(rawResults);
      }
    } catch (err: any) {
      console.error('Error searching profiles:', err);
      setFetchError(isRtl ? 'שגיאה בטעינת הפרופילים. נסה שוב.' : 'Failed to load profiles. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchResults, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, locationQuery, roleFilter, experienceFilter, verifiedOnly, categoryFilter]);

  const isRecentlyActive = (updatedAt: string) => {
    return (Date.now() - new Date(updatedAt).getTime()) < 86400000;
  };

  const activeFilterCount = [
    roleFilter !== 'all',
    verifiedOnly,
    !!locationQuery,
    !!experienceFilter,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{isRtl ? 'חיפוש בקהילה' : 'Explore Community'}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{isRtl ? 'מצא מנטורים ומתלמדים לפי תחום ומיקום' : 'Find mentors and apprentices by trade and location'}</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={isRtl ? 'מקצוע, שם, תחום...' : 'Trade, name, specialty...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm font-medium transition-all"
          />
        </div>
        <div className="relative sm:w-48">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={isRtl ? 'עיר / אזור' : 'City / Region'}
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm font-medium transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
            showFilters || activeFilterCount > 0
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal size={15} />
          {isRtl ? 'סינון' : 'Filters'}
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Category chips */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar scroll-smooth snap-x"
          style={{ WebkitOverflowScrolling: 'touch' }}>

        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              categoryFilter === cat.id
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
            }`}
          >
            {isRtl ? cat.he : cat.en}
          </button>
        ))}
        </div>
        {/* Fade indicator — more chips available */}
        <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 h-full w-8 bg-gradient-to-l rtl:bg-gradient-to-r from-white to-transparent pointer-events-none" />
      </div>

      {/* Collapsible advanced filters */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-5 animate-in slide-in-from-top-2 duration-200">
          {/* Role */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRtl ? 'תפקיד' : 'Role'}</label>
            <div className="flex p-1 bg-slate-100 rounded-lg gap-0.5">
              {(['all', 'mentor', 'mentee'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    roleFilter === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {r === 'all' ? (isRtl ? 'הכל' : 'All') : r === 'mentor' ? (isRtl ? 'מנטור' : 'Mentor') : (isRtl ? 'חניך' : 'Apprentice')}
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRtl ? 'ניסיון מינימלי' : 'Min Experience'}</label>
            <select
              value={experienceFilter || ''}
              onChange={(e) => setExperienceFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">{isRtl ? 'הכל' : 'Any'}</option>
              <option value="1">1+ {isRtl ? 'שנים' : 'yrs'}</option>
              <option value="3">3+</option>
              <option value="5">5+</option>
              <option value="10">10+</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="flex flex-col justify-between gap-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-700">{isRtl ? 'מאומתים בלבד' : 'Verified only'}</span>
              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`w-11 h-6 rounded-full relative transition-colors ${verifiedOnly ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${verifiedOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
            <button
              onClick={() => { setRoleFilter('all'); setExperienceFilter(null); setVerifiedOnly(false); setCategoryFilter('all'); setSearchQuery(''); setLocationQuery(''); }}
              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors text-start"
            >
              {isRtl ? 'נקה הכל' : 'Clear all filters'}
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {fetchError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
          <AlertCircle size={18} className="shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Results count */}
      {!fetchError && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            <span className="font-bold text-slate-900">{results.length}</span> {isRtl ? 'תוצאות' : 'results'}
          </p>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 sm:h-36 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {results.map((p) => (
            <Link
              key={p.id}
              to={`/app/u/${p.username || p.id}`}
              className="bg-white border border-slate-100 rounded-xl p-3 sm:p-4 hover:border-slate-200 hover:shadow-md transition-all group flex flex-col sm:flex-row sm:gap-4 sm:items-start gap-2"
            >
              {/* Avatar + active dot */}
              <div className="relative flex-shrink-0 self-start sm:self-auto">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm sm:text-base overflow-hidden">
                  {p.avatar_url
                    ? <img src={resolveAsset(p.avatar_url) || ''} alt={p.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : p.full_name?.charAt(0) || 'U'}
                </div>
                {isRecentlyActive(p.updated_at) && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Name + role pill */}
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors leading-tight">{p.full_name}</span>
                      {p.is_verified && <ShieldCheck size={11} className="text-emerald-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400 truncate leading-tight">{p.occupation || (isRtl ? 'בעל מקצוע' : 'Professional')}</p>
                  </div>
                  <span className={`flex-shrink-0 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                    p.role === 'mentor'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {isRtl ? (p.role === 'mentor' ? 'מנטור' : 'חניך') : (p.role === 'mentor' ? 'Mentor' : 'Apprentice')}
                  </span>
                </div>

                {/* AI reason / bio — desktop only */}
                {p.aiReason ? (
                  <p className="hidden sm:block text-xs text-emerald-700 mt-1.5 line-clamp-2 leading-relaxed">
                    <Zap size={10} className="inline mr-0.5 fill-emerald-500 text-emerald-500" />
                    {p.aiReason}
                  </p>
                ) : p.bio ? (
                  <p className="hidden sm:block text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{p.bio}</p>
                ) : null}

                {/* Location + exp */}
                <div className="flex items-center gap-2 mt-1.5">
                  {p.city && (
                    <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                      <MapPin size={9} /> <span className="truncate max-w-[50px] sm:max-w-none">{p.city}</span>
                    </span>
                  )}
                  {p.years_experience ? (
                    <span className="text-[10px] text-slate-400 hidden sm:inline">{p.years_experience}y</span>
                  ) : null}
                  {p.aiScore > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full ml-auto">
                      <Zap size={8} className={p.aiScore > 80 ? 'fill-emerald-500 text-emerald-500' : 'text-slate-400'} />
                      {p.aiScore}%
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
            <SearchIcon className="text-slate-300" size={28} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{isRtl ? 'אין תוצאות' : 'No results found'}</h3>
            <p className="text-sm text-slate-400 mt-1">{isRtl ? 'נסה לשנות את מילות החיפוש או הסינון' : 'Try adjusting your search or filters'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
