import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, AlertCircle, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import OpportunityCard from '../components/OpportunityCard';

interface MyOpportunitiesProps {
  isRtl: boolean;
}

export default function MyOpportunities({ isRtl }: MyOpportunitiesProps) {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyOpportunities = async () => {
    if (!user) return;
    try {
      const response = await api.get('/opportunities/me');
      
      // Transform data to match frontend expectations
      const transformedData = response.data.map((opp: any) => ({
        ...opp,
        owner_id: opp.ownerId,
        image_url: opp.imageUrl,
        work_hours: opp.workHours,
        pay_amount: opp.payAmount,
        pay_period: opp.payPeriod,
        about_work: opp.aboutWork,
        profiles: {
          full_name: opp.ownerName,
          avatar_url: opp.ownerAvatar,
          occupation: opp.ownerTrade,
          username: opp.ownerUsername
        }
      }));
      
      setOpportunities(transformedData);
    } catch (err: any) {
      console.error('Error fetching my opportunities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOpportunities();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(isRtl ? 'האם אתה בטוח שברצונך למחוק הזדמנות זו?' : 'Are you sure you want to delete this opportunity?')) return;
    
    try {
      await api.delete(`/opportunities/${id}`);
      setOpportunities(opportunities.filter(o => o.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {isRtl ? 'ההזדמנויות שלי' : 'My Opportunities'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isRtl ? 'נהל את הפרסומים שלך בקהילה.' : 'Manage your community posts.'}
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-medium animate-shake">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
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
                showActions={true}
                onDelete={handleDelete}
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
              {isRtl ? 'עדיין לא פרסמת כלום' : 'You haven\'t posted anything yet'}
            </h2>
            <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
              {isRtl ? 'זה הזמן לשתף את הקהילה בידע שלך או בחיפוש שלך.' : 'Now is the time to share your knowledge or your search with the community.'}
            </p>
          </div>
          <Link 
            to="/app/opportunities/new"
            className="px-10 py-4 bg-black text-white rounded-full font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 mx-auto inline-flex"
          >
            <Plus size={20} />
            {isRtl ? 'פרסם עכשיו' : 'Post Now'}
          </Link>
        </div>
      )}
    </div>
  );
}
