import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck, Users, Zap, ArrowRight, Award, Briefcase,
  GraduationCap, Star, CheckCircle2, ChevronDown, Wrench,
  Hammer, Flame, Plug, Droplets, Car
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  barberShop, electricalImg, weldingImg, mechanicImg,
  plumbingImg, constructionImg, apprenticeImg
} from '../lib/assets';

// Real person photos for avatar stack & testimonial
const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=80',
];
const TESTIMONIAL_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=80';

interface LandingProps {
  isRtl: boolean;
}

function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return count;
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const TRADES = [
  { label: { he: 'חשמל', en: 'Electrical' }, img: electricalImg, icon: Plug },
  { label: { he: 'ריתוך', en: 'Welding' }, img: weldingImg, icon: Flame },
  { label: { he: 'מכונאות', en: 'Mechanics' }, img: mechanicImg, icon: Car },
  { label: { he: 'אינסטלציה', en: 'Plumbing' }, img: plumbingImg, icon: Droplets },
  { label: { he: 'בנייה', en: 'Construction' }, img: constructionImg, icon: Hammer },
  { label: { he: 'עיצוב שיער', en: 'Hair Styling' }, img: barberShop, icon: Wrench },
];

const STEPS = [
  {
    n: '01', icon: GraduationCap,
    title: { he: 'צור פרופיל', en: 'Create your profile' },
    desc: { he: 'הגדר כישורים, מיקום, וסוג ההזדמנות שאתה מחפש.', en: "Set your skills, location, and what you're looking for." },
  },
  {
    n: '02', icon: Zap,
    title: { he: 'התאמת AI', en: 'AI-powered match' },
    desc: { he: 'AI מוצא את ההתאמה הטובה ביותר לפי מיקום, מקצוע וניסיון.', en: 'Our AI finds your best match by location, trade and experience.' },
  },
  {
    n: '03', icon: Briefcase,
    title: { he: 'התחל בשטח', en: 'Start in the field' },
    desc: { he: 'צבור ניסיון מעשי אמיתי תחת הנחיית מקצוען מנוסה.', en: 'Gain real hands-on experience under a seasoned pro.' },
  },
];

