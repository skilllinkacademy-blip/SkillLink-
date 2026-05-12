import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Zap, Users, Award,
  Briefcase, GraduationCap, Star, CheckCircle2, ChevronDown, Link2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { carpenterMentorImg } from '../lib/assets';

const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=80',
];

const MARQUEE = ['חשמלאות','Electrical','ריתוך','Welding','נגרות','Carpentry','אינסטלציה','Plumbing','בנייה','Construction','מכונאות','Mechanics','ספרות','Barbering'];

interface LandingProps { isRtl: boolean; }

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className={className}>
      {children}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

function MentorApprenticeScene({ isRtl }: { isRtl: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-28 sm:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/50 to-white pointer-events-none" />

      {/* Section label */}
      <div className="relative text-center mb-16 px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-[11px] font-black text-blue-600 uppercase tracking-[.25em] mb-3"
        >
          {isRtl ? 'הרעיון מאחורי SkillLink' : 'The SkillLink Connection'}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950"
        >
          {isRtl ? 'מנטור פוגש ' : 'Mentor meets '}
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            {isRtl ? 'חניך' : 'Apprentice'}
          </span>
        </motion.h2>
      </div>

      {/* Cards scene */}
      <div className="relative flex items-center justify-center gap-3 sm:gap-6 lg:gap-10 max-w-4xl mx-auto px-4">

        {/* Mentor card */}
        <motion.div
          initial={{ x: isRtl ? 100 : -100, opacity: 0, rotate: isRtl ? 3 : -3 }}
          animate={inView ? { x: 0, opacity: 1, rotate: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="w-[140px] sm:w-[200px] lg:w-[240px] rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/15 border-2 border-blue-200 flex-shrink-0"
        >
          <div className="aspect-[3/4] relative">
            <img src={carpenterMentorImg} alt="Mentor" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 rounded-full text-[10px] font-black text-white uppercase tracking-wider">
              {isRtl ? 'מנטור' : 'Mentor'}
            </div>
            <motion.div
              initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
              transition={{ type: 'spring', delay: 0.85 }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center"
            >
              <ShieldCheck size={16} className="text-blue-600" />
            </motion.div>
          </div>
          <div className="bg-white p-3 sm:p-4">
            <div className="text-xs font-black text-gray-900">{isRtl ? 'יעקב כהן' : 'Jacob Cohen'}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{isRtl ? 'ריתוך · 12 שנה' : 'Welding · 12 yrs'}</div>
            <div className="flex items-center gap-0.5 mt-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={8} className="text-yellow-400 fill-yellow-400" />)}
              <span className="text-[10px] text-gray-400 ml-1">4.9</span>
            </div>
          </div>
        </motion.div>

        {/* Center connector */}
        <div className="relative flex flex-col items-center gap-4 flex-shrink-0 z-10">
          {/* Lines + icon row */}
          <div className="flex items-center">
            <motion.div
              initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="w-8 sm:w-14 h-0.5 bg-gradient-to-l from-blue-400 to-transparent origin-right"
            />
            <motion.div
              initial={{ scale: 0, rotate: -20 }} animate={inView ? { scale: 1, rotate: 0 } : {}}
              transition={{ type: 'spring', stiffness: 220, delay: 0.72 }}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/35 mx-1"
            >
              <Link2 size={22} className="text-white sm:hidden" />
              <Link2 size={28} className="text-white hidden sm:block" />
            </motion.div>
            <motion.div
              initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="w-8 sm:w-14 h-0.5 bg-gradient-to-r from-blue-400 to-transparent origin-left"
            />
          </div>

          {/* Match badge */}
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.85 }} animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.55, delay: 1.1 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 px-3 py-2.5 text-center w-[100px] sm:w-[120px]"
          >
            <div className="text-[10px] text-gray-400 font-medium">{isRtl ? 'התאמה!' : 'Match Found!'}</div>
            <div className="text-xl sm:text-2xl font-black text-blue-600 leading-tight">96%</div>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={7} className="text-yellow-400 fill-yellow-400" />)}
            </div>
          </motion.div>
        </div>

        {/* Apprentice card */}
        <motion.div
          initial={{ x: isRtl ? -100 : 100, opacity: 0, rotate: isRtl ? -3 : 3 }}
          animate={inView ? { x: 0, opacity: 1, rotate: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-[140px] sm:w-[200px] lg:w-[240px] rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/10 border-2 border-gray-200 flex-shrink-0"
        >
          <div className="aspect-[3/4] relative">
            <img src={carpenterMentorImg} alt="Apprentice" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 rounded-full text-[10px] font-black text-gray-700 uppercase tracking-wider">
              {isRtl ? 'חניך' : 'Apprentice'}
            </div>
            <motion.div
              initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
              transition={{ type: 'spring', delay: 1.0 }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-900 shadow-md flex items-center justify-center"
            >
              <GraduationCap size={14} className="text-white" />
            </motion.div>
          </div>
          <div className="bg-white p-3 sm:p-4">
            <div className="text-xs font-black text-gray-900">{isRtl ? 'אלי בן-דוד' : 'Eli Ben-David'}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{isRtl ? 'מחפש מנטור' : 'Seeking mentor'}</div>
            <motion.div
              initial={{ width: 0 }} animate={inView ? { width: '100%' } : {}}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="h-1 bg-blue-600 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="relative text-center text-gray-400 text-sm mt-12 max-w-sm mx-auto px-6"
      >
        {isRtl
          ? 'AI מוצא את ההתאמה המושלמת לפי מיקום, מקצוע ורמת ניסיון'
          : 'AI finds the perfect match based on location, trade, and experience'}
      </motion.p>
    </section>
  );
}

export default function Landing({ isRtl }: LandingProps) {
  const [counts, setCounts] = useState({ mentors: 0, mentees: 0, total: 0 });

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentor'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentee'),
    ]).then(([{ count: m }, { count: a }]) => {
      const t = (m || 0) + (a || 0);
      setCounts({ mentors: m || 0, mentees: a || 0, total: t > 0 ? t : 500 });
    }).catch(() => setCounts({ mentors: 120, mentees: 380, total: 500 }));
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes mq { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .mq { animation: mq 28s linear infinite; }
        .mq:hover { animation-play-state: paused }
        @keyframes float { 0%,100% { transform: translateY(0px) } 50% { transform: translateY(-10px) } }
        .float-anim { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* ─── HERO ──────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute top-[-8%] right-[-5%] w-[550px] h-[550px] bg-blue-100/70 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-8%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left: Text */}
          <div className="space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-[.18em]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {isRtl ? 'SkillLink · בטא פעילה' : 'SkillLink · Active Beta'}
            </motion.div>

            <div>
              {(isRtl
                ? [
                    { text: 'למד מקצוע', cls: 'text-gray-950' },
                    { text: 'בשטח,', cls: 'text-gray-950' },
                    { text: 'עם מנטור.', cls: 'bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent' },
                  ]
                : [
                    { text: 'Learn a trade', cls: 'text-gray-950' },
                    { text: 'in the field,', cls: 'text-gray-950' },
                    { text: 'with a mentor.', cls: 'bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent' },
                  ]
              ).map((line, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.p
                    initial={{ y: '105%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.85, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={`font-black leading-[1.0] tracking-tight ${line.cls}`}
                    style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.8rem)' }}
                  >
                    {line.text}
                  </motion.p>
                </div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.45 }}
              className="text-gray-500 text-lg leading-relaxed max-w-md"
            >
              {isRtl
                ? 'SkillLink מחברת מנטורים מנוסים עם חניכים מוטיבציוניים בתחומי המקצועות המעשיים.'
                : 'SkillLink connects experienced trade mentors with motivated apprentices across Israel.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/auth?mode=signup"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-[.97]">
                {isRtl ? 'הצטרפות חינם' : 'Join for Free'}
                <ArrowRight size={15} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/app/opportunities"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-sm transition-all">
                {isRtl ? 'עיון בהזדמנויות' : 'Browse Opportunities'}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2.5 rtl:space-x-reverse">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="text-gray-900 font-bold">{counts.total || 500}+</span>
                {' '}{isRtl ? 'מקצוענים בפלטפורמה' : 'professionals on the platform'}
              </p>
            </motion.div>
          </div>

          {/* Right: Floating mentor hero card */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? -50 : 50, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:flex justify-center"
          >
            <div className="absolute inset-8 bg-blue-400/20 rounded-[3rem] blur-[60px]" />
            <div className="float-anim relative w-[280px] rounded-3xl overflow-hidden border-2 border-blue-100 shadow-2xl shadow-blue-900/15">
              <div className="aspect-[4/5] relative">
                <img src={carpenterMentorImg} alt="Mentor" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 rounded-full text-white text-[11px] font-black uppercase tracking-widest">
                  {isRtl ? 'מנטור' : 'Mentor'}
                </div>
                <div className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
                  <ShieldCheck size={18} className="text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-black text-gray-900">{isRtl ? 'יעקב כהן' : 'Jacob Cohen'}</div>
                    <div className="text-sm text-gray-400">{isRtl ? 'קבלן · תל אביב' : 'Contractor · Tel Aviv'}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-black text-yellow-600">4.9</span>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute -bottom-5 -left-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-3.5 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="text-base font-black text-gray-900">500+</div>
                <div className="text-[11px] text-gray-400">{isRtl ? 'רשומים' : 'Members'}</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="absolute -top-3 -right-3 bg-white rounded-2xl shadow-xl border border-gray-100 px-3.5 py-2.5 flex items-center gap-2"
            >
              <ShieldCheck size={14} className="text-blue-600" />
              <span className="text-xs font-black text-gray-900">{isRtl ? 'מנטור מאומת' : 'Verified Mentor'}</span>
            </motion.div>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown size={22} className="text-gray-300" />
        </motion.div>
      </section>

      {/* ─── MARQUEE ──────────────────────────────────── */}
      <div className="relative border-y border-gray-100 py-4 overflow-hidden bg-gray-50">
        <div className="flex whitespace-nowrap">
          <div className="mq flex shrink-0">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-5 text-[11px] font-black uppercase tracking-[.22em] text-gray-400">
                {item}
                <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MENTOR + APPRENTICE ANIMATION ────────────── */}
      <MentorApprenticeScene isRtl={isRtl} />

      {/* ─── STATS DARK BAND ──────────────────────────── */}
      <section className="py-16 sm:py-20 bg-gray-950 text-white">
        <Section className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { n: `${counts.mentors || 120}+`, l: { he: 'מנטורים', en: 'Mentors' } },
              { n: `${counts.mentees || 380}+`, l: { he: 'חניכים', en: 'Apprentices' } },
              { n: '15+', l: { he: 'מקצועות', en: 'Trades' } },
              { n: '100%', l: { he: 'חינם', en: 'Free' } },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="space-y-2">
                <p className="font-black leading-none tracking-tight"
                  style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}>{s.n}</p>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-[.2em]">
                  {isRtl ? s.l.he : s.l.en}
                </p>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ─── BENTO FEATURES ───────────────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <Section className="mb-12">
            <motion.p variants={fadeUp} className="text-[11px] font-black text-blue-600 uppercase tracking-[.25em] mb-3">
              {isRtl ? 'למה SkillLink?' : 'Why SkillLink?'}
            </motion.p>
            <motion.h2 variants={fadeUp}
              className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] text-gray-950 max-w-lg">
              {isRtl ? 'הפלטפורמה שנבנתה\nבשביל המקצוענים' : 'The platform built\nfor the trades'}
            </motion.h2>
          </Section>

          <Section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* AI wide */}
            <motion.div variants={fadeUp}
              className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white">
              <div className="absolute top-0 right-0 w-[250px] h-[200px] bg-white/10 rounded-full blur-[80px]" />
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                  <Zap size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-black mb-2">{isRtl ? 'התאמת AI חכמה' : 'Smart AI Matching'}</h3>
                <p className="text-blue-100 text-sm leading-relaxed max-w-sm mb-6">
                  {isRtl
                    ? 'אלגוריתם מנתח מיקום, מקצוע וניסיון ומוצא את ההתאמה המדויקת ביותר.'
                    : 'Algorithm analyzes location, trade & experience to find your most precise match.'}
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} whileInView={{ width: '92%' }}
                      transition={{ duration: 1.3, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-white rounded-full" />
                  </div>
                  <span className="text-white text-sm font-black">92%</span>
                  <span className="text-blue-200 text-[11px]">{isRtl ? 'דיוק' : 'accuracy'}</span>
                </div>
              </div>
            </motion.div>

            {/* Verified */}
            <motion.div variants={fadeUp}
              className="rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors p-8">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
                <ShieldCheck size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-black mb-2 text-gray-950">{isRtl ? 'מנטורים מאומתים' : 'Verified Mentors'}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                {isRtl ? 'כל מנטור עובר תהליך אימות מקיף.' : 'Every mentor goes through thorough verification.'}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-blue-700 text-[11px] font-black uppercase tracking-widest">
                  {isRtl ? 'מאומת ✓' : 'Verified ✓'}
                </span>
              </div>
            </motion.div>

            {/* Community */}
            <motion.div variants={fadeUp}
              className="rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors p-8">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
                <Users size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-black mb-2 text-gray-950">{isRtl ? 'קהילה פעילה' : 'Active Community'}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                {isRtl ? 'רשת של מקצוענים שעוזרים אחד לשני.' : "A network of pros helping each other grow."}
              </p>
              <div className="flex -space-x-2.5 rtl:space-x-reverse">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white">+</span>
                </div>
              </div>
            </motion.div>

            {/* Recognition wide */}
            <motion.div variants={fadeUp}
              className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gray-950 text-white p-8">
              <div className="absolute top-0 right-0 w-64 h-52 bg-blue-600/15 rounded-full blur-[80px]" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                    <Award size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-2">{isRtl ? 'הכרה מקצועית' : 'Professional Recognition'}</h3>
                  <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                    {isRtl ? 'בנה פרופיל מוניטין שפותח דלתות בתעשייה.' : 'Build a reputation profile that opens doors.'}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {[...Array(5)].map((_, i) => <Star key={i} size={24} className="text-yellow-400 fill-yellow-400" />)}
                </div>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <Section className="mb-14 text-center">
            <motion.p variants={fadeUp} className="text-[11px] font-black text-blue-600 uppercase tracking-[.25em] mb-3">
              {isRtl ? 'תהליך פשוט' : 'Simple Process'}
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
              {isRtl ? 'איך זה עובד?' : 'How does it work?'}
            </motion.h2>
          </Section>
          <Section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                n: '01',
                icon: GraduationCap,
                gradient: 'from-blue-50 to-blue-100/60',
                iconBg: 'bg-blue-600',
                num: 'text-blue-200',
                t: { he: 'צור פרופיל', en: 'Create Profile' },
                d: { he: 'הגדר כישורים, מיקום וסוג ההזדמנות שאתה מחפש.', en: 'Set your skills, location and the opportunity type you\'re looking for.' },
              },
              {
                n: '02',
                icon: Zap,
                gradient: 'from-gray-950 to-gray-900',
                iconBg: 'bg-blue-600',
                num: 'text-white/10',
                t: { he: 'התאמת AI', en: 'AI Match' },
                d: { he: 'AI מוצא את ההתאמה הטובה ביותר לפי מיקום ומקצוע.', en: 'AI finds your best match by location and trade — instantly.' },
                dark: true,
              },
              {
                n: '03',
                icon: Briefcase,
                gradient: 'from-blue-600 to-blue-700',
                iconBg: 'bg-white/20',
                num: 'text-white/10',
                t: { he: 'התחל בשטח', en: 'Start in the Field' },
                d: { he: 'צבור ניסיון מעשי אמיתי תחת הנחיית מקצוען מנוסה.', en: 'Gain real hands-on experience under a seasoned professional.' },
                blue: true,
              },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp}
                className={`group relative rounded-3xl overflow-hidden p-8 min-h-[260px] flex flex-col justify-between bg-gradient-to-br ${step.gradient} hover:scale-[1.01] transition-all duration-500`}>
                <span className={`absolute top-5 right-6 text-[6rem] font-black leading-none select-none pointer-events-none ${step.num}`}>{step.n}</span>
                <div className={`w-11 h-11 rounded-2xl ${step.iconBg} flex items-center justify-center mb-auto`}>
                  <step.icon size={20} className={step.blue || step.dark ? 'text-white' : 'text-white'} />
                </div>
                <div className="mt-16">
                  <h3 className={`text-lg font-black mb-2 ${step.blue || step.dark ? 'text-white' : 'text-gray-950'}`}>
                    {isRtl ? step.t.he : step.t.en}
                  </h3>
                  <p className={`text-sm leading-relaxed ${step.blue ? 'text-blue-100' : step.dark ? 'text-white/50' : 'text-gray-500'}`}>
                    {isRtl ? step.d.he : step.d.en}
                  </p>
                </div>
              </motion.div>
            ))}
          </Section>
        </div>
      </section>

      {/* ─── SPLIT CTA ────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <Section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Mentor */}
            <motion.div variants={fadeUp}
              className="group relative rounded-3xl overflow-hidden min-h-[420px] flex flex-col justify-between p-8 sm:p-10 bg-gray-950 text-white">
              <img src={carpenterMentorImg} alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/50 to-gray-950/80" />
              <div className="absolute top-0 right-0 w-72 h-52 bg-blue-600/15 rounded-full blur-[80px]" />
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-widest border border-white/10">
                  <Briefcase size={11} />
                  {isRtl ? 'למנטורים' : 'For Masters'}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                  {isRtl ? 'העבר ידע.\nקבל עזרה.' : 'Share knowledge.\nGet help.'}
                </h3>
                <ul className="space-y-2.5 pt-1">
                  {(isRtl
                    ? ['פרסם הזדמנות בחינם','קבל עזרה מחניכים מוטיבציוניים','אמת חשבון וקבל פי 5 יותר פניות']
                    : ['Post an opportunity for free','Get help from motivated apprentices','Verify and get 5x more responses']
                  ).map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-white/60">
                      <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/auth?mode=signup&role=mentor"
                className="relative inline-flex items-center gap-2 w-fit mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm transition-all active:scale-95">
                {isRtl ? 'הצטרף כמנטור' : 'Join as Master'}
                <ArrowRight size={14} className="rtl:rotate-180" />
              </Link>
            </motion.div>

            {/* Apprentice */}
            <motion.div variants={fadeUp}
              className="group relative rounded-3xl overflow-hidden min-h-[420px] flex flex-col justify-between p-8 sm:p-10 bg-white border-2 border-gray-100 hover:border-blue-200 transition-colors">
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-widest border border-blue-200">
                  <GraduationCap size={11} />
                  {isRtl ? 'לחניכים' : 'For Apprentices'}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black leading-tight text-gray-950">
                  {isRtl ? 'למד מהטובים.\nהתחל להרוויח.' : 'Learn from the best.\nStart earning.'}
                </h3>
                <ul className="space-y-2.5 pt-1">
                  {(isRtl
                    ? ['גלה מנטורים לפי מיקום ומקצוע','ראה ציון התאמה AI לפני פנייה','קבל ניסיון מעשי ושכר']
                    : ['Find mentors by location and trade','See AI match score before applying','Get hands-on experience and pay']
                  ).map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-gray-500">
                      <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/auth?mode=signup&role=mentee"
                className="relative inline-flex items-center gap-2 w-fit mt-2 px-6 py-3 bg-gray-950 hover:bg-gray-800 text-white rounded-full font-bold text-sm transition-all active:scale-95">
                {isRtl ? 'הצטרף כחניך' : 'Join as Apprentice'}
                <ArrowRight size={14} className="rtl:rotate-180" />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────── */}
      <section className="py-28 sm:py-40 text-center overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-100/70 rounded-full blur-[100px] pointer-events-none" />
        <Section className="relative max-w-4xl mx-auto px-6 space-y-8">
          <motion.div variants={fadeUp} className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
          </motion.div>
          <div>
            <div className="overflow-hidden">
              <motion.h2 variants={fadeUp}
                className="font-black text-gray-950 leading-[.95] tracking-tight"
                style={{ fontSize: 'clamp(2.4rem, 8vw, 6.5rem)' }}>
                {isRtl ? 'מוכן לבנות' : 'Ready to build'}
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2 variants={fadeUp}
                className="font-black leading-[.95] tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
                style={{ fontSize: 'clamp(2.4rem, 8vw, 6.5rem)' }}>
                {isRtl ? 'את הקריירה שלך?' : 'your career?'}
              </motion.h2>
            </div>
          </div>
          <motion.p variants={fadeUp} className="text-gray-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            {isRtl
              ? 'הצטרפו לפלטפורמה שבה מנטורים וחניכים בונים קשרים מקצועיים שנמשכים שנים.'
              : 'Join the platform where mentors and apprentices build lasting professional relationships.'}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/auth?mode=signup"
              className="group inline-flex items-center justify-center gap-2 px-9 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-xl shadow-blue-600/25 active:scale-[.97]">
              {isRtl ? 'התחל בחינם' : 'Get Started Free'}
              <ArrowRight size={15} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/app/opportunities"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-sm transition-all">
              {isRtl ? 'עיון ללא הרשמה' : 'Browse without signing up'}
            </Link>
          </motion.div>
        </Section>
      </section>

      {/* ─── FOOTER ───────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-3">
            <div className="text-xl font-black tracking-tighter text-gray-950" dir="ltr">
              Skill<span className="text-blue-600">Link</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              {isRtl ? 'הבית של המקצוענים החדשים בישראל.' : "The home of Israel's next generation tradespeople."}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-gray-400">
            {[
              { to:'/about',   he:'אודות',   en:'About' },
              { to:'/contact', he:'צור קשר', en:'Contact' },
              { to:'/privacy', he:'פרטיות',  en:'Privacy' },
              { to:'/terms',   he:'תנאים',   en:'Terms' },
            ].map(l => (
              <Link key={l.to} to={l.to} className="hover:text-gray-900 transition-colors">
                {isRtl ? l.he : l.en}
              </Link>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-gray-100 flex justify-between text-[11px] text-gray-300">
          <p>© 2026 SkillLink.</p>
          <p className="uppercase tracking-widest">{isRtl ? 'נבנה בישראל' : 'Built in Israel'}</p>
        </div>
      </footer>
    </div>
  );
}
