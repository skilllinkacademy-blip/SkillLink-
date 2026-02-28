import { useState } from 'react';
import { MoreHorizontal, Bell, UserPlus, MessageSquare, Briefcase, Star, Heart, ChevronRight, Info, ShieldCheck, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Notifications() {
  const { lang, t } = useLanguage();
  const isHe = lang === 'he';

  // Beta Mode: No notifications initially
  const notifications: any[] = [];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-black tracking-tight">
          {isHe ? 'התראות' : 'Notifications'}
        </h1>
        <p className="text-gray-400 font-medium">
          {isHe ? 'הישאר מעודכן בחדשות האחרונות מהרשת שלך.' : 'Stay updated with the latest from your network.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-3">
          <div className="linkedin-card p-6 sticky top-24">
            <h2 className="text-sm font-black text-black uppercase tracking-widest mb-4">{isHe ? 'ניהול התראות' : 'Manage Notifications'}</h2>
            <button className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black transition-all">
              {isHe ? 'הגדרות התראות' : 'Notification Settings'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-6">
          <div className="linkedin-card overflow-hidden">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {/* Notifications list would go here */}
              </div>
            ) : (
              <div className="p-20 text-center space-y-6">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Bell size={48} className="text-gray-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-black">{isHe ? 'אין התראות חדשות' : 'No new notifications'}</h3>
                  <p className="text-gray-400 font-medium max-w-xs mx-auto">
                    {isHe ? 'כאשר יהיו עדכונים על הפעילות שלך, הם יופיעו כאן.' : 'When there are updates on your activity, they will appear here.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="bg-black text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <ShieldCheck size={24} className="text-white" />
              <h3 className="font-black text-sm uppercase tracking-widest">{isHe ? 'מצב בטא' : 'Beta Mode'}</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-medium relative z-10">
              {isHe ? 'במהלך תקופת הבטא, התראות יישלחו על אירועים קריטיים כמו אישור מנטור או בקשות התמחות חדשות.' : 'During the beta period, notifications will be sent for critical events like mentor approval or new apprenticeship requests.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
