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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const mobileNavItems = user ? [
    { icon: Home,         label: isRtl ? 'ראשי'    : 'Home',     path: '/app/opportunities' },
    { icon: Search,       label: isRtl ? 'חיפוש'   : 'Explore',  path: '/app/explore' },
    { icon: MessageSquare,label: isRtl ? 'הודעות'  : 'Messages', path: '/app/messages', badge: (unreadMessagesCount || 0) + (unreadNotificationsCount || 0) },
    { icon: User,         label: isRtl ? 'פרופיל'  : 'Profile',  path: '/app/profile' },
  ] : [];

  const desktopNavItems = user ? [
    { label: isRtl ? 'הזדמנויות' : 'Opportunities', path: '/app/opportunities' },
    { label: isRtl ? 'חיפוש' : 'Explore', path: '/app/explore' },
    { label: isRtl ? 'הפרסומים שלי' : 'My Listings', path: '/app/my-opportunities' },
    { label: isRtl ? 'הודעות' : 'Messages', path: '/app/messages', badge: (unreadMessagesCount || 0) + (unreadNotificationsCount || 0) },
    ...(profile?.role === 'admin' ? [{ label: isRtl ? 'ניהול' : 'Admin', path: '/app/admin' }] : []),
  ] : [];

  return (
    <>
      {/* ── TOP NAV ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to={user ? '/app/opportunities' : '/'}
            className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-0.5 flex-shrink-0"
            dir="ltr"
          >
            Skill<span className="text-blue-600">Link.</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {desktopNavItems.map((item: any) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Post CTA — desktop only */}
                <Link
                  to="/app/opportunities/new"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Plus size={15} />
                  {isRtl ? 'פרסם' : 'Post'}
                </Link>

                {/* Profile avatar */}
                <button
                  onClick={() => navigate('/app/profile')}
                  className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-600 font-bold text-sm hover:opacity-80 transition-opacity"
                >
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : profile?.full_name?.charAt(0) || 'U'}
                </button>

                {/* Verify badge (mentor only) */}
                {profile?.role === 'mentor' && !profile?.is_verified && (
                  <Link
                    to="/app/verify"
                    className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    <ShieldCheck size={11} />
                    {isRtl ? 'אמת' : 'Verify'}
                  </Link>
                )}
                {profile?.role === 'mentor' && (profile?.is_verified || profile?.verification_status === 'approved') && (
                  <span className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck size={11} className="fill-emerald-200" />
                    {isRtl ? 'מאומת' : 'Verified'}
                  </span>
                )}

                <button
                  onClick={handleLogout}
                  className="hidden md:block p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  title={isRtl ? 'יציאה' : 'Logout'}
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/auth?mode=login" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  {isRtl ? 'כניסה' : 'Sign in'}
                </Link>
                <Link to="/auth?mode=signup" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                  {isRtl ? 'הצטרפות' : 'Join free'}
                </Link>
              </div>
            )}

            {/* Lang toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <Globe size={12} />
              {isRtl ? 'EN' : 'עב'}
            </button>

            {/* Mobile menu toggle (only for non-logged-in on mobile) */}
            {!user && (
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="md:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile dropdown — only for guests */}
        {menuOpen && !user && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150">
            <Link to="/auth?mode=login" onClick={() => setMenuOpen(false)} className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg">
              {isRtl ? 'כניסה' : 'Sign in'}
            </Link>
            <Link to="/auth?mode=signup" onClick={() => setMenuOpen(false)} className="w-full py-2.5 text-center text-sm font-semibold bg-blue-600 text-white rounded-lg">
              {isRtl ? 'הצטרפות חינם' : 'Join free'}
            </Link>
          </div>
        )}
      </nav>

      {/* ── MOBILE BOTTOM TAB BAR ── (logged-in only) */}
      {user && mobileNavItems.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-pb">
          <div className="flex items-center justify-around h-14">
            {mobileNavItems.map((item: any) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors"
                >
                  <item.icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={active ? 'text-slate-900' : 'text-slate-400'}
                  />
                  <span className={`text-[10px] font-medium ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <span className="absolute top-2 left-1/2 ml-2 min-w-[15px] h-[15px] px-1 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            {/* Center FAB — post opportunity */}
            <Link
              to="/app/opportunities/new"
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5"
            >
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center -mt-5 shadow-lg border-4 border-white">
                <Plus size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-medium text-slate-400 mt-0.5">{isRtl ? 'פרסם' : 'Post'}</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
