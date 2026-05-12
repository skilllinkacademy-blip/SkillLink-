import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Zap, Users, Award,
  Briefcase, GraduationCap, Star, CheckCircle2, ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  barberShop, electricalImg, weldingImg,
  constructionImg, apprenticeImg
} from '../lib/assets';

const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=80',
];

const MARQUEE = ['חשמלאות','Electrical','ריתוך','Welding','נגרות','Carpentry','אינסטלציה','Plumbing','בנייה','Construction','מכונאות','Mechanics','ספרות','Barbering'];

interface LandingProps { isRtl: boolean; }

function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return count;
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className={className}>
      {children}
    </motion.div>
  );
}

const up = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export default function Landing({ isRtl }: LandingProps) {
  const [counts, setCounts] = useState({ mentors: 0, mentees: 0, total: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgScale   = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const textY     = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const textFade  = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

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

  const mentorCount = useCounter(counts.mentors || 120);
  const menteeCount = useCounter(counts.mentees || 380);

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Marquee keyframe */}
      <style>{`
        @keyframes mq { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .mq { animation: mq 30s linear infinite; }
        .mq:hover { animation-play-state: paused }
      `}</style>

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-end overflow-hidden">

        {/* Full-bleed parallax image */}
        <motion.div className="absolute inset-0" style={{ scale: bgScale }}>
          <img src={weldingImg} alt="" className="w-full h-full object-cover" />
          {/* Layered overlays for depth */}
          <div className="absolute inset-0 bg-[#080808]/40" />
          <div className="absolute inset-0 bg-gradient-to-b  from-[#080808]/30 via-transparent      to-[#080808]" />
          <div className="absolute inset-0 bg-gradient-to-r  from-[#080808]    via-[#080808]/50    to-transparent" />
        </motion.div>

        {/* Subtle grain */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:'300px' }} />

        {/* Warm amber glow */}
        <div className="absolute top-[15%] left-[-5%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Hero content — fades + lifts on scroll */}
        <motion.div style={{ y: textY, opacity: textFade }}
          className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 sm:pb-24">

          {/* Beta badge */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/8 text-amber-300 text-[11px] font-bold uppercase tracking-[.18em]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {isRtl ? 'SkillLink · בטא פעילה' : 'SkillLink · Active Beta'}
          </motion.div>

          {/* ─ Staggered line-by-line headline ─ */}
          {(isRtl
            ? [{ text: 'ללמוד', cls: 'text-white' }, { text: 'מקצוע', cls: 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent' }, { text: 'בשטח', cls: 'text-white/25' }]
            : [{ text: 'LEARN A', cls: 'text-white' }, { text: 'TRADE', cls: 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent' }, { text: 'IN THE FIELD', cls: 'text-white/25' }]
          ).map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.p
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.95, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={`font-black leading-[.88] tracking-tighter mb-1 ${line.cls}`}
                style={{ fontSize: 'clamp(3.6rem, 10.5vw, 9rem)' }}
              >
                {line.text}
              </motion.p>
            </div>
          ))}

          {/* Sub + CTAs */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
            <p className="text-white/45 text-base leading-relaxed max-w-xs">
              {isRtl
                ? 'SkillLink מחברת מנטורים מנוסים עם חניכים מוטיבציוניים.'
                : 'SkillLink connects experienced mentors with motivated apprentices.'}
            </p>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link to="/auth?mode=signup"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-full font-bold text-sm transition-all shadow-[0_0_40px_-4px] shadow-amber-600/35 active:scale-[.97]">
                {isRtl ? 'הצטרפות חינם' : 'Join for Free'}
                <ArrowRight size={14} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/app/opportunities"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/6 hover:bg-white/12 border border-white/10 text-white rounded-full font-bold text-sm transition-all">
                {isRtl ? 'עיון בהזדמנויות' : 'Browse Opportunities'}
              </Link>
            </div>
          </motion.div>

          {/* Avatars row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="flex items-center gap-3 mt-8">
            <div className="flex -space-x-2.5 rtl:space-x-reverse">
              {AVATARS.map((src, i) => (
                <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-[#080808] object-cover" />
              ))}
            </div>
            <p className="text-sm text-white/38">
              <span className="text-white font-semibold">{counts.total || 500}+</span>
              {' '}{isRtl ? 'מקצוענים בפלטפורמה' : 'professionals on the platform'}
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown size={20} className="text-white/20" />
        </motion.div>
      </section>

      {/* ─── MARQUEE ────────────────────────────────────────── */}
      <div className="relative border-y border-white/6 py-4 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="mq flex shrink-0">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-5 text-[11px] font-black uppercase tracking-[.22em] text-white/30">
                {item}
                <span className="w-1 h-1 rounded-full bg-amber-500/50 shrink-0" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── STATS ──────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <Section className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { n: `${mentorCount}+`,  l: { he: 'מנטורים',  en: 'Mentors' } },
              { n: `${menteeCount}+`, l: { he: 'חניכים',    en: 'Apprentices' } },
              { n: '15+',             l: { he: 'מקצועות',   en: 'Trades' } },
              { n: '100%',            l: { he: 'חינם',       en: 'Free to join' } },
            ].map((s, i) => (
              <motion.div key={i} variants={up} className="space-y-2">
                <p className="font-black leading-none tracking-tight text-white"
                  style={{ fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)' }}>{s.n}</p>
                <p className="text-[11px] font-bold text-white/30 uppercase tracking-[.2em]">
                  {isRtl ? s.l.he : s.l.en}
                </p>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ─── BENTO FEATURES ─────────────────────────────────── */}
      <section className="pb-24 sm:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <Section className="mb-12">
            <motion.p variants={up} className="text-[11px] font-black text-amber-500 uppercase tracking-[.25em] mb-3">
              {isRtl ? 'למה SkillLink?' : 'Why SkillLink?'}
            </motion.p>
            <motion.h2 variants={up} className="text-3xl sm:text-[3.2rem] font-black tracking-tight leading-[1.05] max-w-lg">
              {isRtl ? 'הפלטפורמה שנבנתה\nבשביל המקצוענים' : 'The platform\nbuilt for the trades'}
            </motion.h2>
          </Section>

          <Section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

            {/* AI — wide */}
            <motion.div variants={up}
              className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-white/[0.04] border border-white/8 p-8 group hover:bg-white/[0.06] transition-colors">
              <div className="absolute top-0 right-0 w-[280px] h-[220px] bg-amber-600/12 rounded-full blur-[90px] pointer-events-none" />
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/12 border border-amber-500/20 flex items-center justify-center mb-5">
                  <Zap size={20} className="text-amber-400" />
                </div>
                <h3 className="text-lg font-black mb-1.5">{isRtl ? 'התאמת AI חכמה' : 'Smart AI Matching'}</h3>
                <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-6">
                  {isRtl
                    ? 'אלגוריתם מנתח מיקום, מקצוע וניסיון ומוצא את ההתאמה המדויקת ביותר.'
                    : 'Algorithm analyzes location, trade & experience to find your most precise match.'}
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 bg-white/8 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: '92%' }}
                      transition={{ duration: 1.3, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                  </div>
                  <span className="text-amber-400 text-sm font-black tabular-nums">92%</span>
                  <span className="text-white/25 text-[11px] shrink-0">{isRtl ? 'דיוק' : 'accuracy'}</span>
                </div>
              </div>
            </motion.div>

            {/* Verified */}
            <motion.div variants={up}
              className="relative overflow-hidden rounded-3xl bg-white/[0.04] border border-white/8 p-8 group hover:bg-white/[0.06] transition-colors">
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/8 rounded-full blur-[70px] pointer-events-none" />
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <ShieldCheck size={20} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-black mb-1.5">{isRtl ? 'מנטורים מאומתים' : 'Verified Mentors'}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-5">
                  {isRtl ? 'כל מנטור עובר תהליך אימות מקיף.' : 'Every mentor goes through thorough verification.'}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/8 border border-emerald-500/18 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-[11px] font-black uppercase tracking-widest">
                    {isRtl ? 'מאומת ✓' : 'Verified ✓'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Community */}
            <motion.div variants={up}
              className="relative overflow-hidden rounded-3xl bg-white/[0.04] border border-white/8 p-8 group hover:bg-white/[0.06] transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/12 border border-blue-500/20 flex items-center justify-center mb-5">
                <Users size={20} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-black mb-1.5">{isRtl ? 'קהילה פעילה' : 'Active Community'}</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-5">
                {isRtl ? 'רשת של מקצוענים שעוזרים אחד לשני.' : "A network of pros helping each other grow."}
              </p>
              <div className="flex -space-x-2.5 rtl:space-x-reverse">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-7 h-7 rounded-full border-2 border-[#080808] object-cover" />
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-[#080808] bg-white/10 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white/60">+</span>
                </div>
              </div>
            </motion.div>

            {/* Recognition — wide */}
            <motion.div variants={up}
              className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-white/[0.04] border border-white/8 p-8 group hover:bg-white/[0.06] transition-colors">
              <div className="absolute top-0 left-0 w-72 h-52 bg-purple-600/8 rounded-full blur-[90px] pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/12 border border-purple-500/20 flex items-center justify-center mb-5">
                    <Award size={20} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-black mb-1.5">{isRtl ? 'הכרה מקצועית' : 'Professional Recognition'}</h3>
                  <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                    {isRtl ? 'בנה פרופיל מוניטין שפותח דלתות בתעשייה.' : 'Build a reputation profile that opens doors in the industry.'}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {[...Array(5)].map((_, i) => <Star key={i} size={22} className="text-amber-400 fill-amber-400" />)}
                </div>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────── */}
      <section className="py-24 sm:py-32 border-t border-white/6">
        <div className="max-w-6xl mx-auto px-6">
          <Section className="mb-14">
            <motion.p variants={up} className="text-[11px] font-black text-amber-500 uppercase tracking-[.25em] mb-3">
              {isRtl ? 'תהליך פשוט' : 'Simple Process'}
            </motion.p>
            <motion.h2 variants={up} className="text-3xl sm:text-[3.2rem] font-black tracking-tight">
              {isRtl ? 'איך זה עובד?' : 'How does it work?'}
            </motion.h2>
          </Section>

          <Section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n:'01', icon: GraduationCap, img: constructionImg,
                t:{ he:'צור פרופיל', en:'Create Profile' },
                d:{ he:'הגדר כישורים, מיקום וסוג ההזדמנות שאתה מחפש.', en:"Set your skills, location and the type of opportunity you're looking for." } },
              { n:'02', icon: Zap, img: weldingImg,
                t:{ he:'התאמת AI', en:'AI Match' },
                d:{ he:'AI מוצא את ההתאמה הטובה ביותר לפי מיקום, מקצוע וניסיון.', en:'AI finds your best match by location, trade and experience.' } },
              { n:'03', icon: Briefcase, img: electricalImg,
                t:{ he:'התחל בשטח', en:'Start in the Field' },
                d:{ he:'צבור ניסיון מעשי אמיתי תחת הנחיית מקצוען מנוסה.', en:'Gain real hands-on experience under a seasoned professional.' } },
            ].map((step, i) => (
              <motion.div key={i} variants={up} className="group rounded-3xl overflow-hidden border border-white/8 bg-white/[0.025]">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src={step.img} alt="" className="w-full h-full object-cover opacity-55 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/25 to-transparent" />
                  <span className="absolute top-4 left-5 text-[4.5rem] font-black text-white/10 leading-none select-none">{step.n}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-base font-black mb-1.5">{isRtl ? step.t.he : step.t.en}</h3>
                  <p className="text-sm text-white/38 leading-relaxed">{isRtl ? step.d.he : step.d.en}</p>
                </div>
              </motion.div>
            ))}
          </Section>
        </div>
      </section>

      {/* ─── TRADES STRIP ───────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-t border-white/6">
        <div className="max-w-6xl mx-auto px-6">
          <Section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <motion.p variants={up} className="text-[11px] font-black text-amber-500 uppercase tracking-[.25em]">
                {isRtl ? 'מגוון מקצועות' : 'Trade Categories'}
              </motion.p>
              <motion.h2 variants={up} className="text-3xl sm:text-[3.2rem] font-black tracking-tight leading-[1.05]">
                {isRtl ? 'כל המקצועות,\nמקום אחד' : 'All trades,\none place'}
              </motion.h2>
            </div>
            <motion.div variants={up}>
              <Link to="/app/opportunities"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 text-sm font-semibold transition-all">
                {isRtl ? 'כל ההזדמנויות' : 'All opportunities'}
                <ArrowRight size={14} className="rtl:rotate-180" />
              </Link>
            </motion.div>
          </Section>

          <Section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label:{ he:'חשמל',en:'Electrical' }, img: electricalImg },
              { label:{ he:'ריתוך',en:'Welding' }, img: weldingImg },
              { label:{ he:'בנייה',en:'Construction' }, img: constructionImg },
              { label:{ he:'ספרות',en:'Barbering' }, img: barberShop },
              { label:{ he:'שיפוצים',en:'Renovation' }, img: apprenticeImg },
              { label:{ he:'מכונאות',en:'Mechanics' }, img: constructionImg },
            ].map((t, i) => (
              <motion.div key={i} variants={up}>
                <Link to="/app/opportunities"
                  className="group relative aspect-video rounded-2xl overflow-hidden block">
                  <img src={t.img} alt={isRtl ? t.label.he : t.label.en}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 opacity-70 group-hover:opacity-90"
                    style={{ '--tw-scale-x': 1.08, '--tw-scale-y': 1.08 } as React.CSSProperties} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/8 transition-all duration-500" />
                  <p className="absolute bottom-3 left-4 text-white font-bold text-sm">
                    {isRtl ? t.label.he : t.label.en}
                  </p>
                </Link>
              </motion.div>
            ))}
          </Section>
        </div>
      </section>

      {/* ─── SPLIT CTA ──────────────────────────────────────── */}
      <section className="py-24 sm:py-32 border-t border-white/6">
        <div className="max-w-6xl mx-auto px-6">
          <Section className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Mentor */}
            <motion.div variants={up}
              className="group relative rounded-3xl overflow-hidden min-h-[400px] flex flex-col justify-between p-8 sm:p-10 border border-white/6">
              <img src={constructionImg} alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-38 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/80 via-[#080808]/55 to-[#080808]/80" />
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 text-[11px] font-bold uppercase tracking-widest border border-white/8">
                  <Briefcase size={11} />
                  {isRtl ? 'למנטורים' : 'For Masters'}
                </div>
                <h3 className="text-2xl sm:text-[1.9rem] font-black leading-tight">
                  {isRtl ? 'העבר ידע.\nקבל עזרה.' : 'Share knowledge.\nGet help.'}
                </h3>
                <ul className="space-y-2 pt-1">
                  {(isRtl
                    ? ['פרסם הזדמנות בחינם','קבל עזרה מחניכים מוטיבציוניים','אמת חשבון וקבל פי 5 יותר פניות']
                    : ['Post an opportunity for free','Get help from motivated apprentices','Verify and get 5x more responses']
                  ).map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-white/50">
                      <CheckCircle2 size={13} className="text-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/auth?mode=signup&role=mentor"
                className="relative inline-flex items-center gap-2 w-fit mt-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-full font-bold text-sm transition-all active:scale-95 shadow-[0_0_30px_-4px] shadow-amber-500/30">
                {isRtl ? 'הצטרף כמנטור' : 'Join as Master'}
                <ArrowRight size={14} className="rtl:rotate-180" />
              </Link>
            </motion.div>

            {/* Apprentice */}
            <motion.div variants={up}
              className="group relative rounded-3xl overflow-hidden min-h-[400px] flex flex-col justify-between p-8 sm:p-10 border border-white/6">
              <img src={apprenticeImg} alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-32 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/85 via-[#080808]/60 to-[#080808]/85" />
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/12 text-amber-300 text-[11px] font-bold uppercase tracking-widest border border-amber-500/18">
                  <GraduationCap size={11} />
                  {isRtl ? 'לחניכים' : 'For Apprentices'}
                </div>
                <h3 className="text-2xl sm:text-[1.9rem] font-black leading-tight">
                  {isRtl ? 'למד מהטובים.\nהתחל להרוויח.' : 'Learn from the best.\nStart earning.'}
                </h3>
                <ul className="space-y-2 pt-1">
                  {(isRtl
                    ? ['גלה מנטורים לפי מיקום ומקצוע','ראה ציון התאמה AI לפני פנייה','קבל ניסיון מעשי ושכר']
                    : ['Find mentors by location and trade','See AI match score before applying','Get hands-on experience and pay']
                  ).map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-white/50">
                      <CheckCircle2 size={13} className="text-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/auth?mode=signup&role=mentee"
                className="relative inline-flex items-center gap-2 w-fit mt-2 px-6 py-3 bg-white hover:bg-white/90 text-zinc-900 rounded-full font-bold text-sm transition-all active:scale-95">
                {isRtl ? 'הצטרף כחניך' : 'Join as Apprentice'}
                <ArrowRight size={14} className="rtl:rotate-180" />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────── */}
      <section className="py-24 sm:py-36 border-t border-white/6 text-center">
        <Section className="max-w-5xl mx-auto px-6 space-y-7">
          <motion.div variants={up} className="flex justify-center gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} size={15} className="text-amber-400 fill-amber-400" />)}
          </motion.div>

          <div>
            <div className="overflow-hidden">
              <motion.h2 variants={up}
                className="font-black text-white leading-[.9] tracking-tighter"
                style={{ fontSize: 'clamp(2.6rem, 8.5vw, 7rem)' }}>
                {isRtl ? 'מוכן לבנות' : 'Ready to build'}
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2 variants={up}
                className="font-black leading-[.9] tracking-tighter bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent"
                style={{ fontSize: 'clamp(2.6rem, 8.5vw, 7rem)' }}>
                {isRtl ? 'את הקריירה שלך?' : 'your career?'}
              </motion.h2>
            </div>
          </div>

          <motion.p variants={up} className="text-white/38 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            {isRtl
              ? 'הצטרפו לפלטפורמה שבה מנטורים וחניכים בונים קשרים מקצועיים שנמשכים שנים.'
              : 'Join the platform where mentors and apprentices build lasting professional relationships.'}
          </motion.p>

          <motion.div variants={up} className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/auth?mode=signup"
              className="group inline-flex items-center justify-center gap-2 px-9 py-4 bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-full font-bold text-sm transition-all shadow-[0_0_50px_-8px] shadow-amber-500/40 active:scale-[.97]">
              {isRtl ? 'התחל בחינם' : 'Get Started Free'}
              <ArrowRight size={15} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/app/opportunities"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold text-sm transition-all">
              {isRtl ? 'עיון ללא הרשמה' : 'Browse without signing up'}
            </Link>
          </motion.div>
        </Section>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-white/6 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-3">
            <div className="text-xl font-black tracking-tighter" dir="ltr">
              SkillLink<span className="text-amber-400">.</span>
            </div>
            <p className="text-white/30 text-sm max-w-xs leading-relaxed">
              {isRtl ? 'הבית של המקצוענים החדשים בישראל.' : "The home of Israel's next generation tradespeople."}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-white/30">
            {[
              { to:'/about',   he:'אודות',   en:'About' },
              { to:'/contact', he:'צור קשר', en:'Contact' },
              { to:'/privacy', he:'פרטיות',  en:'Privacy' },
              { to:'/terms',   he:'תנאים',   en:'Terms' },
            ].map(l => (
              <Link key={l.to} to={l.to} className="hover:text-white transition-colors">
                {isRtl ? l.he : l.en}
              </Link>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-white/5 flex justify-between text-[11px] text-white/18">
          <p>© 2026 SkillLink.</p>
          <p className="uppercase tracking-widest">{isRtl ? 'נבנה בישראל' : 'Built in Israel'}</p>
        </div>
      </footer>
    </div>
  );
}
