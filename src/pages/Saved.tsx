import React, { useState, useEffect } from 'react';
import { Heart, Briefcase, Plus, ArrowLeft } from 'lucide-react';
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
        .select('opportunity_id, opportunities(*, profiles(full_name, avatar_url, occupation, username, is_verified, role))')
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
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8 sm:space-y-12 animate-in fade-in duration-500">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] sm:text-xs font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-[0.2em] group"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} className="rtl:rotate-180" />
        </div>
        {isRtl ? 'חזרה' : 'Back'}
      </button>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-600 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
          Personal Collection
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {isRtl ? 'הזדמנויות שמורות' : 'Saved Opportunities'}
        </h1>
        <p className="text-slate-500 font-medium text-sm sm:text-xl max-w-2xl">
          {isRtl ? 'כל ההזדמנויות ששמרת לעיון מאוחר יותר במקום אחד.' : 'All the opportunities you saved for later in one place.'}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[400px] bg-slate-50 rounded-[2.5rem] animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : savedOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {savedOpportunities.map((opp) => (
            <div key={opp.id} className="relative group">
              <OpportunityCard 
                opportunity={opp} 
                isRtl={isRtl} 
                currentUserId={user?.id}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="industrial-card p-16 sm:p-32 text-center space-y-8 sm:space-y-12">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-[2rem] sm:rounded-[3rem] flex items-center justify-center mx-auto border border-slate-100 shadow-inner">
            <Heart className="text-slate-200" size={60} strokeWidth={1} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'עדיין לא שמרת כלום' : 'No saved items yet'}
            </h2>
            <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed text-sm sm:text-base">
              {isRtl ? 'כשמשהו מעניין אותך, לחץ על הלב כדי לשמור אותו כאן.' : 'When something interests you, click the heart icon to save it here.'}
            </p>
          </div>
          <Link 
            to="/app/opportunities"
            className="px-10 sm:px-12 py-4 sm:py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-2xl hover:bg-slate-800 transition-all active:scale-95 inline-flex items-center gap-3"
          >
            <Briefcase size={20} />
            {isRtl ? 'גלה הזדמנויות' : 'Explore Opportunities'}
          </Link>
        </div>
      )}
    </div>
  );
}
