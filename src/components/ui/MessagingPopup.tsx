import { useState } from 'react';
import { MessageSquare, ChevronUp, ChevronDown, MoreHorizontal, Edit, Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export function MessagingPopup() {
  const { lang } = useLanguage();
  const isHe = lang === 'he';
  const [isOpen, setIsOpen] = useState(false);

  const mockChats = [
    { id: 1, name: 'Yossi Cohen', avatar: 'https://picsum.photos/seed/yossi/200/200', lastMessage: isHe ? 'מתי אתה פנוי להתחיל?' : 'When are you free to start?', time: '12:30', unread: true },
    { id: 2, name: 'Daniel Levi', avatar: 'https://picsum.photos/seed/daniel/200/200', lastMessage: isHe ? 'תודה על העזרה היום!' : 'Thanks for the help today!', time: 'Yesterday', unread: false },
    { id: 3, name: 'Avi Levy', avatar: 'https://picsum.photos/seed/avi/200/200', lastMessage: isHe ? 'שלחתי לך את התוכניות.' : 'Sent you the plans.', time: 'Mon', unread: false },
  ];

  return (
    <div className={`fixed bottom-0 ${isHe ? 'left-4' : 'right-4'} z-[90] w-72 hidden md:block`}>
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white dark:bg-[#1D2226] border border-[#E0DFDC] dark:border-[#38434F] border-b-0 rounded-t-lg shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-3 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <img src="https://picsum.photos/seed/me/200/200" alt="Me" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#5F9B41] border-2 border-white dark:border-[#1D2226] rounded-full"></div>
          </div>
          <span className="font-semibold text-sm text-primary">{isHe ? 'הודעות' : 'Messaging'}</span>
        </div>
        <div className="flex items-center gap-2 text-secondary">
          <button className="hover:bg-black/10 dark:hover:bg-white/10 p-1 rounded-full"><MoreHorizontal size={16} /></button>
          <button className="hover:bg-black/10 dark:hover:bg-white/10 p-1 rounded-full"><Edit size={16} /></button>
          {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 400 }}
            exit={{ height: 0 }}
            className="bg-white dark:bg-[#1D2226] border border-[#E0DFDC] dark:border-[#38434F] border-t-0 shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col"
          >
            <div className="p-2 border-b border-[#E0DFDC] dark:border-[#38434F]">
              <div className="relative">
                <Search className={`absolute ${isHe ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 text-secondary`} size={14} />
                <input 
                  type="text" 
                  placeholder={isHe ? 'חיפוש הודעות' : 'Search messages'}
                  className={`w-full bg-[#EEF3F8] dark:bg-[#38434F] border-none rounded text-sm py-1.5 ${isHe ? 'pr-8 pl-2' : 'pl-8 pr-2'} focus:ring-1 focus:ring-[#0A66C2] text-primary placeholder:text-secondary`}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {mockChats.map(chat => (
                <div key={chat.id} className="flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors border-b border-[#E0DFDC] dark:border-[#38434F] last:border-0">
                  <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className={`text-sm truncate ${chat.unread ? 'font-bold text-primary' : 'font-semibold text-secondary'}`}>{chat.name}</h4>
                      <span className="text-xs text-secondary shrink-0 ml-2">{chat.time}</span>
                    </div>
                    <p className={`text-xs truncate ${chat.unread ? 'font-semibold text-primary' : 'text-secondary'}`}>{chat.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
