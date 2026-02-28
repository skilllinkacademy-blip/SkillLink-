import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, Hammer, ArrowRight, ShieldCheck, Briefcase, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { userService } from '../services/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Explore() {
  const { lang, t } = useLanguage();
  const isHe = lang === 'he';
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('');

  useEffect(() => {
    fetchMentors();
  }, [searchQuery, selectedTrade]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const response = await userService.searchUsers({
        role: 'mentor',
        trade: selectedTrade === 'All' ? '' : selectedTrade,
        query: searchQuery
      });
      setMentors(response.data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Search & Filter Header */}
      <div className="linkedin-card p-8 mb-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-black tracking-tight">
            {isHe ? 'מצא את המנטור שלך' : 'Find your Mentor'}
          </h1>
          <p className="text-gray-400 font-medium">
            {isHe ? 'גלה מומחים בתחומם המוכנים ללמד ולהכשיר את הדור הבא.' : 'Discover trade experts ready to teach and train the next generation.'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${isHe ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
            <input 
              type="text" 
              placeholder={isHe ? "חפש לפי שם או מקצוע..." : "Search by name or trade..."}
              className={`w-full ${isHe ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className={`absolute ${isHe ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
            <select 
              className={`appearance-none w-full md:w-64 ${isHe ? 'pr-12 pl-10' : 'pl-12 pr-10'} py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-black cursor-pointer`}
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
            >
              <option value="All">{isHe ? 'כל המקצועות' : 'All Trades'}</option>
              <option value="Plumbing">{isHe ? 'אינסטלציה' : 'Plumbing'}</option>
              <option value="Electrical">{isHe ? 'חשמל' : 'Electrical'}</option>
              <option value="Carpentry">{isHe ? 'נגרות' : 'Carpentry'}</option>
              <option value="Welding">{isHe ? 'ריתוך' : 'Welding'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="linkedin-card p-6 animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-20 bg-gray-100 rounded-xl" />
            </div>
          ))
        ) : mentors.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Users className="text-gray-200" size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-black">
                {isHe ? 'לא נמצאו מנטורים' : 'No mentors found'}
              </h3>
              <p className="text-gray-400 font-medium max-w-sm mx-auto">
                {isHe ? 'נסה לשנות את מסנני החיפוש או חזור מאוחר יותר.' : 'Try adjusting your search filters or check back later.'}
              </p>
            </div>
            <Link 
              to="/profile/me" 
              className="btn-primary px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform inline-block"
            >
              {isHe ? 'השלם את הפרופיל שלך' : 'Complete Your Profile'}
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {mentors.map((mentor) => (
              <motion.div 
                key={mentor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="linkedin-card group hover:shadow-2xl transition-all duration-500"
              >
                <div className="p-6">
                  <div className="flex gap-5 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-xl group-hover:scale-105 transition-transform">
                      {mentor.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-black text-xl truncate">{mentor.name}</h3>
                        <ShieldCheck size={18} className="text-black shrink-0" />
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{mentor.trade}</p>
                      <div className="flex items-center gap-1 text-black">
                        <Star size={14} className="fill-current" />
                        <span className="text-sm font-black">{mentor.rating || '5.0'}</span>
                        <span className="text-xs text-gray-400 font-bold ml-1">({mentor.reviewCount || 0})</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                      <MapPin size={16} className="text-black" />
                      {mentor.location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                      <Briefcase size={16} className="text-black" />
                      {mentor.experience || '5+'} {isHe ? 'שנות ניסיון' : 'years experience'}
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 font-medium leading-relaxed">
                      {mentor.bio || (isHe ? 'מנטור מומחה בתחום המקצועי שלו, מוכן להכשיר חניכים חדשים.' : 'Expert mentor in their professional field, ready to train new apprentices.')}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex gap-3">
                    <Link 
                      to={`/profile/${mentor.id}`}
                      className="flex-1 bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all text-center text-sm shadow-lg active:scale-95"
                    >
                      {isHe ? 'צפה בפרופיל' : 'View Profile'}
                    </Link>
                    <Link 
                      to={`/messaging?user=${mentor.id}`}
                      className="w-12 h-12 border-2 border-black rounded-xl flex items-center justify-center hover:bg-black/5 transition-all shrink-0 active:scale-95"
                    >
                      <ArrowRight size={20} className={isHe ? 'rotate-180' : ''} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
