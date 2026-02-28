import { useState } from 'react';
import { Moon, Sun, Globe, Shield, CreditCard, Bell, User, ChevronRight, CheckCircle2, ShieldAlert, Lock, Trash2, LogOut, ShieldCheck, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const { lang, setLang, t, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const isHe = lang === 'he';

  const [activeTab, setActiveTab] = useState('appearance');

  const handleSave = () => {
    showToast(isHe ? 'ההגדרות נשמרו בהצלחה' : 'Settings saved successfully', 'success');
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-black tracking-tight">
          {isHe ? 'הגדרות' : 'Settings'}
        </h1>
        <p className="text-gray-400 font-medium">
          {isHe ? 'נהל את החשבון, המראה וההעדפות שלך.' : 'Manage your account, appearance, and preferences.'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-72 shrink-0 space-y-2">
          {[
            { id: 'appearance', label: isHe ? 'מראה ושפה' : 'Appearance', icon: Sun },
            { id: 'subscription', label: isHe ? 'מנוי ואימות' : 'Subscription', icon: ShieldCheck },
            { id: 'account', label: isHe ? 'חשבון ואבטחה' : 'Account', icon: Lock },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? 'bg-black text-white shadow-xl translate-x-2' 
                : 'text-gray-400 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={20} />
                {tab.label}
              </div>
              <ChevronRight size={16} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
          
          <div className="pt-8 mt-8 border-t border-gray-100">
            <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all">
              <LogOut size={20} />
              {isHe ? 'התנתק' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="linkedin-card p-8"
            >
              {activeTab === 'appearance' && (
                <div className="space-y-12">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-black flex items-center gap-3">
                      <Sun size={24} />
                      {isHe ? 'מראה' : 'Appearance'}
                    </h2>
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-lg transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          {theme === 'dark' ? <Moon className="text-black" /> : <Sun className="text-black" />}
                        </div>
                        <div>
                          <div className="font-black text-black">{isHe ? 'מצב כהה' : 'Dark Mode'}</div>
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{isHe ? 'החלף בין תצוגה בהירה לכהה' : 'Toggle between light and dark theme'}</div>
                        </div>
                      </div>
                      <button 
                        onClick={toggleTheme}
                        className={`w-14 h-8 rounded-full p-1 transition-all relative ${theme === 'dark' ? 'bg-black' : 'bg-gray-200'}`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-white shadow-lg transform transition-transform ${theme === 'dark' ? (isHe ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-black flex items-center gap-3">
                      <Globe size={24} />
                      {isHe ? 'שפה' : 'Language'}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'he', label: 'עברית' },
                        { id: 'en', label: 'English' }
                      ].map((l) => (
                        <button 
                          key={l.id}
                          onClick={() => setLang(l.id as any)}
                          className={`p-6 rounded-3xl border-2 font-black text-sm uppercase tracking-widest transition-all ${
                            lang === l.id 
                            ? 'border-black bg-black text-white shadow-xl' 
                            : 'border-gray-100 text-gray-400 hover:border-black hover:text-black'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'subscription' && (
                <div className="space-y-8">
                  <div className="bg-black text-white rounded-3xl p-10 relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative z-10 space-y-8">
                      <div className="inline-block px-4 py-1.5 bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/20">
                        {isHe ? 'למנטורים בלבד' : 'For Mentors Only'}
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-4xl font-black tracking-tight">{isHe ? 'מנוי Master' : 'Master Subscription'}</h2>
                        <p className="text-gray-400 font-medium text-lg max-w-md">{isHe ? 'קבל חשיפה מקסימלית וכלים מתקדמים לניהול חניכים.' : 'Get maximum visibility and advanced tools for apprentice management.'}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { icon: ShieldCheck, text: isHe ? 'תג Verified Master' : 'Verified Master badge' },
                          { icon: User, text: isHe ? 'חשיפה מוגברת' : 'Increased visibility' },
                          { icon: CreditCard, text: isHe ? 'ביטוח פלטפורמה' : 'Platform insurance' },
                          { icon: Star, text: isHe ? 'דירוג מועדף' : 'Priority ranking' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                              <item.icon size={16} className="text-white" />
                            </div>
                            <span className="text-sm font-bold text-gray-200">{item.text}</span>
                          </div>
                        ))}
                      </div>

                      <button className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-gray-100 transition-all shadow-xl text-lg uppercase tracking-widest">
                        {isHe ? 'שדרג עכשיו - 99 ₪ / חודש' : 'Upgrade Now - 99 ILS / mo'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-black text-black flex items-center gap-3">
                    <Lock size={24} />
                    {isHe ? 'אבטחת חשבון' : 'Account Security'}
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: isHe ? 'אימייל' : 'Email Address', value: 'alex@example.com', icon: Globe },
                      { label: isHe ? 'סיסמה' : 'Password', value: '********', icon: Lock },
                      { label: isHe ? 'אימות דו-שלבי' : 'Two-Factor Auth', value: isHe ? 'כבוי' : 'Disabled', icon: ShieldAlert },
                    ].map((item, i) => (
                      <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <item.icon size={20} className="text-black" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.label}</div>
                            <div className="font-black text-black">{item.value}</div>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-300 group-hover:text-black transition-colors" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 px-6 py-3 rounded-xl transition-all">
                      <Trash2 size={18} />
                      {isHe ? 'מחק חשבון' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
