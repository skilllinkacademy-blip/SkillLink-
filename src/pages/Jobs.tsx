import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Bell, Bookmark, CheckSquare, List, Settings, ChevronRight, ExternalLink, ShieldCheck, Clock, Hammer, Info, Star, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { userService } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

export default function Jobs() {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const isHe = lang === 'he';

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const response = await userService.searchUsers({ role: 'mentor', verified: 1 });
      setMentors(response.data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      showToast(isHe ? 'שגיאה בטעינת ההזדמנויות' : 'Error loading opportunities', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(m => 
    (m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     m.trade?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (m.location?.toLowerCase().includes(locationQuery.toLowerCase()) || !locationQuery)
  );

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="linkedin-card p-4 sticky top-24">
            <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6 px-2">
              {isHe ? 'ניהול התמחויות' : 'Manage Apprenticeships'}
            </h3>
            <nav className="space-y-1">
              <Link to="/dashboard" className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-2xl transition-all group">
                <div className="flex items-center gap-3">
                  <Bookmark size={18} className="text-gray-400 group-hover:text-black" />
                  <span className="text-sm font-bold text-gray-500 group-hover:text-black">{isHe ? 'הבקשות שלי' : 'My Requests'}</span>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-black" />
              </Link>
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-2xl transition-all group">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-gray-400 group-hover:text-black" />
                  <span className="text-sm font-bold text-gray-500 group-hover:text-black">{isHe ? 'התראות' : 'Alerts'}</span>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-black" />
              </button>
            </nav>
          </div>
          
          <Link to="/profile" className="w-full bg-black text-white py-4 rounded-3xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all">
            <Hammer size={18} />
            {isHe ? 'פרסם התמחות' : 'Post an apprenticeship'}
          </Link>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Search Bar */}
          <div className="linkedin-card p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  type="text" 
                  placeholder={isHe ? 'חפש מקצוע או מנטור' : 'Search by trade or mentor'}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black font-medium text-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  type="text" 
                  placeholder={isHe ? 'עיר או אזור' : 'City or area'}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black font-medium text-sm transition-all"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Job Recommendations */}
          <div className="space-y-6">
            <div className="flex justify-between items-end px-2">
              <div>
                <h2 className="text-2xl font-black text-black">{isHe ? 'התמחויות מומלצות' : 'Recommended apprenticeships'}</h2>
                <p className="text-sm text-gray-400 font-medium">{isHe ? 'מבוסס על הפרופיל והעדפות שלך' : 'Based on your profile and preferences'}</p>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                {filteredMentors.length} {isHe ? 'תוצאות' : 'Results'}
              </span>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="linkedin-card p-8 animate-pulse flex gap-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-1/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMentors.length === 0 ? (
              <div className="linkedin-card p-16 text-center space-y-6 bg-gray-50/50 border-2 border-dashed border-gray-100">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Briefcase className="text-gray-200" size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-black">{isHe ? 'אין התמחויות זמינות כרגע' : 'No apprenticeships available yet'}</h3>
                  <p className="text-gray-400 font-medium max-w-sm mx-auto">
                    {isHe ? 'אנחנו מאשרים מנטורים חדשים בכל יום. בדוק שוב בקרוב!' : 'We are approving new mentors every day. Check back soon!'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMentors.map((m) => (
                  <Link 
                    key={m.id} 
                    to={`/profile/${m.id}`}
                    className="linkedin-card p-8 flex flex-col md:flex-row gap-6 hover:shadow-2xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                    
                    <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shrink-0 group-hover:rotate-3 transition-transform">
                      {m.name?.substring(0, 2).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 space-y-4 relative z-10">
                      <div>
                        <h3 className="text-xl font-black text-black group-hover:text-gray-700 transition-colors">{m.trade}</h3>
                        <p className="text-sm font-bold text-gray-500">{m.businessName || m.name}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-black" />
                          {m.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-black" />
                          {isHe ? 'משרה מלאה' : 'Full-time'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-emerald-500" />
                          {isHe ? 'מאומת' : 'Verified'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-between items-end shrink-0 relative z-10">
                      <div className="bg-gray-50 p-2 rounded-xl">
                        <Star size={20} className="text-black fill-current" />
                      </div>
                      <div className="flex items-center gap-2 text-black font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                        {isHe ? 'פרטים נוספים' : 'View Details'}
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-black text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Info size={24} className="text-white" />
              <h3 className="font-black text-sm uppercase tracking-widest">{isHe ? 'מצב בטא' : 'Beta Mode'}</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-medium relative z-10">
              {isHe ? 'במהלך תקופת הבטא, רשימת ההתמחויות תתעדכן ככל שמנטורים נוספים יאושרו במערכת.' : 'During the beta period, the apprenticeship list will be updated as more mentors are approved in the system.'}
            </p>
          </div>

          <div className="linkedin-card p-8 space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              {isHe ? 'סטטיסטיקת פלטפורמה' : 'Platform Stats'}
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-500">{isHe ? 'משתמשים' : 'Users'}</span>
                </div>
                <span className="text-sm font-black text-black">1.2k</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Hammer size={16} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-500">{isHe ? 'התמחויות' : 'Apprenticeships'}</span>
                </div>
                <span className="text-sm font-black text-black">84</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
