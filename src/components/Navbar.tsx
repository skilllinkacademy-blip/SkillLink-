import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, Bell, User, Globe, Menu, X } from 'lucide-react';

interface NavbarProps {
  isRtl: boolean;
  toggleLang: () => void;
}

export default function Navbar({ isRtl, toggleLang }: NavbarProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Feed', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-black tracking-tighter text-black">
            SkillLink
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors group ${
                  location.pathname === item.path ? 'text-black' : 'text-gray-400 hover:text-black'
                }`}
              >
                <item.icon size={22} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                <span className="text-[11px] font-medium mt-0.5">{item.label}</span>
                {location.pathname === item.path && (
                  <div className="h-0.5 w-full bg-black mt-1 rounded-full" />
                )}
              </Link>
            ))}
            
            <div className="h-8 w-[1px] bg-gray-100 mx-2" />
            
            <button 
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold hover:bg-gray-50 transition-all uppercase tracking-widest"
            >
              <Globe size={14} />
              {isRtl ? 'EN' : 'HE'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-widest"
            >
              {isRtl ? 'EN' : 'HE'}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black p-1"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-2 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                location.pathname === item.path ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-bold">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
