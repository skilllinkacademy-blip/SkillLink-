import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Filter, ArrowRight, ShieldCheck, Zap, X, SlidersHorizontal } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
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

      const { data } = await query.order('updated_at', { ascending: false }).limit(50);
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
    } catch (err) {
      console.error('Error searching profiles:', err);
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
      <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
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

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-bold text-slate-900">{results.length}</span> {isRtl ? 'תוצאות' : 'results'}
        </p>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-36 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((p) => (
            <Link
              key={p.id}
              to={`/app/u/${p.username || p.id}`}
              className="bg-white border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:shadow-md transition-all group flex gap-4 items-start"
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-base overflow-hidden">
                  {p.avatar_url
                    ? <img src={resolveAsset(p.avatar_url) || ''} alt={p.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : p.full_name?.charAt(0) || 'U'}
                </div>
                {isRecentlyActive(p.updated_at) && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">{p.full_name}</span>
                      {p.is_verified && <ShieldCheck size={13} className="text-emerald-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{p.occupation || (isRtl ? 'בעל מקצוע' : 'Professional')}</p>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    p.role === 'mentor'
                      ? 'bg-slate-900 text-white'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {isRtl ? (p.role === 'mentor' ? 'מנטור' : 'חניך') : (p.role === 'mentor' ? 'Master' : 'Apprentice')}
                  </span>
                </div>

                {p.aiReason ? (
                  <p className="text-xs text-emerald-700 mt-1.5 line-clamp-2 leading-relaxed">
                    <Zap size={10} className="inline mr-0.5 fill-emerald-500 text-emerald-500" />
                    {p.aiReason}
                  </p>
                ) : p.bio ? (
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{p.bio}</p>
                ) : null}

                <div className="flex items-center gap-3 mt-2">
                  {p.city && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin size={10} /> {p.city}
                    </span>
                  )}
                  {p.years_experience ? (
                    <span className="text-[11px] text-slate-400">{p.years_experience}y exp</span>
                  ) : null}
                  {p.aiScore > 0 && (
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      <Zap size={9} className={p.aiScore > 80 ? 'fill-emerald-500 text-emerald-500' : 'text-slate-400'} />
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
