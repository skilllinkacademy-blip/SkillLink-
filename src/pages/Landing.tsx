import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Zap, CheckCircle2, ArrowRight, Star, Award, Briefcase, GraduationCap, Globe, Shield, User as UserIcon, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface LandingProps {
  isRtl: boolean;
}

export default function Landing({ isRtl }: LandingProps) {
  const [counts, setCounts] = useState({ mentors: 0, mentees: 0, total: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: mentorCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'mentor');
      
      const { count: menteeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'mentee');

      const total = (mentorCount || 0) + (menteeCount || 0);
      // Show minimum credible numbers while platform grows
      const MIN_MENTORS = 50;
      const MIN_MENTEES = 120;
      setCounts({ 
        mentors: Math.max(mentorCount || 0, MIN_MENTORS), 
        mentees: Math.max(menteeCount || 0, MIN_MENTEES), 
        total: Math.max(total, MIN_MENTORS + MIN_MENTEES)
      });
    };

    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-blue-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-32 pb-16 sm:pb-40 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-5 relative z-10">
          {/* Mobile: stacked layout | Desktop: side by side */}
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
            
            {/* Text content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 space-y-6 sm:space-y-10 text-center lg:text-start w-full"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-xl">
                <Zap size={12} className="text-blue-400" />
                {isRtl ? 'הפלטפורמה המובילה למקצועות טכניים' : 'The #1 platform for skilled trades'}
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-gray-900 leading-[0.9] tracking-tighter">
                {isRtl ? (
                  <>ללמוד ישירות מ<span className="text-blue-600">מקצוענים</span></>
                ) : (
                  <>Learn directly from <span className="text-blue-600">real professionals</span></>
                )}
              </h1>
              
              <p className="text-base sm:text-xl text-gray-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {isRtl 
                  ? 'חברו למנטורים מיומנים בעיצוב שיער, חשמל, אינסטלציה, נגרות, מכונאות ועוד. התחילו את מסע ההתלמדות שלכם היום.'
                  : 'Connect with skilled mentors in hair styling, electrical, plumbing, carpentry, mechanics and more. Start your journey today.'}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Link 
                  to="/auth?mode=signup" 
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 group active:scale-95"
                >
                  {isRtl ? 'הצטרפות חינם' : 'Join for Free'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                </Link>
                <Link 
                  to="/app/opportunities" 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border-2 border-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center active:scale-95"
                >
                  {isRtl ? 'צפייה בהזדמנויות' : 'Browse Opportunities'}
                </Link>
              </div>
              
              <div className="flex items-center gap-4 justify-center lg:justify-start pt-2">
                <div className="flex -space-x-3 rtl:space-x-reverse">
                  {[
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
                    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100",
                    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=100"
                  ].map((url, i) => (
                    <img 
                      key={i}
                      src={url}
                      className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-4 border-white shadow-sm object-cover"
                      alt="User"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-sm font-bold text-gray-400">
                    <span className="text-gray-900 font-black">{counts.total}+</span> {isRtl ? 'מקצוענים כבר כאן' : 'Professionals already here'}
                  </div>
                  <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> {counts.mentors} {isRtl ? 'מנטורים' : 'Mentors'}</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> {counts.mentees} {isRtl ? 'מתלמדים' : 'Apprentices'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hero image — hidden on small mobile, shown from sm up */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 relative w-full hidden sm:block"
            >
              <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] rotate-1 hover:rotate-0 transition-transform duration-700">
                <img 
                  src="/hero-trades.jpg" 
                  alt="Professional tradesperson at work"
                  className="w-full h-auto"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar — mobile friendly */}
      <section className="py-8 sm:py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: `${counts.mentors}+`, label: isRtl ? 'מנטורים' : 'Mentors' },
              { value: `${counts.mentees}+`, label: isRtl ? 'מתלמדים' : 'Apprentices' },
              { value: '20+', label: isRtl ? 'מקצועות' : 'Trades' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl sm:text-4xl font-black text-gray-900">{stat.value}</div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 sm:py-40">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-24 items-center">
            <div className="space-y-8 sm:space-y-12">
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-none">
                  {isRtl ? 'איך זה עובד?' : 'How it works?'}
                </h2>
                <p className="text-base sm:text-xl text-gray-500 font-medium">
                  {isRtl ? 'שלושה צעדים פשוטים להתחלת הקריירה החדשה שלך.' : 'Three simple steps to start your new career.'}
                </p>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {[
                  { 
                    step: '01', 
                    title: isRtl ? 'צור פרופיל' : 'Create Profile', 
                    desc: isRtl ? 'הגדר את המיומנויות שלך או את מה שאתה רוצה ללמוד.' : 'Define your skills or what you want to learn.',
                    icon: UserIcon
                  },
                  { 
                    step: '02', 
                    title: isRtl ? 'מצא התאמה' : 'Find a Match', 
                    desc: isRtl ? 'חפש הזדמנויות לפי מיקום, מקצוע או שכר.' : 'Search for opportunities by location, trade, or pay.',
                    icon: Search
                  },
                  { 
                    step: '03', 
                    title: isRtl ? 'התחל ללמוד' : 'Start Learning', 
                    desc: isRtl ? 'צא לשטח, צבור ניסיון מעשי ובנה את העתיד שלך.' : 'Go to the field, gain hands-on experience and build your future.',
                    icon: Zap
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 sm:gap-8 group">
                    <div className="text-3xl sm:text-4xl font-black text-gray-200 group-hover:text-blue-600 transition-colors duration-500 shrink-0">{item.step}</div>
                    <div className="space-y-1 sm:space-y-2">
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900">{item.title}</h3>
                      <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link 
                to="/auth?mode=signup"
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 w-full sm:w-auto justify-center"
              >
                {isRtl ? 'התחל עכשיו' : 'Start Now'}
                <ArrowRight size={18} className="rtl:rotate-180" />
              </Link>
            </div>

            {/* Images grid — hidden on mobile to save space */}
            <div className="hidden lg:grid grid-cols-2 gap-6">
              <div className="space-y-6 pt-12">
                <img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=600" className="rounded-[2rem] shadow-xl object-cover aspect-[4/5] hover:scale-105 transition-transform duration-500" alt="Barber teaching apprentice" referrerPolicy="no-referrer" />
                <img src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=600" className="rounded-[2rem] shadow-xl object-cover aspect-square hover:scale-105 transition-transform duration-500" alt="Plumber teaching" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-6">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600" className="rounded-[2rem] shadow-xl object-cover aspect-square hover:scale-105 transition-transform duration-500" alt="Teaching" referrerPolicy="no-referrer" />
                <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600" className="rounded-[2rem] shadow-xl object-cover aspect-[4/5] hover:scale-105 transition-transform duration-500" alt="Electrician" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-40 bg-gray-50 text-gray-900 rounded-[2rem] sm:rounded-[4rem] mx-4 sm:mx-6 mb-10 sm:mb-20 border border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center space-y-4 sm:space-y-6 mb-12 sm:mb-32">
            <h2 className="text-3xl sm:text-6xl font-black tracking-tight">
              {isRtl ? 'למה לבחור ב-SkillLink?' : 'Why choose SkillLink?'}
            </h2>
            <p className="text-base sm:text-xl text-gray-500 font-medium max-w-2xl mx-auto">
              {isRtl 
                ? 'אנחנו בונים את הגשר בין הידע המקצועי של הדור הוותיק לבין התשוקה של הדור החדש.'
                : 'We build the bridge between the professional knowledge of the veteran generation and the passion of the new generation.'}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12">
            {[
              {
                title: isRtl ? 'למידה מעשית' : 'Hands-on Learning',
                desc: isRtl ? 'צאו לשטח ותלמדו איך הדברים באמת עובדים.' : 'Go to the field and learn how things really work.',
                icon: Zap,
                color: 'text-blue-600',
                bg: 'bg-blue-50'
              },
              {
                title: isRtl ? 'רשת מקצועית' : 'Pro Network',
                desc: isRtl ? 'בנו קשרים עם מקצוענים מובילים בתחום שלכם.' : 'Build connections with leading professionals.',
                icon: Users,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50'
              },
              {
                title: isRtl ? 'אימות וביטחון' : 'Verified & Safe',
                desc: isRtl ? 'כל המנטורים עוברים תהליך אימות קפדני.' : 'All mentors undergo rigorous verification.',
                icon: ShieldCheck,
                color: 'text-purple-600',
                bg: 'bg-purple-50'
              },
              {
                title: isRtl ? 'צמיחה כלכלית' : 'Earn While Learning',
                desc: isRtl ? 'מנטורים מקבלים עזרה ומתלמדים מקבלים שכר.' : 'Mentors get help and apprentices get paid.',
                icon: Award,
                color: 'text-orange-600',
                bg: 'bg-orange-50'
              }
            ].map((feature, i) => (
              <div key={i} className="space-y-3 sm:space-y-6 group">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 ${feature.bg} rounded-2xl flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-base sm:text-2xl font-black">{feature.title}</h3>
                <p className="text-xs sm:text-base text-gray-500 font-medium leading-relaxed hidden sm:block">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-40">
        <div className="max-w-4xl mx-auto px-5 text-center space-y-8 sm:space-y-12">
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9]">
            {isRtl ? 'מוכנים לבנות את העתיד שלכם?' : 'Ready to build your future?'}
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 justify-center">
            <Link 
              to="/auth?mode=signup" 
              className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-base uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 text-center"
            >
              {isRtl ? 'הצטרפו עכשיו בחינם' : 'Join now for free'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-20 border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-12">
            <div className="space-y-3 text-center md:text-start">
              <div className="text-2xl sm:text-3xl font-black tracking-tighter text-black">
                SkillLink<span className="text-blue-600">.</span>
              </div>
              <p className="text-gray-400 font-medium max-w-xs text-sm">
                {isRtl ? 'הבית של המקצוענים החדשים בישראל.' : 'The home of the new professionals in Israel.'}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 sm:gap-12 text-xs font-black uppercase tracking-widest">
              <Link to="/about" className="text-gray-400 hover:text-black transition-colors">{isRtl ? 'אודות' : 'About'}</Link>
              <Link to="/contact" className="text-gray-400 hover:text-black transition-colors">{isRtl ? 'קשר' : 'Contact'}</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-black transition-colors">{isRtl ? 'פרטיות' : 'Privacy'}</Link>
              <Link to="/terms" className="text-gray-400 hover:text-black transition-colors">{isRtl ? 'תנאים' : 'Terms'}</Link>
            </div>
          </div>
          <div className="mt-10 sm:mt-20 pt-8 sm:pt-12 border-t border-gray-200 text-center">
            <p className="text-gray-400 font-bold text-[10px] sm:text-xs uppercase tracking-[0.3em]">
              © 2026 SkillLink. {isRtl ? 'כל הזכויות שמורות.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
