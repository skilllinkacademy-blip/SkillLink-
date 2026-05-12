import React, { useState, useEffect } from 'react';
import { Heart, Briefcase, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import OpportunityCard from '../components/OpportunityCard';

interface SavedProps {
  isRtl: boolean;
}

export default function Saved({ isRtl }: SavedProps) {
  const { user, refreshSavedCount } = useAuth();
  const navigate = useNavigate();
  const [savedOpportunities, setSavedOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('saved_opportunities')
        .select('opportunity_id, opportunities(*, profiles!opportunities_owner_id_fkey(full_name, avatar_url, occupation, username, is_verified, role))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setSavedOpportunities((data || []).map((r: any) => r.opportunities).filter(Boolean));
    } catch (error) {
      console.error('Error fetching saved opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (id: string) => {
    if (!user) return;
    await supabase.from('saved_opportunities').delete().eq('opportunity_id', id).eq('user_id', user.id);
    setSavedOpportunities(prev => prev.filter(opp => opp.id !== id));
    refreshSavedCount();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{isRtl ? 'הזדמנויות שמורות' : 'Saved Opportunities'}</h1>
          <p className="text-sm text-slate-400">{isRtl ? 'כל מה שסימנת לעיון מאוחר יותר' : 'Everything you bookmarked for later'}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-56 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : savedOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              isRtl={isRtl}
              currentUserId={user?.id}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center space-y-4">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
            <Heart className="text-slate-200" size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{isRtl ? 'עדיין לא שמרת כלום' : 'Nothing saved yet'}</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              {isRtl ? 'לחץ על הלב בכל הזדמנות כדי לשמור אותה כאן.' : 'Tap the heart on any opportunity to save it here.'}
            </p>
          </div>
          <Link
            to="/app/opportunities"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
          >
            <Briefcase size={16} />
            {isRtl ? 'גלה הזדמנויות' : 'Explore Opportunities'}
          </Link>
        </div>
      )}
    </div>
  );
}
