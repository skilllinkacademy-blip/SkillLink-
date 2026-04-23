import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, MessageSquare, Bell, User, Globe, Menu, X, LogOut, Briefcase, ShieldCheck, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  isRtl: boolean;
  toggleLang: () => void;
}

export default function Navbar({ isRtl, toggleLang }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, unreadMessagesCount, unreadNotificationsCount } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isAppPage = location.pathname.startsWith('/app');

  const navItems = [
    { icon: Home, label: isRtl ? 'הזדמנויות' : 'Opportunities', path: '/app/opportunities' },
    ...(user ? [
      { icon: Briefcase, label: isRtl ? 'שלי' : 'Mine', path: '/app/my-opportunities' },
      { icon: MessageSquare, label: isRtl ? 'הודעות' : 'Messages', path: '/app/messages' },
      { icon: Bell, label: isRtl ? 'התראות' : 'Alerts', path: '/app/notifications' },
      { icon: User, label: isRtl ? 'פרופיל' : 'Profile', path: '/app/profile' },
      ...(profile?.role === 'admin' ? [{ icon: ShieldCheck, label: isRtl ? 'ניהול' : 'Admin', path: '/app/admin' }] : []),
    ] : [])
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to={user ? "/app/opportunities" : "/"} className="text-xl sm:text-2xl font-black tracking-tighter text-black flex items-center !font-sans" dir="ltr">
                SkillLink<span className="text-blue-600">.</span>
              </Link>
              
              {user && profile && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    profile.role === 'mentor' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {isRtl ? (profile.role === 'mentor' ? 'מנטור' : 'מתלמד') : profile.role}
                  </span>
                  {profile.role === 'mentor' && (
                    <Link 
                      to="/app/verify"
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                        profile.is_verified || profile.verification_status === 'approved'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-black hover:text-white'
                      }`}
                    >
                      {(profile.is_verified || profile.verification_status === 'approved') && <ShieldCheck size={12} fill="currentColor" className="text-white" />}
                      {isRtl 
                        ? (profile.is_verified || profile.verification_status === 'approved' ? 'מאומת' : profile.verification_status === 'pending' ? 'בבדיקה' : 'אמת חשבון') 
                        : (profile.is_verified || profile.verification_status === 'approved' ? 'Verified' : profile.verification_status === 'pending' ? 'Pending' : 'Verify')}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-4 rtl:space-x-reverse">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors group relative ${
                    location.pathname === item.path ? 'text-black' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  <item.icon size={22} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                  {item.path === '/app/messages' && unreadMessagesCount > 0 && (
                    <span className="absolute top-1 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                  )}
                  {item.path === '/app/notifications' && unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                  )}
                  <span className="text-[11px] font-medium mt-0.5">{item.label}</span>
                  {location.pathname === item.path && (
                    <div className="h-0.5 w-full bg-black mt-1 rounded-full" />
                  )}
                </Link>
              ))}
              
              {!user && (
                <div className="flex items-center gap-4">
                  <Link to="/auth?mode=login" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">
                    {isRtl ? 'התחברות' : 'Sign in'}
                  </Link>
                  <Link to="/auth?mode=signup" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm">
                    {isRtl ? 'הצטרפות חינם' : 'Join free'}
                  </Link>
                </div>
              )}

              <div className="h-8 w-[1px] bg-gray-100 mx-2" />
              
              <button 
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold hover:bg-gray-50 transition-all uppercase tracking-widest"
              >
                <Globe size={14} />
                {isRtl ? 'EN' : 'HE'}
              </button>

              {user && (
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title={isRtl ? 'התנתקות' : 'Logout'}
                >
                  <LogOut size={20} />
                </button>
              )}
            </div>

            {/* Mobile right side */}
            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={toggleLang}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-gray-200 text-[10px] font-black uppercase tracking-widest bg-gray-50 min-h-[36px]"
              >
                <Globe size={13} />
                {isRtl ? 'EN' : 'HE'}
              </button>
              {/* Only show hamburger when NOT logged in (logged in users get bottom tab bar) */}
              {!user && (
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-black p-2 bg-gray-50 rounded-xl border border-gray-100 min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu — only for non-logged in users */}
        {isMenuOpen && !user && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col gap-3 p-2">
              <Link 
                to="/auth?mode=login" 
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-3.5 text-center font-bold text-gray-700 border border-gray-200 rounded-xl text-sm"
              >
                {isRtl ? 'התחברות' : 'Sign in'}
              </Link>
              <Link 
                to="/auth?mode=signup" 
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-3.5 text-center font-bold bg-blue-600 text-white rounded-xl text-sm"
              >
                {isRtl ? 'הצטרפות חינם' : 'Join free'}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Tab Bar — only for logged in users on app pages */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-stretch h-16">
            {[
              { icon: Home, label: isRtl ? 'הזדמנויות' : 'Home', path: '/app/opportunities' },
              { icon: Search, label: isRtl ? 'חיפוש' : 'Search', path: '/app/search' },
              { icon: MessageSquare, label: isRtl ? 'הודעות' : 'Messages', path: '/app/messages', badge: unreadMessagesCount },
              { icon: Bell, label: isRtl ? 'התראות' : 'Alerts', path: '/app/notifications', badge: unreadNotificationsCount },
              { icon: User, label: isRtl ? 'פרופיל' : 'Profile', path: '/app/profile' },
            ].map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === '/app/opportunities' && location.pathname === '/app/opportunities');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
                    isActive ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  {item.badge && item.badge > 0 ? (
                    <div className="relative">
                      <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 border border-white rounded-full" />
                    </div>
                  ) : (
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  )}
                  <span className={`text-[9px] font-bold uppercase tracking-wide ${isActive ? 'text-black' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-black rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
          {/* Safe area spacing for iPhone home indicator */}
          <div className="h-safe-bottom bg-white" style={{ height: 'env(safe-area-inset-bottom)' }} />
        </nav>
      )}

      {/* Bottom padding spacer so content isn't hidden behind tab bar */}
      {user && <div className="md:hidden h-16" />}
    </>
  );
}
