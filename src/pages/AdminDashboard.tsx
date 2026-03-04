import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  Check, 
  X, 
  Loader2,
  User,
  Clock,
  Search
} from 'lucide-react';

interface VerificationRequest {
  id: string;
  user_id: string;
  document_url: string; // כאן מאוחסן כרגע רק השם/הנתיב של הקובץ
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
    occupation: string;
  };
}

export default function AdminDashboard({ isRtl }: { isRtl: boolean }) {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('mentor_verifications')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            avatar_url,
            occupation
          )
        `)
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'pending');
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setRequests((data as any) || []);
    } catch (err: any) {
      console.error('Error fetching verification requests:', err);
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('mentor_verifications')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      setRequests(prev => prev.filter(req => req.id !== id || filter === 'all'));
    } catch (err) {
      console.error('Error updating verification status:', err);
      alert(isRtl ? 'שגיאה בעדכון הסטטוס' : 'Error updating status');
    } finally {
      setProcessingId(null);
    }
  };

  // פונקציה שיוצרת Signed URL לקובץ בבאקט mentor_id_docs
  const getSignedDocumentUrl = async (path: string) => {
    try {
      // אם כבר יש URL מלא (מתחיל ב‑http), פשוט נחזיר אותו
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }

      const { data, error } = await supabase.storage
        .from('mentor_id_docs')
        .createSignedUrl(path, 60 * 60); // שעה תוקף

      if (error || !data?.signedUrl) {
        console.error('Error creating signed URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (e) {
      console.error('Error creating signed URL:', e);
      return null;
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <ShieldAlert size={64} className="text-red-500" />
        <h1 className="text-2xl font-black text-black">
          {isRtl ? 'אין לך הרשאות לצפות בדף זה' : 'Unauthorized Access'}
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-black flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={40} />
            {isRtl ? 'ניהול אימותי מנטורים' : 'Mentor Verification Management'}
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            {isRtl ? 'סקור ואשר בקשות אימות של מנטורים חדשים' : 'Review and approve verification requests from new mentors'}
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => fetchRequests()}
            className="p-2 text-gray-400 hover:text-black transition-colors mr-2"
            title={isRtl ? 'רענן' : 'Refresh'}
          >
            <Loader2 className={loading ? 'animate-spin' : ''} size={20} />
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
              filter === 'pending' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            {isRtl ? 'ממתינים' : 'Pending'}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
              filter === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            {isRtl ? 'הכל' : 'All'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
          <ShieldAlert size={18} />
          {error}
          <button onClick={() => fetchRequests()} className="ml-auto underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-[3rem] border border-gray-100 p-20 text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-black text-black">
            {isRtl ? 'אין בקשות ממתינות' : 'No pending requests'}
          </h3>
          <p className="text-gray-500 font-medium">
            {isRtl ? 'כל הבקשות טופלו בהצלחה.' : 'All requests have been processed.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-black flex items-center justify-center text-white font-black text-2xl overflow-hidden shrink-0">
                  {req.profiles?.avatar_url ? (
                    <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-black">{req.profiles?.full_name || 'Unknown User'}</h3>
                  <p className="text-gray-500 font-bold">@{req.profiles?.username || 'unknown'}</p>
                  <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    <Clock size={14} />
                    {new Date(req.created_at).toLocaleDateString(isRtl ? 'he-IL' : 'en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <button
                  type="button"
                  onClick={async () => {
                    const url = await getSignedDocumentUrl(req.document_url);
                    if (!url) {
                      alert(isRtl ? 'לא ניתן לפתוח את המסמך' : 'Could not open document');
                      return;
                    }
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
                >
                  <ExternalLink size={16} />
                  {isRtl ? 'צפה במסמך' : 'View Document'}
                </button>

                {req.status === 'pending' && (
                  <div className="flex items-center gap-2 ml-auto md:ml-0">
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'approved')}
                      disabled={!!processingId}
                      className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all disabled:opacity-50"
                      title={isRtl ? 'אשר' : 'Approve'}
                    >
                      {processingId === req.id ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'rejected')}
                      disabled={!!processingId}
                      className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all disabled:opacity-50"
                      title={isRtl ? 'דחה' : 'Reject'}
                    >
                      {processingId === req.id ? <Loader2 className="animate-spin" size={20} /> : <X size={20} />}
                    </button>
                  </div>
                )}

                {req.status !== 'pending' && (
                  <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                    req.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {req.status === 'approved' ? (isRtl ? 'מאושר' : 'Approved') : (isRtl ? 'נדחה' : 'Rejected')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
