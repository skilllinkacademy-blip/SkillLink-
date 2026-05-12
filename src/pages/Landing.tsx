import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ShieldCheck, Users, Zap, ArrowRight, Award, Briefcase,
  GraduationCap, Star, CheckCircle2, ChevronDown, Wrench,
  Hammer, Flame, Plug, Droplets, Car
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  barberShop, electricalImg, weldingImg, mechanicImg,
  plumbingImg, constructionImg, mentorImg, apprenticeImg, generalImg
} from '../lib/assets';

interface LandingProps {
  isRtl: boolean;
}

// Animated counter hook
function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current || target === 0) return;
    ref.current = true;
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

const TRADES = [
  { label: { he: 'חשמל', en: 'Electrical' }, img: electricalImg, icon: Plug, color: 'from-yellow-500/30' },
  { label: { he: 'ריתוך', en: 'Welding' }, img: weldingImg, icon: Flame, color: 'from-orange-500/30' },
  { label: { he: 'מכונאות', en: 'Mechanics' }, img: mechanicImg, icon: Car, color: 'from-blue-500/30' },
  { label: { he: 'אינסטלציה', en: 'Plumbing' }, img: plumbingImg, icon: Droplets, color: 'from-cyan-500/30' },
  { label: { he: 'בנייה', en: 'Construction' }, img: constructionImg, icon: Hammer, color: 'from-stone-500/30' },
  { label: { he: 'עיצוב שיער', en: 'Hair Styling' }, img: barberShop, icon: Wrench, color: 'from-pink-500/30' },
];

const STEPS = [
  {
    n: '01', icon: GraduationCap,
    title: { he: 'צור פרופיל', en: 'Create your profile' },
    desc: { he: 'הגדר כישורים, מיקום, וסוג ההזדמנות שאתה מחפש.', en: 'Set your skills, location, and what you\'re looking for.' },
  },
  {
    n: '02', icon: Zap,
    title: { he: 'התאמה חכמה', en: 'AI-powered match' },
    desc: { he: 'AI מוצא את ההתאמה הטובה ביותר לפי מיקום, מקצוע וניסיון.', en: 'Our AI finds your best match by location, trade and experience.' },
  },
  {
    n: '03', icon: Briefcase,
    title: { he: 'התחל בשטח', en: 'Start in the field' },
    desc: { he: 'צבור ניסיון מעשי אמיתי תחת הנחיית מקצוען מנוסה.', en: 'Gain real hands-on experience under a seasoned pro.' },
  },
];