const FEATURES = [
  { icon: ShieldCheck, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', hoverBorder: 'hover:border-amber-200', title: { he: 'מנטורים מאומתים', en: 'Verified Mentors' }, desc: { he: 'כל מנטור עובר אימות מקיף.', en: 'Every mentor goes through thorough verification.' } },
  { icon: Zap, bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', hoverBorder: 'hover:border-orange-200', title: { he: 'התאמת AI', en: 'AI Matching' }, desc: { he: 'אלגוריתם חכם מחבר ביניכם בדיוק מקסימלי.', en: 'Smart algorithm connects you with maximum precision.' } },
  { icon: Users, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', hoverBorder: 'hover:border-emerald-200', title: { he: 'קהילה פעילה', en: 'Active Community' }, desc: { he: 'רשת של מקצוענים שעוזרים אחד לשני לצמוח.', en: 'A network of professionals helping each other grow.' } },
  { icon: Award, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', hoverBorder: 'hover:border-slate-200', title: { he: 'הכרה מקצועית', en: 'Recognition' }, desc: { he: 'בנה פרופיל מוניטין שפותח דלתות בתעשייה.', en: 'Build a reputation that opens doors in the industry.' } },
];

export default function Landing({ isRtl }: LandingProps) {
  const [counts, setCounts] = useState({ mentors: 0, mentees: 0, total: 0 });

  // Parallax refs
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroBgScale = useTransform(heroScrollProgress, [0, 1], [1, 1.18]);
  const heroContentOpacity = useTransform(heroScrollProgress, [0, 0.65], [1, 0]);
  const heroContentY = useTransform(heroScrollProgress, [0, 1], [0, -80]);

  useEffect(() => {
    supabase && Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentor'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentee'),
    ]).then(([{ count: m }, { count: a }]) => {
      const total = (m || 0) + (a || 0);
      setCounts({ mentors: m || 0, mentees: a || 0, total: total > 0 ? total : 500 });
    }).catch(() => setCounts({ mentors: 120, mentees: 380, total: 500 }));
  }, []);

  const mentorCount = useCounter(counts.mentors || 120);
  const menteeCount = useCounter(counts.mentees || 380);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">

        {/* Parallax background */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{ scale: heroBgScale }}
        >
          <img
            src={weldingImg}
            alt=""
            className="w-full h-full object-cover opacity-35 select-none pointer-events-none"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 to-zinc-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40" />
        </motion.div>

        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:56px_56px] pointer-events-none" />

        {/* Warm glows */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-amber-600/18 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[5%] w-[450px] h-[450px] bg-orange-700/12 rounded-full blur-[110px] pointer-events-none" />

        {/* Hero content with parallax fade */}
        <motion.div
          style={{ opacity: heroContentOpacity, y: heroContentY }}
          className="relative z-10 flex-1 max-w-7xl mx-auto px-6 flex flex-col justify-center pt-24 pb-20 sm:pt-32 sm:pb-24"
        >
          <div className="max-w-3xl space-y-7">
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm text-xs font-semibold text-amber-300 uppercase tracking-[0.18em]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {isRtl ? 'פלטפורמה חיה · בטא פעילה' : 'Live Platform · Active Beta'}
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.93] tracking-tight"
            >
              {isRtl ? (
                <>
                  ללמוד<br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                    מקצוע
                  </span>
                  <br />בשטח
                </>
              ) : (
                <>
                  Learn a<br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                    trade
                  </span>
                  <br />in the field
                </>
              )}
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="text-zinc-400 text-lg sm:text-xl leading-relaxed max-w-xl"
            >
              {isRtl
                ? 'SkillLink מחברת מנטורים מנוסים עם חניכים מוטיבציוניים. מצאו זה את זה, תפתחו יחד.'
                : 'SkillLink connects experienced mentors with motivated apprentices. Find each other, grow together.'}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 pt-1"
            >
              <Link
                to="/auth?mode=signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-xl font-bold text-sm transition-all shadow-2xl shadow-amber-900/30 active:scale-[.98]"
              >
                {isRtl ? 'הצטרפות חינם' : 'Join for Free'}
                <ArrowRight size={16} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/app/opportunities"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/8 hover:bg-white/14 border border-white/12 text-white rounded-xl font-bold text-sm transition-all backdrop-blur-sm active:scale-[.98]"
              >
                {isRtl ? 'עיון בהזדמנויות' : 'Browse Opportunities'}
              </Link>
            </motion.div>

            {/* Avatars */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex items-center gap-4 pt-2"
            >
              <div className="flex -space-x-2.5 rtl:space-x-reverse rtl:-space-x-0">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-zinc-950 object-cover" />
                ))}
              </div>
              <p className="text-sm text-zinc-400">
                <span className="font-bold text-white">{counts.total || 500}+</span>{' '}
                {isRtl ? 'מקצוענים בפלטפורמה' : 'professionals on the platform'}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <div className="relative z-10 flex justify-center pb-8">
          <motion.div animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 1.9 }}>
            <ChevronDown size={22} className="text-zinc-600" />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <Section className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { n: `${mentorCount}+`, label: { he: 'מנטורים פעילים', en: 'Active Mentors' } },
              { n: `${menteeCount}+`, label: { he: 'חניכים רשומים', en: 'Apprentices' } },
              { n: '15+', label: { he: 'מקצועות', en: 'Trades' } },
              { n: '100%', label: { he: 'חינם להצטרפות', en: 'Free to Join' } },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{s.n}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isRtl ? s.label.he : s.label.en}</p>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Section className="text-center space-y-3 mb-16">
            <motion.p variants={fadeUp} className="text-xs font-black text-amber-600 uppercase tracking-[0.25em]">
              {isRtl ? 'תהליך פשוט' : 'Simple Process'}
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'איך זה עובד?' : 'How does it work?'}
            </motion.h2>
          </Section>

          <Section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200" />

            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="relative flex flex-col items-start gap-5 p-7 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-50/80 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                    <step.icon size={22} />
                  </div>
                  <span className="text-5xl font-black text-slate-100 group-hover:text-amber-100 transition-colors select-none">{step.n}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">{isRtl ? step.title.he : step.title.en}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{isRtl ? step.desc.he : step.desc.en}</p>
                </div>
              </motion.div>
            ))}
          </Section>
        </div>
      </section>

      {/* ── TRADES GRID ───────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-zinc-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <Section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <motion.p variants={fadeUp} className="text-xs font-black text-amber-400 uppercase tracking-[0.25em]">
                {isRtl ? 'מגוון מקצועות' : 'Trade Categories'}
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black tracking-tight">
                {isRtl ? 'כל המקצועות,\nמקום אחד' : 'All trades,\none place'}
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link
                to="/app/opportunities"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/18 border border-white/10 text-white rounded-xl text-sm font-semibold transition-all"
              >
                {isRtl ? 'כל ההזדמנויות' : 'All opportunities'}
                <ArrowRight size={15} className="rtl:rotate-180" />
              </Link>
            </motion.div>
          </Section>

          <Section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {TRADES.map((trade, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Link
                  to="/app/opportunities"
                  className="group relative aspect-video overflow-hidden rounded-2xl block cursor-pointer"
                >
                  <img
                    src={trade.img}
                    alt={isRtl ? trade.label.he : trade.label.en}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/12 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-2">
                    <trade.icon size={14} className="text-amber-400" />
                    <p className="text-white font-bold text-sm sm:text-base">{isRtl ? trade.label.he : trade.label.en}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </Section>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Section className="text-center space-y-3 mb-16">
            <motion.p variants={fadeUp} className="text-xs font-black text-amber-600 uppercase tracking-[0.25em]">
              {isRtl ? 'למה SkillLink?' : 'Why SkillLink?'}
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'הפלטפורמה שנבנתה\nבשביל המקצוענים' : 'Built for\nthe trades'}
            </motion.h2>
          </Section>

          <Section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className={`group p-6 rounded-2xl border ${f.border} ${f.hoverBorder} hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 space-y-4`}
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.text} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-base">{isRtl ? f.title.he : f.title.en}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{isRtl ? f.desc.he : f.desc.en}</p>
                </div>
              </motion.div>
            ))}
          </Section>
        </div>
      </section>

      {/* ── TESTIMONIAL ───────────────────────────────────── */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <Section className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-amber-400 fill-amber-400" />)}
          </motion.div>
          <motion.blockquote variants={fadeUp} className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed max-w-2xl mx-auto">
            {isRtl
              ? '"SkillLink עזרה לי למצוא חניך מצוין תוך שבוע. היום הוא חלק בלתי נפרד מהצוות שלי."'
              : '"SkillLink helped me find an excellent apprentice within a week. Today he\'s an indispensable part of my team."'}
          </motion.blockquote>
          <motion.div variants={fadeUp} className="flex items-center gap-3 justify-center">
            <img src={TESTIMONIAL_AVATAR} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow" />
            <div className="text-start">
              <p className="text-sm font-bold text-slate-900">{isRtl ? 'מנחם כהן' : 'Menahem Cohen'}</p>
              <p className="text-xs text-slate-400">{isRtl ? 'חשמלאי מוסמך, תל אביב' : 'Licensed Electrician, Tel Aviv'}</p>
            </div>
          </motion.div>
        </Section>
      </section>

      {/* ── SPLIT CTA ─────────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Mentor card */}
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-8 sm:p-10 flex flex-col justify-between gap-8 min-h-[360px] group"
            >
              <img src={constructionImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-transparent" />
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest border border-white/10">
                  <Briefcase size={12} />
                  {isRtl ? 'למנטורים' : 'For Mentors'}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  {isRtl ? 'העבר ידע.\nקבל עזרה.' : 'Share knowledge.\nGet help.'}
                </h3>
                <ul className="space-y-2">
                  {(isRtl
                    ? ['פרסם הזדמנות בחינם', 'קבל עזרה מחניכים מוטיבציוניים', 'אמת חשבון וקבל פי 5 יותר פניות']
                    : ['Post an opportunity for free', 'Get help from motivated apprentices', 'Verify and get 5x more responses']
                  ).map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/auth?mode=signup&role=mentor"
                className="relative inline-flex items-center gap-2 w-fit px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-xl"
              >
                {isRtl ? 'הצטרף כמנטור' : 'Join as Mentor'}
                <ArrowRight size={15} className="rtl:rotate-180" />
              </Link>
            </motion.div>

            {/* Apprentice card */}
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-3xl bg-slate-800 text-white p-8 sm:p-10 flex flex-col justify-between gap-8 min-h-[360px] group"
            >
              <img src={apprenticeImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 via-slate-800/60 to-transparent" />
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-xs font-bold uppercase tracking-widest border border-amber-500/20 text-amber-300">
                  <GraduationCap size={12} />
                  {isRtl ? 'לחניכים' : 'For Apprentices'}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  {isRtl ? 'למד מהטובים.\nהתחל להרוויח.' : 'Learn from the best.\nStart earning.'}
                </h3>
                <ul className="space-y-2">
                  {(isRtl
                    ? ['גלה מנטורים לפי מיקום ומקצוע', 'ראה ציון התאמה AI לפני פנייה', 'קבל ניסיון מעשי ושכר']
                    : ['Find mentors by location and trade', 'See AI match score before applying', 'Get hands-on experience and pay']
                  ).map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/auth?mode=signup&role=mentee"
                className="relative inline-flex items-center gap-2 w-fit px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95 shadow-xl"
              >
                {isRtl ? 'הצטרף כחניך' : 'Join as Apprentice'}
                <ArrowRight size={15} className="rtl:rotate-180" />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-zinc-950 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-600/18 rounded-full blur-[110px]" />
        <Section className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-8">
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            {isRtl ? (
              <>מוכן לבנות<br /><span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">את הקריירה שלך?</span></>
            ) : (
              <>Ready to build<br /><span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">your career?</span></>
            )}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-zinc-400 text-lg font-medium max-w-xl mx-auto leading-relaxed">
            {isRtl
              ? 'הצטרפו לפלטפורמה שבה מנטורים וחניכים בונים קשרים מקצועיים שנמשכים שנים.'
              : 'Join the platform where mentors and apprentices build professional relationships that last for years.'}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth?mode=signup"
              className="group inline-flex items-center justify-center gap-2 px-9 py-4 bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-xl font-bold text-sm transition-all shadow-2xl shadow-amber-900/30 active:scale-[.98]"
            >
              {isRtl ? 'התחל בחינם' : 'Get Started Free'}
              <ArrowRight size={16} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/app/opportunities"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-white/8 hover:bg-white/14 border border-white/12 text-white rounded-xl font-bold text-sm transition-all backdrop-blur-sm active:scale-[.98]"
            >
              {isRtl ? 'עיון ללא הרשמה' : 'Browse without signing up'}
            </Link>
          </motion.div>
        </Section>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-zinc-950 text-white border-t border-white/5 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-3">
              <div className="text-2xl font-black tracking-tighter" dir="ltr">
                SkillLink<span className="text-amber-400">.</span>
              </div>
              <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                {isRtl ? 'הבית של המקצוענים החדשים בישראל.' : 'The home of the next generation of tradespeople in Israel.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-zinc-400">
              <Link to="/about" className="hover:text-white transition-colors">{isRtl ? 'אודות' : 'About'}</Link>
              <Link to="/contact" className="hover:text-white transition-colors">{isRtl ? 'צור קשר' : 'Contact'}</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">{isRtl ? 'פרטיות' : 'Privacy'}</Link>
              <Link to="/terms" className="hover:text-white transition-colors">{isRtl ? 'תנאים' : 'Terms'}</Link>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-zinc-500">
            <p>© 2026 SkillLink. {isRtl ? 'כל הזכויות שמורות.' : 'All rights reserved.'}</p>
            <p className="uppercase tracking-widest">{isRtl ? 'נבנה בישראל' : 'Built in Israel'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
