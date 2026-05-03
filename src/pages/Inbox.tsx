import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Bell } from 'lucide-react';
import Messaging from './Messaging';
import Notifications from './Notifications';

interface InboxProps {
  isRtl: boolean;
}

export default function Inbox({ isRtl }: InboxProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>(
    location.pathname.includes('notifications') ? 'notifications' : 'messages'
  );

  useEffect(() => {
    setActiveTab(location.pathname.includes('notifications') ? 'notifications' : 'messages');
  }, [location.pathname]);

  const handleTabChange = (tab: 'messages' | 'notifications') => {
    setActiveTab(tab);
    navigate(`/app/${tab}`);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="flex flex-col h-full space-y-6">
        {/* Modern Tab Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-[2rem] shadow-inner border border-slate-200">
            <button
              onClick={() => handleTabChange('messages')}
              className={`flex items-center gap-3 px-8 sm:px-12 py-3 rounded-[1.5rem] font-black text-[10px] sm:text-xs uppercase tracking-[0.1em] transition-all duration-300 ${
                activeTab === 'messages' ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <MessageSquare size={18} />
              {isRtl ? 'הודעות' : 'Messages'}
            </button>
            <button
              onClick={() => handleTabChange('notifications')}
              className={`flex items-center gap-3 px-8 sm:px-12 py-3 rounded-[1.5rem] font-black text-[10px] sm:text-xs uppercase tracking-[0.1em] transition-all duration-300 ${
                activeTab === 'notifications' ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Bell size={18} />
              {isRtl ? 'התראות' : 'Notifications'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden industrial-card-container">
          {activeTab === 'messages' ? (
            <Messaging isRtl={isRtl} />
          ) : (
            <div className="h-full overflow-y-auto no-scrollbar">
              <Notifications isRtl={isRtl} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
