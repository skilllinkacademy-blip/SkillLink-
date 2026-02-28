import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Clock, FileText, Lock, ShieldAlert, Star, MessageSquare, Hammer, ArrowRight, X, ChevronRight, Users, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/ui/Modal';
import { requestService, userService } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const isHe = lang === 'he';
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, requestsRes] = await Promise.all([
        userService.getMe(),
        requestService.getMyRequests()
      ]);
      setUser(userRes.data);
      setRequests(requestsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast(isHe ? 'שגיאה בטעינת הנתונים' : 'Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      await requestService.updateRequestStatus(requestId, status);
      showToast(isHe ? 'הסטטוס עודכן בהצלחה' : 'Status updated successfully', 'success');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
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

  const isMentor = user?.role === 'mentor';

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-black tracking-tight">
            {isHe ? 'לוח הבקרה שלי' : 'My Dashboard'}
          </h1>
          <p className="text-gray-400 font-medium">
            {isHe ? 'נהל את בקשות ההתמחות וההתקדמות שלך.' : 'Manage your apprenticeship requests and progress.'}
          </p>
        </div>
        <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 flex items-center gap-3">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
          <span className="text-xs font-black text-black uppercase tracking-widest">
            {isHe ? 'מחובר כ' : 'Logged in as'} {isHe ? (isMentor ? 'מנטור' : 'חניך') : user?.role}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Requests Section */}
          <div className="linkedin-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-black flex items-center gap-3">
                <Users size={24} /> 
                {isHe ? 'בקשות התמחות' : 'Apprenticeship Requests'}
              </h2>
              <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {requests.length} {isHe ? 'בקשות' : 'Requests'}
              </span>
            </div>

            {requests.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Hammer className="text-gray-200" size={40} />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-black text-black">
                    {isHe ? 'אין בקשות פעילות' : 'No active requests'}
                  </h3>
                  <p className="text-gray-400 font-medium text-sm">
                    {isHe ? 'ברגע שתשלח או תקבל בקשת התמחות, היא תופיע כאן לניהול ומעקב.' : 'Once you send or receive an apprenticeship request, it will appear here for management.'}
                  </p>
                </div>
                <Link to="/explore" className="btn-primary px-10">
                  {isHe ? 'מצא מנטור' : 'Find a Mentor'}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req.id} className="p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-xl transition-all group">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white font-black shadow-lg shrink-0">
                          {(isMentor ? req.apprenticeName : req.mentorName)?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-black text-black text-lg">{isMentor ? req.apprenticeName : req.mentorName}</h4>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">{req.trade}</p>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <Clock size={14} />
                            {isHe ? 'התחלה ב:' : 'Starts:'} {new Date(req.startDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          req.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                          req.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {req.status}
                        </span>
                        {isMentor && req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleStatusUpdate(req.id, 'rejected')}
                              className="px-4 py-2 border-2 border-black text-black font-black text-xs rounded-xl hover:bg-black/5 transition-all"
                            >
                              {isHe ? 'דחה' : 'Decline'}
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(req.id, 'accepted')}
                              className="px-4 py-2 bg-black text-white font-black text-xs rounded-xl hover:bg-gray-800 transition-all shadow-lg"
                            >
                              {isHe ? 'קבל' : 'Accept'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl text-sm font-medium text-gray-500 italic">
                      "{req.message}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Log Section */}
          <div className="linkedin-card p-8">
            <h3 className="text-2xl font-black text-black mb-8 flex items-center gap-3">
              <FileText size={24} /> 
              {isHe ? 'דיווח התקדמות יומי' : 'Daily Progress Log'}
            </h3>
            
            <div className="p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 text-center space-y-4">
              <Lock className="mx-auto text-gray-200" size={32} />
              <p className="text-gray-400 font-medium text-sm max-w-xs mx-auto">
                {isHe ? 'דיווחים יומיים זמינים רק לאחר התחלת התמחות פעילה.' : 'Daily logs are only available after starting an active apprenticeship.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Stats Card */}
          <div className="linkedin-card p-8">
            <h3 className="text-xl font-black text-black mb-6">{isHe ? 'סיכום פעילות' : 'Activity Summary'}</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Star className="text-black" size={20} />
                  </div>
                  <span className="text-sm font-bold text-gray-500">{isHe ? 'דירוג ממוצע' : 'Avg Rating'}</span>
                </div>
                <span className="text-xl font-black text-black">5.0</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Briefcase className="text-black" size={20} />
                  </div>
                  <span className="text-sm font-bold text-gray-500">{isHe ? 'התמחויות' : 'Apprenticeships'}</span>
                </div>
                <span className="text-xl font-black text-black">0</span>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-black text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-2xl font-black mb-4 relative z-10 flex items-center gap-2">
              <ShieldAlert size={24} />
              {isHe ? 'זקוק לעזרה?' : 'Need Help?'}
            </h3>
            <p className="text-gray-400 font-medium leading-relaxed relative z-10 mb-8">
              {isHe ? 'נתקלת בבעיה? פתח בירור מול צוות SkillLink.' : 'Encountered an issue? Open an inquiry with SkillLink team.'}
            </p>
            <button 
              onClick={() => setIsDisputeOpen(true)}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group"
            >
              {isHe ? 'פתח קריאה' : 'Open Dispute'}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      <Modal
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        title={isHe ? 'פתיחת בירור' : 'Open Dispute'}
      >
        <div className="space-y-6">
          <p className="text-gray-400 font-medium text-sm">
            {isHe ? 'אנא תאר את הבעיה בפירוט וצוות התמיכה שלנו יחזור אליך בהקדם.' : 'Please describe the issue in detail and our support team will get back to you shortly.'}
          </p>
          <textarea 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all min-h-[150px] font-medium"
            placeholder={isHe ? 'תאר את הבעיה כאן...' : 'Describe the issue here...'}
          />
          <button 
            onClick={() => {
              showToast(isHe ? 'הפנייה נשלחה' : 'Inquiry sent', 'success');
              setIsDisputeOpen(false);
            }}
            className="w-full bg-black text-white font-black py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-xl active:scale-95"
          >
            {isHe ? 'שלח פנייה' : 'Submit Inquiry'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
