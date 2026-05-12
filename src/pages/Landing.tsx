import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Zap, Users, Award,
  Briefcase, GraduationCap, Star, CheckCircle2, ChevronDown,
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
  'חשמלאות','Electrical','ריתוך','Welding','נגרות','Carpentry',
  'אינסטלציה','Plumbing','בנייה','Construction','מכונאות','Mechanics','ספרות','Barbering',
];

interface LandingProps { isRtl: boolean; }

/* ── Parallax image helper ── */
function ParallaxImg({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-9%', '9%']);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img src={src} alt={alt} style={{ y }} className="w-full h-[118%] object-cover" />
    </div>
  );
}

/* ── Scroll reveal ── */
function Reveal({
  children, className = '', delay = 0, y = 36,
}: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-70px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Animated counter ── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const step = Math.ceil(target / 60);
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setN(cur);
      if (cur >= target) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{n}{suffix}</span>;
}

export default function Landing({ isRtl }: LandingProps) {
  const [counts, setCounts] = useState({ mentors: 120, mentees: 380, total: 500 });

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentor'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentee'),
    ]).then(([{ count: m }, { count: a }]) => {
      const t = (m || 0) + (a || 0);
      setCounts({ mentors: m || 0, mentees: a || 0, total: t > 0 ? t : 500 });
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes mq  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .mq { animation: mq 30s linear infinite; }
        .mq:hover { animation-play-state: paused }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-13px) rotate(.4deg)} }
        .float-anim { animation: float 5.5s ease-in-out infinite; }
      `}</style>

      {/* ═══════════════════════════════════ HERO ══════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute -top-20 right-[-10%] w-[700px] h-[700px] bg-blue-100/50 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-8%] w-[500px] h-[500px] bg-blue-50/70 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-14 py-28 grid lg:grid-cols-2 gap-14 items-center w-full">

          {/* ── Text ── */}
          <div className="space-y-8 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-[.2em]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {isRtl ? 'SkillLink · בטא פעילה' : 'SkillLink · Active Beta'}
            </motion.div>

            <div>
              {(isRtl
                ? ['למד מקצוע', 'מהטובים', 'ביותר.']
                : ['Learn a trade', 'from the very', 'best.']
              ).map((line, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.h1
                    initial={{ y: '108%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.95, delay: 0.15 + i * 0.11, ease: [0.22, 1, 0.36, 1] }}
                    className={`font-black leading-[1.0] tracking-tight block ${
                      i === 2
                        ? 'bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent'
                        : 'text-gray-950'
                    }`}
                    style={{ fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)' }}
                  >
                    {line}
                  </motion.h1>
                </div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.56 }}
              className="text-gray-500 text-[1.08rem] leading-relaxed max-w-md"
            >
              {isRtl
                ? 'SkillLink מחברת מנטורים מנוסים עם חניכים מוטיבציוניים בתחומי המקצועות המעשיים בישראל.'
                : 'SkillLink connects experienced trade mentors with motivated apprentices across Israel.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.67 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/auth?mode=signup"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-xl shadow-blue-600/30 active:scale-[.97]">
                {isRtl ? 'הצטרפות חינם' : 'Join for Free'}
                <ArrowRight size={15} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/app/opportunities"
                className="inline-flex items-center gap-2 px-8 py-4 border border-gray-200 hover:border-gray-300 bg-white text-gray-700 rounded-full font-bold text-sm transition-all hover:shadow-md">
                {isRtl ? 'עיון בהזדמנויות' : 'Browse Opportunities'}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.88 }}
              className="flex items-center gap-4 pt-1"
            >
              <div className="flex -space-x-2.5 rtl:space-x-reverse">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" />
                ))}
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">{counts.total}+ {isRtl ? 'מקצוענים' : 'professionals'}</p>
                <p className="text-xs text-gray-400">{isRtl ? 'כבר בפלטפורמה' : 'already on the platform'}</p>
              </div>
            </motion.div>
          </div>

          {/* ── Hero card ── */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? -60 : 60, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1.1, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 lg:order-2 flex justify-center"
          >
            <div className="absolute inset-4 bg-blue-400/20 rounded-[3rem] blur-[70px]" />
            <div className="float-anim relative w-full max-w-[380px] aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_-12px_rgba(30,64,175,0.18)] border border-blue-100">
              <img src={carpenterMentorImg} alt="Mentor teaching" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
              <div className="absolute top-5 left-5 px-3.5 py-1.5 bg-blue-600 rounded-full text-white text-[11px] font-black uppercase tracking-widest shadow-lg">
                {isRtl ? 'מנטור מוסמך' : 'Certified Mentor'}
              </div>
              <div className="absolute top-5 right-5 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <ShieldCheck size={18} className="text-blue-600" />
              </div>
              <div className="absolute bottom-5 left-5 right-5">
                <div className="font-black text-white text-base">{isRtl ? 'משה לוי — נגר' : 'Moshe Levi — Carpenter'}</div>
                <div className="text-white/55 text-xs mt-0.5">{isRtl ? 'תל אביב · 15 שנות ניסיון' : 'Tel Aviv · 15 years exp.'}</div>
                <div className="flex items-center gap-0.5 mt-2">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}
                  <span className="text-white/55 text-[11px] ms-1.5">4.9 (48)</span>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.15 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-3.5 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-green-500" />
              </div>
              <div>
                <div className="text-sm font-black text-gray-900">{isRtl ? 'התאמה נמצאה!' : 'Match Found!'}</div>
                <div className="text-[11px] text-gray-400">AI · 96%</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.35 }}
              className="absolute -top-3 -right-3 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-2.5 flex items-center gap-2"
            >
              <Users size={14} className="text-blue-600" />
              <span className="text-xs font-black text-gray-900">500+ {isRtl ? 'רשומים' : 'members'}</span>
            </motion.div>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
          <ChevronDown size={22} className="text-gray-300" />
        </motion.div>
      </section>

      {/* ═════════════════════════════════ MARQUEE ═════════════════════════════════ */}
      <div className="relative border-y border-gray-100 py-4 overflow-hidden bg-gray-50/80">
        <div className="flex whitespace-nowrap">
          <div className="mq flex shrink-0">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-4 px-6 text-[11px] font-black uppercase tracking-[.25em] text-gray-400">
                {item}
                <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════ FULL-BLEED STATEMENT ════════════════════════════ */}
      <section className="relative h-[75vh] overflow-hidden">
        <ParallaxImg src={carpenterMentorImg} alt="Mentor teaching apprentice" className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 w-full">
            <Reveal delay={0}>
              <p className="text-[11px] font-black text-blue-400 uppercase tracking-[.32em] mb-5">
                {isRtl ? 'הרעיון מאחורי SkillLink' : 'The SkillLink Idea'}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.02] tracking-tight max-w-2xl">
                {isRtl
                  ? <><span>ידע שמועבר</span><br /><span className="text-blue-400">מיד ליד.</span></>
                  : <><span>Knowledge passed</span><br /><span className="text-blue-400">hand to hand.</span></>
                }
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-white/55 text-lg mt-7 max-w-md leading-relaxed">
                {isRtl
                  ? 'המקצועות הטובים ביותר לא נלמדים בכיתה — הם נלמדים בשטח, עם מנטור שכבר עשה את הדרך.'
                  : "The best trades aren't learned in a classroom. They're learned in the field, with a mentor who's walked the path."}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ STATS ══════════════════════════════════ */}
      <section className="py-20 bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 text-center">
            {[
              { n: counts.mentors, s: '+', l: { he: 'מנטורים', en: 'Mentors' } },
              { n: counts.mentees, s: '+', l: { he: 'חניכים', en: 'Apprentices' } },
              { n: 15, s: '+', l: { he: 'מקצועות', en: 'Trades' } },
              { n: 100, s: '%', l: { he: 'חינם', en: 'Free' } },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.09} className="space-y-2">
                <p className="font-black leading-none" style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)' }}>
                  <Counter target={s.n} suffix={s.s} />
                </p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[.28em]">
                  {isRtl ? s.l.he : s.l.en}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ HOW IT WORKS — alternating ═══════════════════════ */}
      <section className="py-28 sm:py-44 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-14">

          {/* heading */}
          <div className="text-center mb-28">
            <Reveal>
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-[.28em] mb-4">
                {isRtl ? 'תהליך פשוט' : 'Simple Process'}
              </p>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-950 leading-[1.0]">
                {isRtl ? 'שלושה צעדים.' : 'Three steps.'}
                <span className="block mt-1 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  {isRtl ? 'קריירה שלמה.' : 'A whole career.'}
                </span>
              </h2>
            </Reveal>
          </div>

          {/* steps */}
          <div className="space-y-36">
            {[
              {
                n: '01',
                icon: GraduationCap,
                img: barberMentorImg,
                flip: false,
                t: { he: 'בנה פרופיל', en: 'Build Your Profile' },
                d: { he: 'הגדר את המקצוע, הניסיון, המיקום וסוג ההזדמנות שאתה מחפש. תהליך של שתי דקות.', en: 'Define your trade, experience, location and opportunity type. Takes two minutes.' },
                tags: [{ he: 'חינמי', en: 'Free' }, { he: '2 דקות', en: '2 minutes' }],
              },
              {
                n: '02',
                icon: Zap,
                img: electricianMentorImg,
                flip: true,
                t: { he: 'AI מוצא את ההתאמה', en: 'AI Finds Your Match' },
                d: { he: 'האלגוריתם מנתח מיקום, מקצוע וניסיון ומציג לך את ההתאמות הטובות ביותר עם ציון דיוק.', en: 'The algorithm analyzes location, trade and experience — showing you the best matches with a precision score.' },
                tags: [{ he: '92% דיוק', en: '92% accuracy' }, { he: 'מבוסס AI', en: 'AI-powered' }],
              },
              {
                n: '03',
                icon: Briefcase,
                img: constructionMentorImg,
                flip: false,
                t: { he: 'התחל בשטח', en: 'Start in the Field' },
                d: { he: 'צבור ניסיון מעשי אמיתי, בנה מוניטין ופתח דלתות בתעשייה — תחת הנחיית מקצוען מנוסה.', en: 'Gain real hands-on experience, build your reputation and open industry doors — guided by a seasoned pro.' },
                tags: [{ he: 'ניסיון אמיתי', en: 'Real experience' }, { he: 'בניית מוניטין', en: 'Build reputation' }],
              },
            ].map((step) => {
              const imgLeft = isRtl ? !step.flip : step.flip;
              return (
                <div key={step.n} className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">

                  {/* image */}
                  <Reveal delay={0.05} className={imgLeft ? 'lg:order-1' : 'lg:order-2'}>
                    <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-[0_24px_60px_-10px_rgba(0,0,0,0.14)] group">
                      <ParallaxImg src={step.img} alt={isRtl ? step.t.he : step.t.en} className="absolute inset-0 w-full h-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-blue-600/8 rounded-[2rem]" />
                    </div>
                  </Reveal>

                  {/* text */}
                  <div className={`space-y-6 ${imgLeft ? 'lg:order-2' : 'lg:order-1'}`}>
                    <Reveal>
                      <div className="flex items-center gap-5">
                        <span className="text-[5rem] font-black text-gray-100 leading-none select-none tabular-nums">{step.n}</span>
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/28">
                          <step.icon size={22} className="text-white" />
                        </div>
                      </div>
                    </Reveal>
                    <Reveal delay={0.08}>
                      <h3 className="text-3xl sm:text-4xl font-black text-gray-950 leading-tight">
                        {isRtl ? step.t.he : step.t.en}
                      </h3>
                    </Reveal>
                    <Reveal delay={0.14}>
                      <p className="text-gray-500 text-lg leading-relaxed">
                        {isRtl ? step.d.he : step.d.en}
                      </p>
                    </Reveal>
                    <Reveal delay={0.2}>
                      <div className="flex flex-wrap gap-2">
                        {step.tags.map((tag, j) => (
                          <span key={j} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-black">
                            <CheckCircle2 size={11} />
                            {isRtl ? tag.he : tag.en}
                          </span>
                        ))}
                      </div>
                    </Reveal>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ FEATURES ════════════════════════════════════ */}
      <section className="py-24 sm:py-36 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Reveal>
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-[.28em] mb-4">
                {isRtl ? 'למה SkillLink?' : 'Why SkillLink?'}
              </p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-950 leading-[1.05]">
                {isRtl ? 'נבנתה לשדה,\nלא למשרד.' : 'Built for the field.\nNot the office.'}
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Reveal className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-9 text-white h-full min-h-[230px]">
                <div className="absolute top-0 right-0 w-[320px] h-[260px] bg-white/10 rounded-full blur-[110px]" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                    <Zap size={22} className="text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black mb-3">{isRtl ? 'התאמת AI חכמה' : 'Smart AI Matching'}</h3>
                  <p className="text-blue-100 leading-relaxed max-w-sm mb-6 text-sm">
                    {isRtl
                      ? 'אלגוריתם מנתח מיקום, מקצוע וניסיון ומוצא את ההתאמה המדויקת.'
                      : 'Algorithm analyzes location, trade & experience to find your most precise match.'}
                  </p>
                  <div className="flex items-center gap-3 max-w-xs">
                    <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} whileInView={{ width: '92%' }}
                        transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                    <span className="text-white font-black text-sm">92%</span>
                    <span className="text-blue-200 text-xs">{isRtl ? 'דיוק' : 'accuracy'}</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-3xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all p-8 h-full min-h-[230px]">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
                  <ShieldCheck size={22} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-black mb-3 text-gray-950">{isRtl ? 'מנטורים מאומתים' : 'Verified Mentors'}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  {isRtl ? 'כל מנטור עובר תהליך אימות מסמכים ומוניטין מקיף.' : 'Every mentor undergoes thorough document & reputation verification.'}
                </p>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-blue-700 text-[11px] font-black uppercase tracking-widest">
                    {isRtl ? 'מאומת ✓' : 'Verified ✓'}
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-3xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all p-8 h-full min-h-[230px]">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
                  <Users size={22} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-black mb-3 text-gray-950">{isRtl ? 'קהילה פעילה' : 'Active Community'}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  {isRtl ? 'רשת של מקצוענים שעוזרים אחד לשני לצמוח ולהתפתח.' : "A network of trade pros helping each other grow."}
                </p>
                <div className="flex -space-x-2.5 rtl:space-x-reverse">
                  {AVATARS.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" />
                  ))}
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-sm">+</div>
                </div>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-3xl bg-gray-950 text-white p-9 h-full min-h-[230px]">
                <div className="absolute top-0 right-0 w-72 h-64 bg-blue-600/18 rounded-full blur-[100px]" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 h-full">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                      <Award size={22} className="text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black mb-3">{isRtl ? 'הכרה מקצועית' : 'Professional Recognition'}</h3>
                    <p className="text-white/45 leading-relaxed max-w-xs text-sm">
                      {isRtl ? 'בנה פרופיל מוניטין שפותח דלתות בתעשייה.' : 'Build a reputation profile that opens industry doors.'}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={30} className="text-yellow-400 fill-yellow-400" />)}
                    </div>
                    <p className="text-white/25 text-xs font-bold uppercase tracking-widest">{isRtl ? 'דירוג ממוצע' : 'Avg. rating'}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ SPLIT CTA ═════════════════════════════════ */}
      <section className="py-24 sm:py-36 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-950">
                {isRtl ? 'מנטור או חניך?' : 'Mentor or Apprentice?'}
              </h2>
              <p className="text-gray-400 mt-4 text-lg">{isRtl ? 'SkillLink בנויה לשניהם.' : 'SkillLink is built for both.'}</p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Reveal delay={0}>
              <div className="group relative rounded-3xl overflow-hidden min-h-[500px] flex flex-col justify-between p-9 sm:p-11 bg-gray-950 text-white">
                <img src={carpenterMentorImg} alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-950/65 via-gray-950/35 to-gray-950/95" />
                <div className="absolute top-0 right-0 w-[300px] h-[250px] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="relative space-y-5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[11px] font-black uppercase tracking-widest border border-white/10">
                    <Briefcase size={11} />
                    {isRtl ? 'למנטורים' : 'For Masters'}
                  </div>
                  <h3 className="text-3xl font-black leading-tight">
                    {isRtl ? <>העבר ידע.<br />קבל עזרה.</> : <>Share your knowledge.<br />Get real help.</>}
                  </h3>
                  <ul className="space-y-3 pt-1">
                    {(isRtl
                      ? ['פרסם הזדמנות בחינם', 'קבל עזרה מחניכים מוטיבציוניים', 'אמת חשבון וקבל פי 5 יותר פניות']
                      : ['Post an opportunity for free', 'Get help from motivated apprentices', 'Verify and get 5× more responses']
                    ).map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-white/60">
                        <CheckCircle2 size={15} className="text-blue-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/auth?mode=signup&role=mentor"
                  className="relative inline-flex items-center gap-2 w-fit mt-4 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm transition-all active:scale-95 shadow-xl shadow-blue-600/30">
                  {isRtl ? 'הצטרף כמנטור' : 'Join as Master'}
                  <ArrowRight size={14} className="rtl:rotate-180" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="group relative rounded-3xl overflow-hidden min-h-[500px] flex flex-col justify-between p-9 sm:p-11 border-2 border-gray-100 hover:border-blue-200 transition-all bg-white">
                <div className="relative space-y-5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-widest border border-blue-200">
                    <GraduationCap size={11} />
                    {isRtl ? 'לחניכים' : 'For Apprentices'}
                  </div>
                  <h3 className="text-3xl font-black leading-tight text-gray-950">
                    {isRtl ? <>למד מהטובים.<br />התחל להרוויח.</> : <>Learn from the best.<br />Start earning.</>}
                  </h3>
                  <ul className="space-y-3 pt-1">
                    {(isRtl
                      ? ['גלה מנטורים לפי מיקום ומקצוע', 'ראה ציון התאמה AI לפני פנייה', 'קבל ניסיון מעשי ושכר']
                      : ['Find mentors by location and trade', 'See AI match score before applying', 'Get hands-on experience and pay']
                    ).map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-gray-500">
                        <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="my-5 aspect-[16/9] rounded-2xl overflow-hidden">
                  <ParallaxImg src={constructionMentorImg} alt="" className="w-full h-full" />
                </div>
                <Link to="/auth?mode=signup&role=mentee"
                  className="relative inline-flex items-center gap-2 w-fit px-7 py-3.5 bg-gray-950 hover:bg-gray-800 text-white rounded-full font-bold text-sm transition-all active:scale-95">
                  {isRtl ? 'הצטרף כחניך' : 'Join as Apprentice'}
                  <ArrowRight size={14} className="rtl:rotate-180" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ FINAL CTA ══════════════════════════════════ */}
      <section className="relative py-40 sm:py-56 text-center overflow-hidden bg-gray-950">
        <div className="absolute inset-0">
          <ParallaxImg src={barberMentorImg} alt="" className="w-full h-full opacity-10" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-950/92 to-gray-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/18 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 space-y-10">
          <Reveal>
            <div className="flex justify-center gap-1.5 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />)}
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2
              className="font-black text-white leading-[.88] tracking-tight"
              style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}
            >
              {isRtl
                ? <><span className="block">מוכן לבנות</span><span className="block bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">את הקריירה שלך?</span></>
                : <><span className="block">Ready to build</span><span className="block bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">your career?</span></>
              }
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-white/45 text-lg max-w-md mx-auto leading-relaxed">
              {isRtl
                ? 'הצטרפו לפלטפורמה שבה מנטורים וחניכים בונים קשרים שנמשכים שנים.'
                : 'Join the platform where mentors and apprentices build relationships that last years.'}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth?mode=signup"
                className="group inline-flex items-center justify-center gap-2 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm transition-all shadow-2xl shadow-blue-600/30 active:scale-[.97]">
                {isRtl ? 'התחל בחינם — עכשיו' : 'Get Started Free — Now'}
                <ArrowRight size={15} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/app/opportunities"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/8 hover:bg-white/14 text-white rounded-full font-bold text-sm transition-all border border-white/10">
                {isRtl ? 'עיון ללא הרשמה' : 'Browse without signing up'}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════ FOOTER ════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-14 bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="space-y-3">
            <div className="text-xl font-black tracking-tighter text-white" dir="ltr">
              Skill<span className="text-blue-400">Link</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              {isRtl ? 'הבית של המקצוענים החדשים בישראל.' : "The home of Israel's next generation tradespeople."}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-gray-500">
            {[
              { to: '/about',   he: 'אודות',   en: 'About' },
              { to: '/contact', he: 'צור קשר', en: 'Contact' },
              { to: '/privacy', he: 'פרטיות',  en: 'Privacy' },
              { to: '/terms',   he: 'תנאים',   en: 'Terms' },
            ].map(l => (
              <Link key={l.to} to={l.to} className="hover:text-gray-200 transition-colors">
                {isRtl ? l.he : l.en}
              </Link>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-white/5 flex justify-between text-[11px] text-gray-600">
          <p>© 2026 SkillLink.</p>
          <p className="uppercase tracking-widest">{isRtl ? 'נבנה בישראל' : 'Built in Israel'}</p>
        </div>
      </footer>
    </div>
  );
}
