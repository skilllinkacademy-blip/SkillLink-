import React, { useState } from 'react';
import { Bell, UserPlus, MessageSquare, Briefcase, Star, Heart, ChevronRight, Info, ShieldCheck, Clock, MoreHorizontal } from 'lucide-react';

interface NotificationsProps {
  isRtl: boolean;
}

export default function Notifications({ isRtl }: NotificationsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'mentions' | 'requests'>('all');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-black tracking-tight">Notifications</h1>
          <p className="text-gray-400 font-medium">Stay updated with your SkillLink network activities.</p>
        </div>
        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('mentions')}
            className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === 'mentions' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            Mentions
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === 'requests' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            Requests
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Empty State */}
        <div className="p-24 text-center space-y-8">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Bell className="text-gray-200" size={48} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-black tracking-tight">All caught up!</h2>
            <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
              No new notifications at the moment. We'll alert you when something important happens in your network.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Settings Link */}
      <div className="text-center">
        <button className="text-sm font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-2 mx-auto">
          <Info size={16} />
          Manage notification settings
        </button>
      </div>
    </div>
  );
}
