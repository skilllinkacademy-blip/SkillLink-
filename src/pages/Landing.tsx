import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Briefcase, GraduationCap, CheckCircle2, Star,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { carpenterMentorImg } from '../lib/assets';
import NetworkAnimation from '../components/NetworkAnimation';

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

interface StepDef { n: string; numColor: string; t: { he: string; en: string }; d: { he: string; en: string } }
function StepItem({ step, isRtl }: { step: StepDef; isRtl: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      className="flex items-start gap-5 sm:gap-8 py-7 border-b border-gray-100 last:border-0"
      initial={{ opacity: 0, x: isRtl ? 20 : -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
      <motion.span
        className="text-[4.5rem] sm:text-[6rem] font-black leading-none tabular-nums shrink-0 select-none"
        initial={{ color: '#e2e8f0' }}
        animate={inView ? { color: step.numColor } : { color: '#e2e8f0' }}
        transition={{ duration: 0.9, delay: 0.25 }}>
        {step.n}
      </motion.span>
      <div className="pt-3 sm:pt-5">
        <h3 className="text-lg sm:text-xl font-black text-gray-950 mb-1.5 leading-snug">
          {isRtl ? step.t.he : step.t.en}
        </h3>
        <p className="text-gray-400 leading-relaxed text-sm">
          {isRtl ? step.d.he : step.d.en}
        </p>
      </div>
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
      `}</style>

      {/* ══════════════════ 1. HERO ══════════════════ */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden px-5 sm:px-8 lg:px-14 py-14 sm:py-20">
        {/* blobs — desktop only so mobile stays white */}
        <div className="hidden sm:block absolute -top-32 right-[-5%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[140px] pointer-events-none" />
        <div className="hidden sm:block absolute bottom-[-10%] left-[-5%] w-[380px] h-[380px] bg-blue-50/70 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Text */}
          <div className="space-y-5 order-2 lg:order-1">
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
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-md">
              {isRtl
                ? 'SkillLink מחברת בין אומנים מנוסים לבין דור הבא של בעלי המקצוע בישראל.'
                : 'SkillLink connects seasoned tradespeople with the next generation of skilled professionals across Israel.'}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.42 }}
              className="flex flex-wrap gap-3">
              <Link to="/auth?mode=signup"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-xl shadow-blue-600/25 active:scale-[.97]">
                {isRtl ? 'הצטרפות חינם' : 'Join for Free'}
                <ArrowRight size={15} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/app/opportunities"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-gray-200 hover:border-gray-300 bg-white text-gray-700 rounded-full font-bold text-sm transition-all">
                {isRtl ? 'עיון בהזדמנויות' : 'Browse Opportunities'}
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center gap-3.5">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-black text-gray-900">{total}+</span>{' '}
                {isRtl ? 'אנשי מקצוע בפלטפורמה' : 'professionals on the platform'}
              </p>
            </motion.div>
          </div>

          {/* Live Network — hero visual, desktop only */}
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 lg:order-2 hidden sm:block">

            <div className="absolute inset-4 bg-blue-400/12 rounded-[2rem] blur-[60px] pointer-events-none" />

            <div className="relative rounded-[1.6rem] overflow-hidden border border-gray-200 shadow-2xl shadow-blue-900/10 bg-[#0b1120]">
              {/* window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-white/4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/15" />
                  <div className="w-3 h-3 rounded-full bg-white/15" />
                  <div className="w-3 h-3 rounded-full bg-white/15" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-3 py-0.5 rounded-md bg-white/8 text-white/30 text-[10px] font-mono tracking-wide">
                    skilllink.co · {isRtl ? 'רשת חיה' : 'live network'}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isRtl ? 'חי' : 'Live'}
                </div>
              </div>

              <div style={{ height: 280 }} className="relative">
                <NetworkAnimation isRtl={isRtl} />
              </div>

              <div className="flex items-center justify-around border-t border-white/8 px-4 py-3 bg-white/3">
                {[
                  { n: '500+', l: { he: 'אנשי מקצוע', en: 'Professionals' } },
                  { n: '15+',  l: { he: 'מקצועות',    en: 'Trades'        } },
                  { n: '92%',  l: { he: 'דיוק AI',     en: 'AI Accuracy'   } },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-white font-black text-sm leading-none">{s.n}</p>
                    <p className="text-white/35 text-[9px] uppercase tracking-widest mt-0.5">{isRtl ? s.l.he : s.l.en}</p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={15} className="text-green-500" />
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

      {/* ══════════════════ MENTOR MEETS APPRENTICE + HOW IT WORKS ══════════════════ */}
      <section ref={meetRef} className="bg-white overflow-hidden py-12 sm:py-24 px-5 sm:px-8 lg:px-14">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* LEFT — figures */}
          <div className="order-2 lg:order-1">
            <Reveal className="mb-2">
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-[.26em] mb-2">
                {isRtl ? 'SkillLink בפעולה' : 'SkillLink in action'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 leading-tight">
                {isRtl ? 'מנטור פוגש חניך.' : 'Mentor meets Apprentice.'}
              </h2>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                {isRtl
                  ? 'הכלים עוברים מיד ליד — והידע עובר איתם.'
                  : 'Skills are passed hand to hand — and so is the knowledge.'}
              </p>
            </Reveal>

            <div dir="ltr" className="relative flex items-end justify-between mt-4 bg-white">
              <motion.div style={{ x: mentorX }} className="w-[48%]">
                <img src="/mentor_figure.jpg" alt="Mentor" className="w-full object-contain select-none" draggable={false} />
              </motion.div>
              <motion.div style={{ x: apprenticeX }} className="w-[48%]">
                <img src="/apprentice_figure.jpg" alt="Apprentice" className="w-full object-contain select-none" draggable={false} />
              </motion.div>
            </div>
          </div>

          {/* RIGHT — steps */}
          <div className="order-1 lg:order-2">
            <Reveal className="mb-4">
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-[.26em] mb-2">
                {isRtl ? 'איך זה עובד?' : 'How it works'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">
                {isRtl ? 'שלושה צעדים.' : 'Three steps.'}
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  {isRtl ? ' קריירה שלמה.' : ' A whole career.'}
                </span>
              </h2>
            </Reveal>

            {[
              {
                n: '01', numColor: '#3b82f6',
                t: { he: 'צור פרופיל', en: 'Create Your Profile' },
                d: {
                  he: 'הזן מקצוע, ניסיון ומיקום. לוקח פחות משתי דקות.',
                  en: 'Enter your trade, experience, and location. Takes under two minutes.',
                },
              },
              {
                n: '02', numColor: '#6366f1',
                t: { he: 'קבל התאמה חכמה', en: 'Get Matched Intelligently' },
                d: {
                  he: 'המערכת מנתחת פרופילים ומוצאת עבורך את ההתאמה הטובה ביותר.',
                  en: 'Our system analyzes profiles and surfaces the most relevant matches for you.',
                },
              },
              {
                n: '03', numColor: '#10b981',
                t: { he: 'התחל לעבוד', en: 'Start Working' },
                d: {
                  he: 'צא לשטח, צבור ניסיון אמיתי ובנה קריירה תחת הנחיית מקצוען.',
                  en: 'Head to the field, gain hands-on experience, and build a career under expert guidance.',
                },
              },
            ].map((step, i) => <StepItem key={i} step={step} isRtl={isRtl} />)}
          </div>

        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="py-12 sm:py-28 px-5 sm:px-8 lg:px-14 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Mentor card */}
            <Reveal>
              <div className="relative rounded-3xl overflow-hidden min-h-[340px] flex flex-col justify-between p-7 sm:p-9 bg-gray-950 text-white">
                <img src={carpenterMentorImg} alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-20 hover:opacity-28 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 to-gray-950/95" />
                <div className="absolute top-0 right-0 w-56 h-44 bg-blue-600/20 rounded-full blur-[80px]" />
                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-black uppercase tracking-widest mb-4">
                    <Briefcase size={10} />{isRtl ? 'למנטורים' : 'For Mentors'}
                  </div>
                  <h3 className="text-2xl font-black leading-snug mb-3">
                    {isRtl
                      ? <>שתף את הניסיון שלך.<br />עצב את הדור הבא.</>
                      : <>Share your expertise.<br />Shape the next generation.</>}
                  </h3>
                  <ul className="space-y-2">
                    {(isRtl
                      ? ['פרסם הזדמנות בחינם', 'חניכים מסורים יגיעו אליך', 'פי 5 יותר פניות למנטורים מאומתים']
                      : ['Post opportunities at no cost', 'Receive applications from dedicated apprentices', '5× more inquiries for verified mentors']
                    ).map((item, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-white/60">
                        <CheckCircle2 size={13} className="text-blue-400 shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/auth?mode=signup&role=mentor"
                  className="relative inline-flex items-center gap-2 w-fit mt-5 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm transition-all active:scale-95">
                  {isRtl ? 'הצטרף כמנטור' : 'Join as a Mentor'}
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>
              </div>
            </Reveal>

            {/* Apprentice card */}
            <Reveal delay={0.1}>
              <div className="relative rounded-3xl overflow-hidden min-h-[340px] flex flex-col justify-between p-7 sm:p-9 border-2 border-gray-100 hover:border-blue-200 transition-colors bg-white">
                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-black uppercase tracking-widest mb-4">
                    <GraduationCap size={10} />{isRtl ? 'לחניכים' : 'For Apprentices'}
                  </div>
                  <h3 className="text-2xl font-black leading-snug mb-3 text-gray-950">
                    {isRtl
                      ? <>למד מהמקצוענים.<br />הרוויח מהיום הראשון.</>
                      : <>Learn from professionals.<br />Earn from day one.</>}
                  </h3>
                  <ul className="space-y-2">
                    {(isRtl
                      ? ['מצא מנטורים לפי מקצוע ומיקום', 'קבל ציון התאמה לפני שאתה פונה', 'ניסיון מעשי אמיתי ושכר הוגן']
                      : ['Find mentors by trade and location', 'Review your AI match score before applying', 'Hands-on experience with fair compensation']
                    ).map((item, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-gray-500">
                        <CheckCircle2 size={13} className="text-blue-600 shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/auth?mode=signup&role=mentee"
                  className="inline-flex items-center gap-2 w-fit mt-5 px-6 py-3 bg-gray-950 hover:bg-gray-800 text-white rounded-full font-bold text-sm transition-all active:scale-95">
                  {isRtl ? 'הצטרף כחניך' : 'Join as an Apprentice'}
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Final CTA */}
          <Reveal delay={0.1} className="mt-10 text-center">
            <div className="flex justify-center gap-1 mb-5">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight mb-4">
              {isRtl ? 'מוכן לבנות את הקריירה שלך?' : 'Ready to build your career?'}
            </h2>
            <Link to="/auth?mode=signup"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-xl shadow-blue-600/25 active:scale-[.97]">
              {isRtl ? 'התחל בחינם' : 'Get Started — It\'s Free'}
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
            <p className="text-gray-400 text-sm">
              {isRtl ? 'הפלטפורמה של אנשי המקצוע הבאים בישראל.' : "Israel's next generation of skilled tradespeople."}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
            {[
              { to: '/about',   he: 'אודות',   en: 'About'   },
              { to: '/contact', he: 'צור קשר', en: 'Contact' },
              { to: '/privacy', he: 'פרטיות',  en: 'Privacy' },
              { to: '/terms',   he: 'תנאים',   en: 'Terms'   },
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
