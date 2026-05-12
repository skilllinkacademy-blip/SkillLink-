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
    <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] animate-in fade-in duration-500 flex flex-col gap-4">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start">
        <button
          onClick={() => handleTabChange('messages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'messages' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare size={15} />
          {isRtl ? 'הודעות' : 'Messages'}
        </button>
        <button
          onClick={() => handleTabChange('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'notifications' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Bell size={15} />
          {isRtl ? 'התראות' : 'Notifications'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'messages' ? (
          <Messaging isRtl={isRtl} />
        ) : (
          <div className="h-full overflow-y-auto">
            <Notifications isRtl={isRtl} />
          </div>
        )}
      </div>
    </div>
  );
}