const FEATURES = [
  { icon: ShieldCheck, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', title: { he: 'מנטורים מאומתים', en: 'Verified Mentors' }, desc: { he: 'כל מנטור עובר אימות מקיף.', en: 'Every mentor goes through thorough verification.' } },
  { icon: Zap, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600', title: { he: 'התאמת AI', en: 'AI Matching' }, desc: { he: 'אלגוריתם חכם מחבר ביניכם בדיוק מקסימלי.', en: 'Smart algorithm connects you with maximum precision.' } },
  { icon: Users, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600', title: { he: 'קהילה פעילה', en: 'Active Community' }, desc: { he: 'רשת של מקצוענים שעוזרים אחד לשני לצמוח.', en: 'A network of professionals helping each other grow.' } },
  { icon: Award, gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-50', text: 'text-purple-600', title: { he: 'הכרה מקצועית', en: 'Recognition' }, desc: { he: 'בנה פרופיל מוניטין שפותח דלתות בתעשייה.', en: 'Build a reputation that opens doors in the industry.' } },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing({ isRtl }: LandingProps) {
  const [counts, setCounts] = useState({ mentors: 0, mentees: 0, total: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        if (!supabase) return;
        const [{ count: mentorCount }, { count: menteeCount }] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentor'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentee'),
        ]);
        const total = (mentorCount || 0) + (menteeCount || 0);
        setCounts({ mentors: mentorCount || 0, mentees: menteeCount || 0, total: total > 0 ? total : 500 });
      } catch {
        setCounts({ mentors: 120, mentees: 380, total: 500 });
      }
    };
    fetchCounts();
  }, []);

  const mentorCount = useCounter(counts.mentors || 120);
  const menteeCount = useCounter(counts.mentees || 380);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 flex flex-col justify-center pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 space-y-8 text-center lg:text-start"
            >
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-semibold text-slate-300 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isRtl ? 'פלטפורמה חיה · בטא פעילה' : 'Live Platform · Active Beta'}
              </div>

              {/* Main headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight">
                {isRtl ? (
                  <>
                    ללמוד מקצוע<br />
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                      ישירות בשטח
                    </span>
                  </>
                ) : (
                  <>
                    Learn a trade<br />
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                      in the field
                    </span>
                  </>
                )}
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                {isRtl
                  ? 'SkillLink מחברת מנטורים מנוסים עם חניכים מוטיבציוניים. מצאו זה את זה, תפתחו יחד.'
                  : 'SkillLink connects experienced mentors with motivated apprentices. Find each other, grow together.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/auth?mode=signup"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-2xl shadow-blue-900/50 active:scale-95"
                >
                  {isRtl ? 'הצטרפות חינם' : 'Join for Free'}
                  <ArrowRight size={16} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/app/opportunities"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/8 hover:bg-white/12 border border-white/10 text-white rounded-xl font-bold text-sm transition-all backdrop-blur-sm active:scale-95"
                >
                  {isRtl ? 'עיון בהזדמנויות' : 'Browse Opportunities'}
                </Link>
              </div>

              {/* Avatars + count */}
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {[mentorImg, barberShop, electricalImg, generalImg].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-slate-900 object-cover" />
                  ))}
                </div>
                <p className="text-sm text-slate-400">
                  <span className="font-bold text-white">{counts.total || 500}+</span>{' '}
                  {isRtl ? 'מקצוענים בפלטפורמה' : 'professionals on the platform'}
                </p>
              </div>
            </motion.div>

            {/* Right: image grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 w-full max-w-md lg:max-w-none"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3 pt-8">
                  <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                    <img src={constructionImg} alt="" className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                    <img src={weldingImg} alt="" className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                    <img src={barberShop} alt="" className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                    <img src={electricalImg} alt="" className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ChevronDown size={22} className="text-slate-500" />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <Section className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { n: `${mentorCount}+`, label: { he: 'מנטורים פעילים', en: 'Active Mentors' } },
              { n: `${menteeCount}+`, label: { he: 'חניכים רשומים', en: 'Registered Apprentices' } },
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

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Section className="text-center space-y-3 mb-16">
            <motion.p variants={fadeUp} className="text-xs font-black text-blue-600 uppercase tracking-[0.25em]">
              {isRtl ? 'תהליך פשוט' : 'Simple Process'}
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'איך זה עובד?' : 'How does it work?'}
            </motion.h2>
          </Section>

          <Section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-12 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="relative flex flex-col items-start gap-5 p-7 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all group"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                    <step.icon size={22} />
                  </div>
                  <span className="text-5xl font-black text-slate-100 group-hover:text-blue-100 transition-colors select-none">{step.n}</span>
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

      {/* ─── TRADES GRID ──────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <Section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <motion.p variants={fadeUp} className="text-xs font-black text-blue-400 uppercase tracking-[0.25em]">
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
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    style={{ '--tw-scale-x': 1.08, '--tw-scale-y': 1.08 } as React.CSSProperties}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${trade.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-2">
                    <trade.icon size={14} className="text-white/70" />
                    <p className="text-white font-bold text-sm sm:text-base">{isRtl ? trade.label.he : trade.label.en}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </Section>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Section className="text-center space-y-3 mb-16">
            <motion.p variants={fadeUp} className="text-xs font-black text-blue-600 uppercase tracking-[0.25em]">
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
                className="group p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4"
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

      {/* ─── SOCIAL PROOF / QUOTE ─────────────────────────── */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <Section className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
            ))}
          </motion.div>
          <motion.blockquote variants={fadeUp} className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed max-w-2xl mx-auto">
            {isRtl
              ? '"SkillLink עזרה לי למצוא חניך מצוין תוך שבוע. היום הוא חלק בלתי נפרד מהצוות שלי."'
              : '"SkillLink helped me find an excellent apprentice within a week. Today he\'s an indispensable part of my team."'}
          </motion.blockquote>
          <motion.div variants={fadeUp} className="flex items-center gap-3 justify-center">
            <img src={mentorImg} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow" />
            <div className="text-start">
              <p className="text-sm font-bold text-slate-900">{isRtl ? 'מנחם כהן' : 'Menahem Cohen'}</p>
              <p className="text-xs text-slate-400">{isRtl ? 'חשמלאי מוסמך, תל אביב' : 'Licensed Electrician, Tel Aviv'}</p>
            </div>
          </motion.div>
        </Section>
      </section>

      {/* ─── SPLIT CTA (mentor / mentee) ──────────────────── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Mentor */}
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between gap-8 min-h-[360px] group"
            >
              <img src={constructionImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-transparent" />
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-bold uppercase tracking-widest border border-white/10">
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
                    <li key={j} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/auth?mode=signup&role=mentor"
                className="relative inline-flex items-center gap-2 w-fit px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95 shadow-xl"
              >
                {isRtl ? 'הצטרף כמנטור' : 'Join as Mentor'}
                <ArrowRight size={15} className="rtl:rotate-180" />
              </Link>
            </motion.div>

            {/* Apprentice */}
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-3xl bg-blue-600 text-white p-8 sm:p-10 flex flex-col justify-between gap-8 min-h-[360px] group"
            >
              <img src={apprenticeImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-700/60 via-blue-600/50 to-transparent" />
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-bold uppercase tracking-widest border border-white/15">
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
                    <li key={j} className="flex items-center gap-2.5 text-sm text-blue-100">
                      <CheckCircle2 size={14} className="text-white shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/auth?mode=signup&role=mentee"
                className="relative inline-flex items-center gap-2 w-fit px-6 py-3 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all active:scale-95 shadow-xl"
              >
                {isRtl ? 'הצטרף כחניך' : 'Join as Apprentice'}
                <ArrowRight size={15} className="rtl:rotate-180" />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/15 rounded-full blur-[100px]" />
        <Section className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-8">
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            {isRtl ? (
              <>מוכן לבנות<br /><span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">את הקריירה שלך?</span></>
            ) : (
              <>Ready to build<br /><span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">your career?</span></>
            )}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-400 text-lg font-medium max-w-xl mx-auto leading-relaxed">
            {isRtl
              ? 'הצטרפו לפלטפורמה שבה מנטורים וחניכים בונים קשרים מקצועיים שנמשכים שנים.'
              : 'Join the platform where mentors and apprentices build professional relationships that last for years.'}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth?mode=signup"
              className="group inline-flex items-center justify-center gap-2 px-9 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-2xl shadow-blue-900/50 active:scale-95"
            >
              {isRtl ? 'התחל בחינם' : 'Get Started Free'}
              <ArrowRight size={16} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/app/opportunities"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-white/8 hover:bg-white/12 border border-white/10 text-white rounded-xl font-bold text-sm transition-all backdrop-blur-sm active:scale-95"
            >
              {isRtl ? 'עיון ללא הרשמה' : 'Browse without signing up'}
            </Link>
          </motion.div>
        </Section>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-slate-950 text-white border-t border-white/5 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-3">
              <div className="text-2xl font-black tracking-tighter" dir="ltr">
                SkillLink<span className="text-blue-400">.</span>
              </div>
              <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                {isRtl ? 'הבית של המקצוענים החדשים בישראל.' : 'The home of the next generation of tradespeople in Israel.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-slate-400">
              <Link to="/about" className="hover:text-white transition-colors">{isRtl ? 'אודות' : 'About'}</Link>
              <Link to="/contact" className="hover:text-white transition-colors">{isRtl ? 'צור קשר' : 'Contact'}</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">{isRtl ? 'פרטיות' : 'Privacy'}</Link>
              <Link to="/terms" className="hover:text-white transition-colors">{isRtl ? 'תנאים' : 'Terms'}</Link>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <p>© 2026 SkillLink. {isRtl ? 'כל הזכויות שמורות.' : 'All rights reserved.'}</p>
            <p className="uppercase tracking-widest">{isRtl ? 'נבנה בישראל' : 'Built in Israel'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
