import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Briefcase, Search, User, Home, Globe, MessageSquare, Bell, Settings, LogOut, Users, Grid, ChevronDown, Hammer } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { MessagingPopup } from './ui/MessagingPopup';

interface LayoutProps {
  onLogout: () => void;
  user: any;
}

export default function Layout({ onLogout, user }: LayoutProps) {
  const { lang, setLang, t, dir } = useLanguage();
  const location = useLocation();
  const isHe = lang === 'he';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleLang = () => {
    setLang(lang === 'en' ? 'he' : 'en');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { id: 'home', path: '/', icon: Home, label: t('nav.home') },
    { id: 'network', path: '/network', icon: Users, label: t('nav.network') },
    { id: 'jobs', path: '/explore', icon: Briefcase, label: t('nav.jobs') },
    { id: 'messaging', path: '/messaging', icon: MessageSquare, label: t('nav.messaging') },
    { id: 'notifications', path: '/notifications', icon: Bell, label: t('nav.notifications') },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 bg-white ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      {/* Beta Banner */}
      <div className="bg-black text-white py-1.5 text-center text-[10px] font-bold uppercase tracking-widest z-[60]">
        {t('beta.banner')}
      </div>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 h-[64px]">
        <div className="max-w-[1200px] mx-auto px-6 h-full">
          <div className="flex justify-between items-center h-full">
            
            {/* Left: Logo & Search */}
            <div className="flex items-center gap-6 flex-1 h-full">
              <Link to="/" className="flex items-center shrink-0">
                <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center">
                  <Hammer className="text-white" size={20} />
                </div>
                <span className="hidden sm:block ml-3 text-xl font-black tracking-tighter text-black">SkillLink</span>
              </Link>
              
              <div className="hidden md:flex relative max-w-[320px] w-full">
                <Search className={`absolute ${isHe ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                <input 
                  type="text" 
                  placeholder={isHe ? "חיפוש..." : "Search..."}
                  className={`w-full ${isHe ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-2.5 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm text-black placeholder:text-gray-400 h-[42px] font-medium`}
                />
              </div>
            </div>
            
            {/* Center: Navigation Icons (Desktop) */}
            <nav className="hidden md:flex items-center justify-end h-full gap-2">
              {navItems.map((item) => (
                <Link 
                  key={item.id}
                  to={item.path} 
                  className={`flex flex-col items-center justify-center h-full min-w-[72px] transition-all relative group ${location.pathname === item.path ? 'text-black' : 'text-gray-400 hover:text-black'}`}
                >
                  <div className="relative">
                    <item.icon size={24} className={location.pathname === item.path ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
                    {location.pathname === item.path && (
                      <motion.div 
                        layoutId="nav-indicator"
                        className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full"
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-bold mt-1 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
                </Link>
              ))}

              <div className="relative h-full flex items-center ml-4" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-2 p-1 rounded-full transition-all ${isProfileOpen ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-black">
                    {user?.name?.substring(0, 2).toUpperCase() || 'ME'}
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className={`absolute top-full mt-2 ${isHe ? 'left-0' : 'right-0'} w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50`}
                    >
                      <div className="p-5 border-b border-gray-50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white text-lg font-black">
                            {user?.name?.substring(0, 2).toUpperCase() || 'ME'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-black truncate text-lg">{user?.name || 'New User'}</div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{user?.role || 'Beta Member'}</div>
                          </div>
                        </div>
                        <Link 
                          to={`/profile/${user?.id || 'me'}`} 
                          onClick={() => setIsProfileOpen(false)}
                          className="block w-full text-center py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
                        >
                          {isHe ? 'הצג פרופיל' : 'View Profile'}
                        </Link>
                      </div>
                      
                      <div className="p-2">
                        <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                          <Settings size={18} />
                          {t('nav.settings')}
                        </Link>
                        <button onClick={toggleLang} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                          <Globe size={18} />
                          {isHe ? 'Switch to English' : 'עבור לעברית'}
                        </button>
                        <div className="h-px bg-gray-50 my-2 mx-2" />
                        <button 
                          onClick={onLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <LogOut size={18} />
                          {isHe ? 'התנתק' : 'Sign Out'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto bg-white">
        <Outlet />
      </main>

      <MessagingPopup />

      {/* Mobile Navigation Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 z-50 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <Link key={item.id} to={item.path} className={`flex flex-col items-center gap-1 ${location.pathname === item.path ? 'text-black' : 'text-gray-400'}`}>
            <item.icon size={24} className={location.pathname === item.path ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
