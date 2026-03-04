import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Filter, Star, Briefcase, ArrowRight, X, ChevronDown, User, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface ExploreProps {
  isRtl: boolean;
}

export default function Explore({ isRtl }: ExploreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'mentor' | 'mentee'>('all');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,occupation.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
      }

      if (locationQuery) {
        query = query.ilike('location', `%${locationQuery}%`);
      }

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Error searching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchResults, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, locationQuery, roleFilter]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Search Header */}
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-black tracking-tight">
            {isRtl ? 'חיפוש בקהילה' : 'Search Community'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isRtl ? 'מצא מנטורים וחניכים לפי תחום עיסוק ומיקום.' : 'Find mentors and mentees by occupation and location.'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-[2] relative group">
            <SearchIcon className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors`} size={20} />
            <input 
              type="text" 
              placeholder={isRtl ? 'מקצוע / תחום התמחות' : 'Trade / Specialty'}
              className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium shadow-sm`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 relative group">
            <MapPin className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors`} size={20} />
            <input 
              type="text" 
              placeholder={isRtl ? 'עיר / אזור' : 'City / Region'}
              className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium shadow-sm`}
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 border shadow-sm ${
              isFilterOpen ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-100 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            {isRtl ? 'סינון' : 'Filters'}
          </button>
        </div>

        {/* Collapsible Filters */}
        {isFilterOpen && (
          <div className="p-8 bg-gray-50 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top duration-200">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'תפקיד' : 'Role'}</label>
              <div className="flex p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                <button 
                  onClick={() => setRoleFilter('all')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${roleFilter === 'all' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
                >
                  {isRtl ? 'הכל' : 'All'}
                </button>
                <button 
                  onClick={() => setRoleFilter('mentor')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${roleFilter === 'mentor' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
                >
                  {isRtl ? 'מנטור' : 'Mentor'}
                </button>
                <button 
                  onClick={() => setRoleFilter('mentee')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${roleFilter === 'mentee' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
                >
                  {isRtl ? 'חניך' : 'Mentee'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-8">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-2xl font-black text-black tracking-tight">{isRtl ? 'תוצאות' : 'Results'}</h2>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full">
            {results.length} {isRtl ? 'תוצאות' : 'Results'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-50 rounded-3xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((profile) => (
              <Link 
                key={profile.id}
                to={`/app/u/${profile.username}`}
                className="bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-2xl overflow-hidden shadow-inner group-hover:scale-110 transition-transform">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        profile.full_name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{profile.full_name}</h3>
                      <p className="text-sm text-gray-500 font-bold">{profile.occupation || (isRtl ? 'חבר קהילה' : 'Community Member')}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                      <MapPin size={14} />
                      <span>{profile.location || (isRtl ? 'לא צוין מיקום' : 'No location')}</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">
                      {profile.bio || (isRtl ? 'אין ביוגרפיה עדיין...' : 'No bio yet...')}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      profile.role === 'mentor' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {isRtl ? (profile.role === 'mentor' ? 'מנטור' : 'חניך') : profile.role}
                    </span>
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all rtl:rotate-180" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-24 text-center space-y-8 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <SearchIcon className="text-gray-200" size={48} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-black tracking-tight">{isRtl ? 'אין תוצאות' : 'No results found'}</h2>
              <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                {isRtl ? 'נסה לשנות את מילות החיפוש או הסינון כדי למצוא את ההתאמה המושלמת.' : 'Try adjusting your filters or search terms to find the perfect match in the SkillLink community.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
