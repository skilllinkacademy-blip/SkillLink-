import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Edit2, Trash2, Eye, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import OpportunityCard from '../components/OpportunityCard';

interface MyOpportunitiesProps {
  isRtl: boolean;
}

export default function MyOpportunities({ isRtl }: MyOpportunitiesProps) {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('opportunities')
        .select('*, profiles!opportunities_owner_id_fkey(full_name, avatar_url, occupation, username, is_verified)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      setOpportunities(data || []);
      setLoading(false);
    };
    fetch();
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(isRtl ? 'האם אתה בטוח שברצונך למחוק הזדמנות זו?' : 'Are you sure you want to delete this opportunity?')) return;
    await supabase.from('opportunities').delete().eq('id', id).eq('owner_id', user!.id);
    setOpportunities(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{isRtl ? 'ההזדמנויות שלי' : 'My Opportunities'}</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isRtl ? `${opportunities.length} פרסומים פעילים` : `${opportunities.length} active posts`}
          </p>
        </div>
        <Link
          to="/app/opportunities/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors active:scale-95"
        >
          <Plus size={16} />
          {isRtl ? 'פרסם הזדמנות' : 'Post Opportunity'}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-56 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map(opp => (
            <div key={opp.id} className="relative group">
              <OpportunityCard
                opportunity={opp}
                isRtl={isRtl}
                showActions={true}
                onDelete={handleDelete}
              />
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={`/app/opportunities/${opp.id}/edit`}
                  className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  <Edit2 size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center space-y-4">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
            <Briefcase className="text-slate-200" size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{isRtl ? 'עדיין לא פרסמת כלום' : "No posts yet"}</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              {isRtl ? 'שתף את הקהילה בידע שלך או בחיפוש שלך.' : 'Share your knowledge or search with the community.'}
            </p>
          </div>
          <Link
            to="/app/opportunities/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus size={16} />
            {isRtl ? 'פרסם עכשיו' : 'Post Now'}
          </Link>
        </div>
      )}
    </div>
  );
}
