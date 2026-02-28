import { useState, useEffect } from 'react';
import { ShieldCheck, Users, AlertTriangle, History, Trash2, Ban, CheckCircle, Info, Clock, Hammer, ShieldAlert, TrendingUp, UserCheck, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { adminService, userService } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const isHe = lang === 'he';

  const [stats, setStats] = useState<any>(null);
  const [pendingMentors, setPendingMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, mentorsRes] = await Promise.all([
        adminService.getStats(),
        userService.searchUsers({ role: 'mentor', verified: 0 })
      ]);
      setStats(statsRes.data);
      setPendingMentors(mentorsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast(isHe ? 'שגיאה בטעינת נתוני מנהל' : 'Error loading admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      await adminService.verifyUser(id, verified);
      showToast(isHe ? 'הסטטוס עודכן בהצלחה' : 'Status updated successfully', 'success');
      fetchAdminData();
    } catch (error) {
      console.error('Error verifying user:', error);
      showToast(isHe ? 'שגיאה בעדכון הסטטוס' : 'Error updating status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-black tracking-tight">
            {isHe ? 'לוח בקרה מנהל' : 'Admin Dashboard'}
          </h1>
          <p className="text-gray-400 font-medium">
            {isHe ? 'נהל את המשתמשים, האימותים והסטטיסטיקות של הפלטפורמה.' : 'Manage platform users, verifications, and statistics.'}
          </p>
        </div>
        <div className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
          <ShieldAlert size={18} />
          <span className="text-xs font-black uppercase tracking-widest">
            {isHe ? 'מצב מנהל פעיל' : 'Admin Mode Active'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: isHe ? 'משתמשים' : 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: isHe ? 'מנטורים מאומתים' : 'Verified Mentors', value: stats?.verifiedMentors || 0, icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600' },
          { label: isHe ? 'ממתינים לאימות' : 'Pending', value: stats?.pendingVerifications || 0, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
          { label: isHe ? 'פוסטים' : 'Total Posts', value: stats?.totalPosts || 0, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="linkedin-card p-8 flex flex-col items-center text-center group hover:shadow-xl transition-all">
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div className="text-3xl font-black text-black mb-1">{stat.value}</div>
            <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Verification Queue */}
        <div className="linkedin-card p-8">
          <h2 className="text-2xl font-black text-black mb-8 flex items-center gap-3">
            <UserCheck size={24} />
            {isHe ? 'בקשות אימות ממתינות' : 'Pending Verifications'}
          </h2>
          
          {pendingMentors.length > 0 ? (
            <div className="space-y-4">
              {pendingMentors.map(v => (
                <div key={v.id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-black shadow-md">
                      {v.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black text-black">{v.name}</div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{v.trade} • {new Date(v.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleVerify(v.id, false)}
                      className="p-3 border-2 border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-all active:scale-95"
                    >
                      <X size={20} />
                    </button>
                    <button 
                      onClick={() => handleVerify(v.id, true)}
                      className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                    >
                      <CheckCircle size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-4 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
              <Clock className="mx-auto text-gray-200" size={48} />
              <p className="text-gray-400 font-medium italic">
                {isHe ? 'אין בקשות אימות ממתינות כרגע.' : 'No pending verifications at the moment.'}
              </p>
            </div>
          )}
        </div>

        {/* Recent Reports Placeholder */}
        <div className="linkedin-card p-8">
          <h2 className="text-2xl font-black text-black mb-8 flex items-center gap-3">
            <AlertTriangle size={24} />
            {isHe ? 'דיווחים אחרונים' : 'Recent Reports'}
          </h2>
          <div className="p-12 text-center space-y-4 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
            <CheckCircle className="mx-auto text-emerald-600" size={48} />
            <p className="text-gray-400 font-medium italic">
              {isHe ? 'אין דיווחים פתוחים. הכל נראה תקין!' : 'No open reports. Everything looks good!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
