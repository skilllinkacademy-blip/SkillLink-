import { useState } from 'react';
import { Users, UserPlus, Contact, Calendar, FileText, Hash, Group, ChevronRight, X, UserCheck, Search, Hammer } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Network() {
  const { lang, t } = useLanguage();
  const isHe = lang === 'he';

  // Beta Mode: No connections initially
  const invitations: any[] = [];
  const suggestions: any[] = [];

  return (
    <div className="max-w-[1128px] mx-auto px-0 sm:px-4 lg:px-0 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-3">
          <div className="linkedin-card overflow-hidden">
            <div className="p-4 border-b border-[#00000014] dark:border-[#38434F]">
              <h2 className="text-base font-semibold text-primary">{isHe ? 'נהל את הרשת שלי' : 'Manage my network'}</h2>
            </div>
            <nav className="py-2">
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors text-secondary text-sm">
                <div className="flex items-center gap-3">
                  <Users size={20} />
                  <span>{isHe ? 'קשרים' : 'Connections'}</span>
                </div>
                <span>0</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors text-secondary text-sm">
                <div className="flex items-center gap-3">
                  <Contact size={20} />
                  <span>{isHe ? 'אנשי קשר' : 'Contacts'}</span>
                </div>
                <span>0</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors text-secondary text-sm">
                <div className="flex items-center gap-3">
                  <UserCheck size={20} />
                  <span>{isHe ? 'במעקב' : 'Following & Followers'}</span>
                </div>
                <span>0</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors text-secondary text-sm">
                <div className="flex items-center gap-3">
                  <Group size={20} />
                  <span>{isHe ? 'קבוצות' : 'Groups'}</span>
                </div>
                <span>0</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors text-secondary text-sm">
                <div className="flex items-center gap-3">
                  <Calendar size={20} />
                  <span>{isHe ? 'אירועים' : 'Events'}</span>
                </div>
                <span>0</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Empty State for Network */}
          <div className="linkedin-card p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-[#F4F2EE] dark:bg-[#38434F] rounded-full flex items-center justify-center">
              <Users className="text-secondary" size={40} />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-bold text-primary">
                {isHe ? 'הרשת שלך עדיין ריקה' : 'Your network is empty'}
              </h2>
              <p className="text-sm text-secondary">
                {isHe ? 'במהלך תקופת הבטא, תוכל להתחבר למנטורים ולאפליקנטים אחרים לאחר שהפרופילים שלהם יאושרו.' : 'During the beta period, you can connect with other mentors and apprentices once their profiles are approved.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="btn-primary px-8 py-2.5 rounded-full font-bold flex items-center gap-2">
                <Search size={18} />
                {isHe ? 'חפש אנשים' : 'Search People'}
              </button>
              <button className="btn-secondary px-8 py-2.5 rounded-full font-bold flex items-center gap-2">
                <Hammer size={18} />
                {isHe ? 'הזמן חברים' : 'Invite Friends'}
              </button>
            </div>
          </div>

          {/* Suggestions Grid (Empty for now) */}
          <div className="linkedin-card overflow-hidden opacity-50 grayscale pointer-events-none">
            <div className="p-4 border-b border-[#00000014] dark:border-[#38434F] flex justify-between items-center">
              <h2 className="text-base font-semibold text-primary">{isHe ? 'אנשים שאתה עשוי להכיר' : 'People you may know'}</h2>
            </div>
            <div className="p-12 text-center">
              <p className="text-sm text-secondary italic">
                {isHe ? 'הצעות יופיעו כאן ככל שהקהילה תגדל.' : 'Suggestions will appear here as the community grows.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
