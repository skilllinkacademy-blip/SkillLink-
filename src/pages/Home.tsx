import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, MessageSquare, Search, Filter, MapPin, Clock, DollarSign, ArrowRight, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import OpportunityCard from '../components/OpportunityCard';

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
      let query = supabase
        .from('opportunities')
        .select('*, profiles(full_name, avatar_url, occupation, role, is_verified, username)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,about_work.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching opportunities:', error);
      } else {
        setOpportunities(data || []);
      }
      setLoading(false);
    };

    const timer = setTimeout(fetchOpportunities, 300);
    return () => clearTimeout(timer);
  }, [filter, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {isRtl ? 'הזדמנויות בקהילה' : 'Community Opportunities'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isRtl ? 'מצא את המנטור הבא שלך או מתלמד שרוצה ללמוד.' : 'Find your next mentor or an apprentice eager to learn.'}
          </p>
        </div>
        <Link 
          to="/app/opportunities/new"
          className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          {isRtl ? 'פרסם הזדמנות' : 'Post Opportunity'}
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={isRtl ? 'חפש לפי מקצוע, עיר או כותרת...' : 'Search by trade, city, or title...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium shadow-sm"
          />
        </div>
        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              filter === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            {isRtl ? 'הכל' : 'All'}
          </button>
          <button
            onClick={() => setFilter('mentor_offer')}
            className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              filter === 'mentor_offer' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            {isRtl ? 'מנטורים' : 'Mentors'}
          </button>
          <button
            onClick={() => setFilter('mentee_seeking')}
            className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              filter === 'mentee_seeking' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            {isRtl ? 'מתלמדים' : 'Apprentices'}
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 bg-gray-50 rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-24 text-center space-y-8 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Briefcase className="text-gray-200" size={48} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {isRtl ? 'אין הזדמנויות כרגע' : 'No opportunities yet'}
            </h2>
            <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
              {isRtl ? 'היה הראשון לפרסם הזדמנות בקהילה שלך!' : 'Be the first to post an opportunity in your community!'}
            </p>
          </div>
          <Link 
            to="/app/opportunities/new"
            className="px-10 py-4 bg-black text-white rounded-full font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 mx-auto inline-flex"
          >
            <Plus size={20} />
            {isRtl ? 'צור פוסט ראשון' : 'Create First Post'}
          </Link>
        </div>
      )}
    </div>
  );
}
