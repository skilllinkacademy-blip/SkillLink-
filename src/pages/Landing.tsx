import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Zap, Users,
  Briefcase, GraduationCap, Star, CheckCircle2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  carpenterMentorImg,
  barberMentorImg,
  electricianMentorImg,
  constructionMentorImg,
} from '../lib/assets';

const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=80',
];

const MARQUEE_ITEMS = [
  'חשמלאות', 'Electrical', 'ריתוך', 'Welding', 'נגרות', 'Carpentry',
  'אינסטלציה', 'Plumbing', 'בנייה', 'Construction', 'מכונאות', 'Mechanics', 'ספרות', 'Barbering',
];

interface LandingProps { isRtl: boolean; }

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

export default function Landing({ isRtl }: LandingProps) {
  const [total, setTotal] = useState(500);
  const meetRef = useRef(null);
  const { scrollYProgress: meetProgress } = useScroll({ target: meetRef, offset: ['start end', 'center center'] });
  const rawMentorX = useTransform(meetProgress, [0, 1], ['-120px', '0px']);
  const rawApprenticeX = useTransform(meetProgress, [0, 1], ['120px', '0px']);
  const mentorX = useSpring(rawMentorX, { stiffness: 60, damping: 20 });
  const apprenticeX = useSpring(rawApprenticeX, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (!supabase) return;
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .then(({ count }) => { if (count && count > 0) setTotal(count); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes mq { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .mq { animation: mq 30s linear infinite; }
        .mq:hover { animation-play-state: paused }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float-anim { animation: float 5s ease-in-out infinite; }
      `}</style>

      {/* ══════════════════ 1. HERO ══════════════════ */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden px-5 sm:px-8 lg:px-14 py-20">
        {/* blobs */}
        <div className="absolute -top-32 right-[-5%] w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[380px] h-[380px] bg-blue-50/80 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Text */}
          <div className="space-y-6 order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-[.18em]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {isRtl ? 'SkillLink · בטא פעילה' : 'SkillLink · Active Beta'}
            </motion.div>

            <div>
              {(isRtl
                ? ['למד מקצוע', 'מהטובים ביותר.']
                : ['Learn a trade', 'from the best.']
              ).map((line, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.h1
                    initial={{ y: '105%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={`font-black leading-[1.02] tracking-tight block ${
                      i === 1
                        ? 'bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent'
                        : 'text-gray-950'
                    }`}
                    style={{ fontSize: 'clamp(2.4rem, 5.5vw, 5rem)' }}
                  >
                    {line}
                  </motion.h1>
                </div>
              ))}
            </div>

            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-md">
              {isRtl
                ? 'SkillLink מחברת מנטורים מנוסים עם חניכים מוטיבציוניים בתחומי המקצועות המעשיים בישראל.'
                : 'SkillLink connects experienced trade mentors with motivated apprentices across Israel.'}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.5 }}
              className="flex flex-wrap gap-3">
              <Link to="/auth?mode=signup"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-xl shadow-blue-600/28 active:scale-[.97]">
                {isRtl ? 'הצטרפות חינם' : 'Join for Free'}
                <ArrowRight size={15} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/app/opportunities"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-gray-200 hover:border-gray-300 bg-white text-gray-700 rounded-full font-bold text-sm transition-all">
                {isRtl ? 'עיון בהזדמנויות' : 'Browse Opportunities'}
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex items-center gap-3.5">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-black text-gray-900">{total}+</span>{' '}
                {isRtl ? 'מקצוענים בפלטפורמה' : 'professionals on the platform'}
              </p>
            </motion.div>
          </div>

          {/* Card — hidden on small mobile, shown sm+ */}
          <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 lg:order-2 hidden sm:flex justify-center">
            <div className="absolute inset-6 bg-blue-300/20 rounded-[3rem] blur-[60px]" />
            <div className="float-anim relative w-full max-w-[340px] aspect-[4/5] rounded-[2.2rem] overflow-hidden shadow-2xl shadow-blue-900/14 border border-blue-100">
              <img src={carpenterMentorImg} alt="Mentor" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 rounded-full text-white text-[11px] font-black uppercase tracking-widest">
                {isRtl ? 'מנטור מוסמך' : 'Certified Mentor'}
              </div>
              <div className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow">
                <ShieldCheck size={16} className="text-blue-600" />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="font-black text-white text-sm">{isRtl ? 'משה לוי — נגר' : 'Moshe Levi — Carpenter'}</div>
                <div className="text-white/55 text-xs mt-0.5">{isRtl ? 'תל אביב · 15 שנות ניסיון' : 'Tel Aviv · 15 yrs exp.'}</div>
                <div className="flex items-center gap-0.5 mt-1.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={9} className="text-yellow-400 fill-yellow-400" />)}
                  <span className="text-white/50 text-[10px] ms-1">4.9</span>
                </div>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="absolute -bottom-3 -left-3 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
              <div>
                <div className="text-xs font-black text-gray-900">{isRtl ? 'התאמה נמצאה!' : 'Match Found!'}</div>
                <div className="text-[10px] text-gray-400">AI · 96%</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ 2. MARQUEE ══════════════════ */}
      <div className="border-y border-gray-100 py-3.5 overflow-hidden bg-gray-50/70">
        <div className="flex whitespace-nowrap">
          <div className="mq flex shrink-0">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3.5 px-5 text-[10px] font-black uppercase tracking-[.24em] text-gray-400">
                {item} <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════ MENTOR MEETS APPRENTICE ══════════════════ */}
      <section ref={meetRef} className="bg-white overflow-hidden py-10 sm:py-16">
        <Reveal className="text-center px-5 mb-2">
          <p className="text-[11px] font-black text-blue-600 uppercase tracking-[.26em] mb-3">
            {isRtl ? 'SkillLink בפעולה' : 'SkillLink in action'}
          </p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
            {isRtl ? 'מנטור פוגש חניך.' : 'Mentor meets Apprentice.'}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-3 max-w-xs mx-auto leading-relaxed">
            {isRtl
              ? 'הכלים עוברים מיד ליד — והידע עובר איתם.'
              : 'The tools pass hand to hand — and so does the knowledge.'}
          </p>
        </Reveal>

        {/* figures */}
        <div className="relative max-w-3xl mx-auto flex items-end justify-between px-4 sm:px-10">
          {/* Mentor — slides from left */}
          <motion.div style={{ x: mentorX }} className="w-[46%] sm:w-[42%] relative">
            <img src="/mentor_figure.jpg" alt={isRtl ? 'מנטור' : 'Mentor'} className="w-full object-contain select-none" draggable={false} />
          </motion.div>

          {/* Center badge */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[28%] flex flex-col items-center gap-1.5 z-10 pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/40"
            >
              <Zap size={18} className="text-white fill-white" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ delay: 0.65 }}
              className="text-[9px] font-black text-blue-600 uppercase tracking-[.22em] whitespace-nowrap"
            >
              {isRtl ? 'חיבור!' : 'Connected!'}
            </motion.span>
          </div>

          {/* Apprentice — slides from right */}
          <motion.div style={{ x: apprenticeX }} className="w-[46%] sm:w-[42%] relative">
            <img src="/apprentice_figure.jpg" alt={isRtl ? 'חניך' : 'Apprentice'} className="w-full object-contain select-none" draggable={false} />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ 3. HOW IT WORKS ══════════════════ */}
      <section className="py-20 sm:py-28 bg-white px-5 sm:px-8 lg:px-14">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-[.26em] mb-3">
              {isRtl ? 'איך זה עובד?' : 'How it works'}
            </p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
              {isRtl ? 'שלושה צעדים.' : 'Three steps.'}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {isRtl ? ' קריירה שלמה.' : ' A whole career.'}
              </span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                n: '01', icon: GraduationCap, img: barberMentorImg,
                t: { he: 'בנה פרופיל', en: 'Build Profile' },
                d: { he: 'הגדר מקצוע, ניסיון ומיקום — תהליך של שתי דקות.', en: 'Set your trade, experience and location — two minutes.' },
              },
              {
                n: '02', icon: Zap, img: electricianMentorImg,
                t: { he: 'קבל התאמת AI', en: 'Get AI Matched' },
                d: { he: 'האלגוריתם מוצא את ההתאמה הטובה ביותר לפי מיקום ומקצוע.', en: 'The algorithm finds your best match by location and trade.' },
              },
              {
                n: '03', icon: Briefcase, img: constructionMentorImg,
                t: { he: 'התחל בשטח', en: 'Start in the Field' },
                d: { he: 'צבור ניסיון אמיתי תחת הנחיית מקצוען מנוסה.', en: 'Gain real experience under a seasoned pro.' },
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="group rounded-3xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-500 bg-white">
                  <div className="aspect-[3/2] relative overflow-hidden">
                    <img src={step.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-3 left-4 text-5xl font-black text-white/15 leading-none select-none">{step.n}</span>
                    <div className="absolute bottom-3 left-4 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                      <step.icon size={16} className="text-white" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-gray-950 mb-1.5">{isRtl ? step.t.he : step.t.en}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{isRtl ? step.d.he : step.d.en}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. WHY SKILLLINK ══════════════════ */}
      <section className="py-20 sm:py-28 bg-gray-950 text-white px-5 sm:px-8 lg:px-14">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-12 text-center">
            <p className="text-[11px] font-black text-blue-400 uppercase tracking-[.26em] mb-3">
              {isRtl ? 'למה SkillLink?' : 'Why SkillLink?'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {isRtl ? 'הפלטפורמה שנבנתה לשדה.' : 'Built for the field.'}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Zap, color: 'text-blue-400', bg: 'bg-blue-600/15',
                t: { he: 'התאמת AI', en: 'AI Matching' },
                d: { he: '92% דיוק — מנתח מיקום, מקצוע וניסיון.', en: '92% accuracy — analyzes location, trade & experience.' },
              },
              {
                icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-600/15',
                t: { he: 'מנטורים מאומתים', en: 'Verified Mentors' },
                d: { he: 'כל מנטור עובר תהליך אימות מסמכים מקיף.', en: 'Every mentor undergoes thorough document verification.' },
              },
              {
                icon: Users, color: 'text-purple-400', bg: 'bg-purple-600/15',
                t: { he: 'חינם לחלוטין', en: 'Completely Free' },
                d: { he: 'ללא תשלום, ללא עמלות — הכל בחינם לתמיד.', en: 'No fees, no commissions — free forever.' },
              },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="flex gap-4 items-start p-6 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/8 transition-all">
                  <div className={`w-11 h-11 rounded-2xl ${f.bg} flex items-center justify-center shrink-0`}>
                    <f.icon size={20} className={f.color} />
                  </div>
                  <div>
                    <h3 className="font-black text-white mb-1">{isRtl ? f.t.he : f.t.en}</h3>
                    <p className="text-sm text-white/45 leading-relaxed">{isRtl ? f.d.he : f.d.en}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* stats row */}
          <div className="mt-14 pt-10 border-t border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { n: '500+', l: { he: 'מקצוענים', en: 'Professionals' } },
              { n: '15+', l: { he: 'מקצועות', en: 'Trades' } },
              { n: '92%', l: { he: 'דיוק AI', en: 'AI Accuracy' } },
              { n: '100%', l: { he: 'חינם', en: 'Free' } },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <p className="text-3xl sm:text-4xl font-black text-white leading-none">{s.n}</p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1.5">{isRtl ? s.l.he : s.l.en}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. CTA ══════════════════ */}
      <section className="py-20 sm:py-28 px-5 sm:px-8 lg:px-14 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* mentor */}
            <Reveal>
              <div className="relative rounded-3xl overflow-hidden min-h-[360px] flex flex-col justify-between p-7 sm:p-9 bg-gray-950 text-white">
                <img src={carpenterMentorImg} alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-20 hover:opacity-28 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 to-gray-950/95" />
                <div className="absolute top-0 right-0 w-56 h-44 bg-blue-600/20 rounded-full blur-[80px]" />
                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-black uppercase tracking-widest mb-4">
                    <Briefcase size={10} />{isRtl ? 'למנטורים' : 'For Mentors'}
                  </div>
                  <h3 className="text-2xl font-black leading-snug mb-3">
                    {isRtl ? <>העבר ידע.<br />קבל עזרה.</> : <>Share knowledge.<br />Get real help.</>}
                  </h3>
                  <ul className="space-y-2">
                    {(isRtl
                      ? ['פרסם הזדמנות בחינם', 'קבל חניכים מוטיבציוניים', 'פי 5 יותר פניות עם אימות']
                      : ['Post opportunities for free', 'Get motivated apprentices', '5× more responses when verified']
                    ).map((item, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-white/55">
                        <CheckCircle2 size={13} className="text-blue-400 shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/auth?mode=signup&role=mentor"
                  className="relative inline-flex items-center gap-2 w-fit mt-5 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm transition-all active:scale-95">
                  {isRtl ? 'הצטרף כמנטור' : 'Join as Mentor'}
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>
              </div>
            </Reveal>

            {/* apprentice */}
            <Reveal delay={0.1}>
              <div className="relative rounded-3xl overflow-hidden min-h-[360px] flex flex-col justify-between p-7 sm:p-9 border-2 border-gray-100 hover:border-blue-200 transition-colors bg-white">
                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-black uppercase tracking-widest mb-4">
                    <GraduationCap size={10} />{isRtl ? 'לחניכים' : 'For Apprentices'}
                  </div>
                  <h3 className="text-2xl font-black leading-snug mb-3 text-gray-950">
                    {isRtl ? <>למד מהטובים.<br />התחל להרוויח.</> : <>Learn from the best.<br />Start earning.</>}
                  </h3>
                  <ul className="space-y-2">
                    {(isRtl
                      ? ['גלה מנטורים לפי מיקום', 'ציון התאמה AI לפני פנייה', 'ניסיון מעשי אמיתי ושכר']
                      : ['Find mentors by location', 'AI match score before applying', 'Real hands-on experience & pay']
                    ).map((item, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-gray-500">
                        <CheckCircle2 size={13} className="text-blue-600 shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/auth?mode=signup&role=mentee"
                  className="inline-flex items-center gap-2 w-fit mt-5 px-6 py-3 bg-gray-950 hover:bg-gray-800 text-white rounded-full font-bold text-sm transition-all active:scale-95">
                  {isRtl ? 'הצטרף כחניך' : 'Join as Apprentice'}
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* final one-liner CTA */}
          <Reveal delay={0.1} className="mt-10 text-center">
            <div className="flex justify-center gap-1 mb-5">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight mb-4">
              {isRtl ? 'מוכן לבנות את הקריירה שלך?' : 'Ready to build your career?'}
            </h2>
            <Link to="/auth?mode=signup"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-xl shadow-blue-600/25 active:scale-[.97]">
              {isRtl ? 'התחל בחינם' : 'Get Started Free'}
              <ArrowRight size={14} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="border-t border-gray-100 py-10 px-5 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start gap-6">
          <div>
            <div className="text-lg font-black tracking-tighter text-gray-950 mb-1" dir="ltr">
              Skill<span className="text-blue-600">Link</span>
            </div>
            <p className="text-gray-400 text-sm">{isRtl ? 'הבית של המקצוענים החדשים בישראל.' : "Israel's next generation of tradespeople."}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
            {[
              { to: '/about', he: 'אודות', en: 'About' },
              { to: '/contact', he: 'צור קשר', en: 'Contact' },
              { to: '/privacy', he: 'פרטיות', en: 'Privacy' },
              { to: '/terms', he: 'תנאים', en: 'Terms' },
            ].map(l => (
              <Link key={l.to} to={l.to} className="hover:text-gray-900 transition-colors">{isRtl ? l.he : l.en}</Link>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-gray-100 flex justify-between text-[11px] text-gray-300">
          <span>© 2026 SkillLink.</span>
          <span className="uppercase tracking-widest">{isRtl ? 'נבנה בישראל' : 'Built in Israel'}</span>
        </div>
      </footer>
    </div>
  );
}
