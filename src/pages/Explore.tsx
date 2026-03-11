import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Filter, Star, Briefcase, ArrowRight, X, ChevronDown, User, ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import { Link } from 'react-router-dom';

interface ExploreProps {
  isRtl: boolean;
}

export default function Explore({ isRtl }: ExploreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'mentor' | 'mentee'>('all');
  const [experienceFilter, setExperienceFilter] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await api.get('/search', {
        params: {
          q: searchQuery,
          location: locationQuery,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          experience: experienceFilter || undefined,
          verified: verifiedOnly || undefined
        }
      });
      
      setResults(response.data || []);
    } catch (err) {
      console.error('Error searching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchResults, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, locationQuery, roleFilter, experienceFilter, verifiedOnly]);

  const isRecentlyActive = (updatedAt: string) => {
    const lastActive = new Date(updatedAt);
    const now = new Date();
    const diffInHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Search Header */}
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-black tracking-tight">
            {isRtl ? 'חיפוש בקהילה' : 'Search Community'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isRtl ? 'מצא מנטורים ומתלמדים לפי תחום עיסוק ומיקום.' : 'Find mentors and apprentices by occupation and location.'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-[2] relative group">
            <SearchIcon className={`absolute ${isRtl ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors`} size={20} />
            <input 
              type="text" 
              placeholder={isRtl ? 'מקצוע / תחום התמחות' : 'Trade / Specialty'}
              className={`w-full ${isRtl ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all font-bold shadow-sm outline-none text-slate-900`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 relative group">
            <MapPin className={`absolute ${isRtl ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors`} size={20} />
            <input 
              type="text" 
              placeholder={isRtl ? 'עיר / אזור' : 'City / Region'}
              className={`w-full ${isRtl ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all font-bold shadow-sm outline-none text-slate-900`}
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 border shadow-sm ${
              isFilterOpen ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter size={18} />
            {isRtl ? 'סינון' : 'Filters'}
          </button>
        </div>

        {/* Collapsible Filters */}
        {isFilterOpen && (
          <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-10 animate-in slide-in-from-top duration-300">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{isRtl ? 'תפקיד' : 'Role'}</label>
              <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <button 
                  onClick={() => setRoleFilter('all')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${roleFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  {isRtl ? 'הכל' : 'All'}
                </button>
                <button 
                  onClick={() => setRoleFilter('mentor')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${roleFilter === 'mentor' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  {isRtl ? 'מנטור' : 'Mentor'}
                </button>
                <button 
                  onClick={() => setRoleFilter('mentee')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${roleFilter === 'mentee' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  {isRtl ? 'מתלמד' : 'Apprentice'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{isRtl ? 'מינימום שנות ניסיון' : 'Min Years Experience'}</label>
              <select 
                value={experienceFilter || ''} 
                onChange={(e) => setExperienceFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-6 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
              >
                <option value="">{isRtl ? 'הכל' : 'All'}</option>
                <option value="1">1+</option>
                <option value="3">3+</option>
                <option value="5">5+</option>
                <option value="10">10+</option>
              </select>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6">
              <div className="flex items-center gap-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'מאומתים בלבד' : 'Verified Only'}</label>
                <button 
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`w-14 h-7 rounded-full transition-all relative ${verifiedOnly ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${isRtl ? (verifiedOnly ? 'left-1' : 'right-1') : (verifiedOnly ? 'right-1' : 'left-1')}`} />
                </button>
              </div>
              <button 
                onClick={() => {
                  setRoleFilter('all');
                  setExperienceFilter(null);
                  setVerifiedOnly(false);
                  setSearchQuery('');
                  setLocationQuery('');
                }}
                className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline px-2"
              >
                {isRtl ? 'נקה הכל' : 'Clear All'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-8">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{isRtl ? 'תוצאות' : 'Results'}</h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-6 py-2 rounded-full border border-slate-200">
            {results.length} {isRtl ? 'תוצאות' : 'Results'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-slate-50 rounded-[2.5rem] animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((profile) => (
              <Link 
                key={profile.id}
                to={`/app/u/${profile.username}`}
                className="industrial-card p-8 group relative overflow-hidden flex flex-col h-full"
              >
                {isRecentlyActive(profile.updated_at) && (
                  <div className={`absolute top-8 ${isRtl ? 'left-8' : 'right-8'} flex items-center gap-2`}>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{isRtl ? 'פעיל כעת' : 'Online'}</span>
                  </div>
                )}
                
                <div className="relative z-10 space-y-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-3xl overflow-hidden border border-slate-200 group-hover:scale-105 transition-transform">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        profile.full_name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">{profile.full_name}</h3>
                        {(profile.is_verified || profile.verification_status === 'approved') && (
                          <ShieldCheck size={18} className="text-emerald-600 fill-emerald-500/10" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{profile.occupation || (isRtl ? 'בעל מקצוע' : 'Professional')}</p>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <MapPin size={14} className="text-slate-300" />
                      <span>{profile.location || (isRtl ? 'לא צוין מיקום' : 'No location')}</span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium line-clamp-3 leading-relaxed">
                      {profile.bio || (isRtl ? 'אין ביוגרפיה עדיין...' : 'No bio yet...')}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                      profile.role === 'mentor' ? 'bg-slate-900 text-white border-slate-900' : 'bg-emerald-600 text-white border-emerald-600'
                    }`}>
                      {isRtl ? (profile.role === 'mentor' ? 'מנטור' : 'מתלמד') : (profile.role === 'mentor' ? 'Master' : 'Apprentice')}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-100">
                      <ArrowRight size={20} className="rtl:rotate-180" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="industrial-card p-24 text-center space-y-8">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
              <SearchIcon className="text-slate-200" size={48} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{isRtl ? 'אין תוצאות' : 'No results found'}</h2>
              <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                {isRtl ? 'נסה לשנות את מילות החיפוש או הסינון כדי למצוא את ההתאמה המושלמת בקהילה.' : 'Try adjusting your filters or search terms to find the perfect match in the SkillLink community.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
