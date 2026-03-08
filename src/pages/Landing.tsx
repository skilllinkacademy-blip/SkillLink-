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
      setCounts({ 
        mentors: mentorCount || 0, 
        mentees: menteeCount || 0, 
        total: total > 0 ? total : 500 // Fallback to 500 if DB is empty for demo
      });
    };

    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-blue-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 space-y-10 text-center lg:text-start rtl:lg:text-start"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                <Zap size={14} className="text-blue-400" />
                {isRtl ? 'הפלטפורמה המובילה למקצועות טכניים' : 'The #1 platform for skilled trades'}
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-gray-900 leading-[0.9] tracking-tighter">
                {isRtl ? (
                  <>ללמוד ישירות מ<span className="text-blue-600">מקצוענים</span></>
                ) : (
                  <>Learn directly from <span className="text-blue-600">real professionals</span></>
                )}
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {isRtl 
                  ? 'חברו למנטורים מיומנים באינסטלציה, חשמל, נגרות ועוד. התחילו את מסע ההתלמדות שלכם היום עם הדרכה צמודה בשטח.'
                  : 'Connect with skilled mentors in plumbing, electrical, carpentry and more. Start your apprentice journey today with hands-on field guidance.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <Link 
                  to="/auth?role=mentor" 
                  className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 group active:scale-95"
                >
                  {isRtl ? 'הצטרפות כמנטור' : 'Join as Mentor'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                </Link>
                <Link 
                  to="/auth?role=mentee" 
                  className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border-2 border-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center active:scale-95"
                >
                  {isRtl ? 'הצטרפות כמתלמד' : 'Join as Apprentice'}
                </Link>
              </div>
              
              <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
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
                      className="w-12 h-12 rounded-full border-4 border-white shadow-sm object-cover"
                      alt="User"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-bold text-gray-400">
                    <span className="text-gray-900 font-black">{counts.total}+</span> {isRtl ? 'מקצוענים כבר כאן' : 'Professionals already here'}
                  </div>
                  <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> {counts.mentors} {isRtl ? 'מנטורים' : 'Mentors'}</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> {counts.mentees} {isRtl ? 'מתלמדים' : 'Apprentices'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 relative"
            >
              <div className="relative rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] rotate-2 hover:rotate-0 transition-transform duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1200" 
                  alt="Professional at work"
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-none">
                  {isRtl ? 'איך זה עובד?' : 'How it works?'}
                </h2>
                <p className="text-xl text-gray-500 font-medium">
                  {isRtl ? 'שלושה צעדים פשוטים להתחלת הקריירה החדשה שלך.' : 'Three simple steps to start your new career.'}
                </p>
              </div>

              <div className="space-y-8">
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
                  <div key={i} className="flex gap-8 group">
                    <div className="text-4xl font-black text-gray-200 group-hover:text-blue-600 transition-colors duration-500">{item.step}</div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>
                      <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6 pt-12">
                <img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=600" className="rounded-[2rem] shadow-xl object-cover aspect-[4/5] hover:scale-105 transition-transform duration-500" alt="Barber teaching apprentice" referrerPolicy="no-referrer" />
                <img src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=600" className="rounded-[2rem] shadow-xl object-cover aspect-square hover:scale-105 transition-transform duration-500" alt="Plumber teaching" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-6">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600" className="rounded-[2rem] shadow-xl object-cover aspect-square hover:scale-105 transition-transform duration-500" alt="Social media manager with apprentice" referrerPolicy="no-referrer" />
                <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600" className="rounded-[2rem] shadow-xl object-cover aspect-[4/5] hover:scale-105 transition-transform duration-500" alt="Electrician" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Imagery Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-black leading-tight">
                {isRtl ? 'ללמוד מהטובים ביותר, בשטח.' : 'Learn from the best, in the field.'}
              </h2>
              <p className="text-xl text-gray-500 font-medium leading-relaxed">
                {isRtl 
                  ? 'SkillLink מחברת בין מומחים בתעשייה לבין הדור הבא של בעלי המקצוע. אנחנו מאמינים שהדרך הטובה ביותר ללמוד היא דרך הידיים, עם הדרכה צמודה של מי שכבר עשה את זה.'
                  : 'SkillLink connects industry experts with the next generation of tradespeople. We believe the best way to learn is hands-on, with close guidance from those who have already done it.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="font-black text-black">{isRtl ? 'מומחים מאומתים' : 'Verified Experts'}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{isRtl ? 'ליווי מקצועי' : 'Professional Mentorship'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <Zap size={24} />
                  </div>
                  <div>
                    <p className="font-black text-black">{isRtl ? 'למידה מהירה' : 'Fast Learning'}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{isRtl ? 'ניסיון מעשי' : 'Hands-on Experience'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&q=80&w=800" 
                  alt="HVAC installer" 
                  className="rounded-3xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 object-cover aspect-square"
                  referrerPolicy="no-referrer"
                />
                <img 
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800" 
                  alt="Electrician" 
                  className="rounded-3xl shadow-2xl translate-y-12 transform rotate-3 hover:rotate-0 transition-transform duration-500 object-cover aspect-square"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-40 bg-gray-50 text-gray-900 rounded-[4rem] mx-6 mb-20 border border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-6 mb-32">
            <h2 className="text-6xl font-black tracking-tight">
              {isRtl ? 'למה לבחור ב-SkillLink?' : 'Why choose SkillLink?'}
            </h2>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
              {isRtl 
                ? 'אנחנו בונים את הגשר בין הידע המקצועי של הדור הוותיק לבין התשוקה של הדור החדש.'
                : 'We build the bridge between the professional knowledge of the veteran generation and the passion of the new generation.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              {
                title: isRtl ? 'למידה מעשית' : 'Hands-on Learning',
                desc: isRtl ? 'אל תסתפקו בתיאוריה. צאו לשטח ותלמדו איך הדברים באמת עובדים.' : 'Don\'t settle for theory. Go out to the field and learn how things really work.',
                icon: Zap,
                color: 'text-blue-600'
              },
              {
                title: isRtl ? 'רשת מקצועית' : 'Professional Network',
                desc: isRtl ? 'בנו קשרים עם בעלי עסקים ומקצוענים מובילים בתחום שלכם.' : 'Build connections with business owners and leading professionals in your field.',
                icon: Users,
                color: 'text-emerald-600'
              },
              {
                title: isRtl ? 'אימות וביטחון' : 'Verified & Secure',
                desc: isRtl ? 'כל המנטורים עוברים תהליך אימות קפדני כדי להבטיח סביבת למידה בטוחה.' : 'All mentors undergo a rigorous verification process to ensure a safe learning environment.',
                icon: ShieldCheck,
                color: 'text-purple-600'
              },
              {
                title: isRtl ? 'צמיחה כלכלית' : 'Financial Growth',
                desc: isRtl ? 'התחילו להרוויח תוך כדי למידה. מנטורים מקבלים עזרה ומתלמדים מקבלים שכר.' : 'Start earning while learning. Mentors get help and apprentices get paid.',
                icon: Award,
                color: 'text-orange-600'
              }
            ].map((feature, i) => (
              <div key={i} className="space-y-6 group">
                <div className={`${feature.color} group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon size={48} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-black">{feature.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-6xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9]">
            {isRtl ? 'מוכנים לבנות את העתיד שלכם?' : 'Ready to build your future?'}
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
            <Link 
              to="/auth?mode=signup" 
              className="w-full sm:w-auto px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95"
            >
              {isRtl ? 'הצטרפו עכשיו בחינם' : 'Join now for free'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-4 text-center md:text-start">
              <div className="text-3xl font-black tracking-tighter text-black">
                SkillLink<span className="text-blue-600">.</span>
              </div>
              <p className="text-gray-400 font-medium max-w-xs">
                {isRtl ? 'הבית של המקצוענים החדשים בישראל.' : 'The home of the new professionals in Israel.'}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-sm font-black uppercase tracking-widest">
              <Link to="/about" className="text-gray-400 hover:text-black transition-colors">{isRtl ? 'אודות' : 'About'}</Link>
              <Link to="/contact" className="text-gray-400 hover:text-black transition-colors">{isRtl ? 'קשר' : 'Contact'}</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-black transition-colors">{isRtl ? 'פרטיות' : 'Privacy'}</Link>
              <Link to="/terms" className="text-gray-400 hover:text-black transition-colors">{isRtl ? 'תנאים' : 'Terms'}</Link>
            </div>
          </div>
          <div className="mt-20 pt-12 border-t border-gray-200 text-center">
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">
              © 2026 SkillLink. {isRtl ? 'כל הזכויות שמורות.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
