import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { Hammer, Users, ShieldCheck, ArrowRight, X, Mail, Lock, User, MapPin, Briefcase, Calendar } from 'lucide-react';
import { authService } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface LandingProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function Landing({ onLoginSuccess }: LandingProps) {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const isHe = lang === 'he';
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'mentor' | 'apprentice' | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    age: '',
    trade: '',
  });

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'register') {
        const response = await authService.register({ ...formData, role, lang });
        onLoginSuccess(response.data.user, response.data.token);
        showToast(isHe ? 'נרשמת בהצלחה!' : 'Registered successfully!', 'success');
      } else {
        const response = await authService.login({ email: formData.email, password: formData.password });
        onLoginSuccess(response.data.user, response.data.token);
        showToast(isHe ? 'התחברת בהצלחה!' : 'Logged in successfully!', 'success');
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || (isHe ? 'משהו השתבש' : 'Something went wrong'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const openRegister = (selectedRole: 'mentor' | 'apprentice') => {
    setRole(selectedRole);
    setAuthMode('register');
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Beta Banner */}
      <div className="bg-black text-white py-2 text-center text-[11px] font-bold tracking-[0.2em] uppercase">
        {t('beta.banner')}
      </div>

      {/* Header */}
      <header className="max-w-[1200px] mx-auto w-full px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <Hammer className="text-white" size={22} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-black">SkillLink</span>
        </div>
        <button 
          onClick={() => { setAuthMode('login'); setShowAuth(true); }}
          className="text-black font-bold hover:underline px-4 py-2 transition-all"
        >
          {t('landing.login')}
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-[900px] mx-auto space-y-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-8xl font-black text-black leading-[0.9] tracking-tight">
            {t('landing.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto font-medium">
            {t('landing.hero.subtitle')}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-6 w-full max-w-lg"
        >
          <button 
            onClick={() => openRegister('apprentice')}
            className="flex-1 bg-black text-white font-bold py-5 px-8 rounded-full hover:bg-gray-800 transition-all flex items-center justify-center gap-3 group shadow-xl active:scale-95"
          >
            {t('landing.join.apprentice')}
            <ArrowRight size={22} className={`transition-transform ${isHe ? 'rotate-180' : 'group-hover:translate-x-1'}`} />
          </button>
          <button 
            onClick={() => openRegister('mentor')}
            className="flex-1 bg-white text-black border-2 border-black font-bold py-5 px-8 rounded-full hover:bg-black/5 transition-all shadow-lg active:scale-95"
          >
            {t('landing.join.mentor')}
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16 w-full"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
              <ShieldCheck className="text-black" size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-black">Verified Mentors</h3>
              <p className="text-xs text-gray-400">Trusted trade professionals</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
              <Users className="text-black" size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-black">Direct Matching</h3>
              <p className="text-xs text-gray-400">No middleman, direct connection</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
              <Hammer className="text-black" size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-black">Real Trade Skills</h3>
              <p className="text-xs text-gray-400">Learn on-the-job training</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-400 text-sm border-t border-gray-50">
        <div className="flex justify-center gap-8 mb-6 font-bold text-black">
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
        </div>
        <p className="font-medium">© 2026 SkillLink. All rights reserved.</p>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuth(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setShowAuth(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>

              <div className="p-8 sm:p-10">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-black text-black mb-2">
                    {authMode === 'login' ? t('auth.login.title') : t('auth.register.title')}
                  </h2>
                  <p className="text-gray-500 font-medium">
                    {authMode === 'register' && role ? `${isHe ? 'מצטרף כ' : 'Joining as'} ${role}` : ''}
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <div className="relative">
                      <User className={`absolute ${isHe ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
                      <input 
                        required
                        type="text" 
                        placeholder={t('auth.name')}
                        className={`w-full ${isHe ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium`}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className={`absolute ${isHe ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
                    <input 
                      required
                      type="email" 
                      placeholder={t('auth.email')}
                      className={`w-full ${isHe ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium`}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="relative">
                    <Lock className={`absolute ${isHe ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
                    <input 
                      required
                      type="password" 
                      placeholder={t('auth.password')}
                      className={`w-full ${isHe ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium`}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>

                  {authMode === 'register' && (
                    <>
                      <div className="relative">
                        <MapPin className={`absolute ${isHe ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
                        <input 
                          required
                          type="text" 
                          placeholder={t('auth.location')}
                          className={`w-full ${isHe ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium`}
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <Briefcase className={`absolute ${isHe ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
                          <input 
                            required
                            type="text" 
                            placeholder={t('auth.trade')}
                            className={`w-full ${isHe ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium`}
                            value={formData.trade}
                            onChange={(e) => setFormData({...formData, trade: e.target.value})}
                          />
                        </div>
                        {role === 'apprentice' && (
                          <div className="relative">
                            <Calendar className={`absolute ${isHe ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
                            <input 
                              required
                              type="number" 
                              placeholder={t('auth.age')}
                              className={`w-full ${isHe ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium`}
                              value={formData.age}
                              onChange={(e) => setFormData({...formData, age: e.target.value})}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      authMode === 'login' ? t('auth.submit.login') : t('auth.submit.register')
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-gray-500 font-bold hover:text-black transition-colors"
                  >
                    {authMode === 'login' ? t('auth.switch.register') : t('auth.switch.login')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
