import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Star, MapPin, CheckCircle2, Briefcase, GraduationCap, Sparkles, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

/* ─────────────────────────────────────────── helpers */
const MARQUEE_TRADES = [
  'חשמלאות', 'Welding', 'נגרות', 'Plumbing', 'ריתוך', 'Barbering',
  'אינסטלציה', 'Mechanics', 'בנייה', 'Electrical', 'מכונאות', 'Carpentry',
];

const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=80',
];

function Reveal({ children, className = '', delay = 0, dir = 'up' }: {
  children: React.ReactNode; className?: string; delay?: number; dir?: 'up' | 'left' | 'right';
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const y = dir === 'up' ? 24 : 0;
  const x = dir === 'left' ? -24 : dir === 'right' ? 24 : 0;
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y, x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────── mock app card */
function MockCard({ title, tag, pay, location, matchPct, tagColor, delay }: {
  title: string; tag: string; pay: string; location: string; matchPct: number;
  tagColor: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border border-slate-200 shadow-lg p-3.5 space-y-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-black">
            {title.charAt(0)}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-900 leading-tight">{title}</p>
            <p className="text-[9px] text-slate-400">Tel Aviv</p>
          </div>
        </div>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${tagColor}`}>{tag}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="flex items-center gap-0.5 text-[9px] text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-1.5 py-0.5">
          <MapPin size={7} className="text-slate-400" />{location}
        </span>
        <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">
          {pay}
        </span>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <span className="text-[9px] text-slate-400">2d ago</span>
        <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-700 bg-slate-100 rounded-full px-1.5 py-0.5">
          <Zap size={7} className="text-emerald-500 fill-emerald-500" />
          {matchPct}%
        </span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────── main */
interface LandingProps { isRtl: boolean; }

export default function Landing({ isRtl }: LandingProps) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .then(({ count }) => { if (count && count > 0) setTotal(count); }, () => {});
  }, []);

  return (
    <div className="bg-white text-slate-900 overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes mq { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .mq { animation: mq 28s linear infinite; }
        .mq-rev { animation: mq 36s linear infinite reverse; }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-10 h-14 bg-[#07070e]/90 backdrop-blur-md border-b border-white/6">
        <div className="text-base font-black tracking-tight text-white" dir="ltr">
          Skill<span className="text-blue-500">Link</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth?mode=login"
            className="px-4 py-1.5 text-white/60 hover:text-white text-sm font-semibold transition-colors">
            {isRtl ? 'כניסה' : 'Sign in'}
          </Link>
          <Link to="/auth?mode=signup"
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors">
            {isRtl ? 'הצטרף' : 'Join free'}
          </Link>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-svh bg-[#07070e] flex flex-col justify-center overflow-hidden px-5 sm:px-10 lg:px-16 pt-24 pb-16">
        {/* background glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-[10%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — text */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* badge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-white/60 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isRtl ? 'הפלטפורמה הראשונה לאנשי מקצוע בישראל' : "Israel's first trade skills platform"}
            </motion.div>

            {/* headline */}
            <div className="space-y-1 overflow-hidden">
              {(isRtl
                ? ['עבוד עם הטובים.', 'הפוך לאחד מהם.']
                : ['Train under the best.', 'Become one of them.']
              ).map((line, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.h1
                    initial={{ y: '110%' }} animate={{ y: '0%' }}
                    transition={{ duration: 0.85, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className={`font-black leading-[1.05] tracking-tight block ${
                      i === 1
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300'
                        : 'text-white'
                    }`}
                    style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.8rem)' }}
                  >
                    {line}
                  </motion.h1>
                </div>
              ))}
            </div>

            {/* subtext */}
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              className="text-white/50 text-base sm:text-lg leading-relaxed max-w-md">
              {isRtl
                ? 'SkillLink מחברת בין בעלי מקצוע מאומתים לחניכים שרוצים לעבוד וללמוד. בחינם. בלי בירוקרטיה.'
                : 'SkillLink connects verified trade professionals with apprentices who are serious about learning. Free, no BS.'}
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.5 }}
              className="flex flex-wrap gap-3">
              <Link to="/auth?mode=signup"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm transition-all shadow-2xl shadow-blue-600/30 active:scale-95">
                {isRtl ? 'התחל עכשיו — חינם' : 'Get Started — Free'}
                <ArrowRight size={15} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/app/opportunities"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/10 hover:border-white/20 bg-white/5 text-white/70 hover:text-white rounded-2xl font-semibold text-sm transition-all">
                {isRtl ? 'עיין בהזדמנויות' : 'Browse Listings'}
              </Link>
            </motion.div>

            {/* social proof */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="flex items-center gap-3">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-[#07070e] object-cover" />
                ))}
              </div>
              <p className="text-sm text-white/40">
                {total > 5
                  ? <><span className="font-black text-white">{total}+</span>{' '}{isRtl ? 'משתמשים פעילים' : 'active members'}</>
                  : <span className="italic">{isRtl ? 'קהילה בצמיחה — הצטרף ראשון 🔥' : 'Growing community — join early 🔥'}</span>
                }
              </p>
            </motion.div>
          </div>

          {/* Right — phone mockup with app cards */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[320px] sm:max-w-[360px]">

              {/* phone frame */}
              <div className="relative bg-slate-950 rounded-[2.2rem] p-3 shadow-2xl border border-white/8">
                {/* status bar */}
                <div className="flex items-center justify-between px-4 py-1.5 mb-1">
                  <span className="text-white/30 text-[10px] font-semibold">9:41</span>
                  <div className="w-16 h-4 bg-black rounded-full" />
                  <div className="flex gap-1">
                    <div className="w-3 h-2 bg-white/20 rounded-sm" />
                    <div className="w-1 h-2 bg-white/20 rounded-sm" />
                  </div>
                </div>
                {/* app UI */}
                <div className="bg-white rounded-[1.6rem] overflow-hidden">
                  {/* header */}
                  <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-black text-slate-900">
                        {isRtl ? 'הזדמנויות' : 'Opportunities'}
                      </p>
                      <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Zap size={8} className="text-emerald-500 fill-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-700">{isRtl ? 'AI' : 'AI'}</span>
                      </div>
                    </div>
                    <div className="h-7 bg-slate-100 rounded-xl" />
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-2">
                    <MockCard
                      title={isRtl ? 'יוסי כהן — חשמלאי' : 'Yossi — Electrician'}
                      tag={isRtl ? 'מנטור' : 'Mentor'}
                      pay="₪180/hr"
                      location={isRtl ? 'תל אביב' : 'Tel Aviv'}
                      matchPct={94}
                      tagColor="bg-blue-50 text-blue-700 border-blue-200"
                      delay={0.6}
                    />
                    <MockCard
                      title={isRtl ? 'דוד לוי — נגר' : 'David — Carpenter'}
                      tag={isRtl ? 'חניך' : 'Apprentice'}
                      pay="₪120/hr"
                      location={isRtl ? 'רמת גן' : 'Ramat Gan'}
                      matchPct={87}
                      tagColor="bg-emerald-50 text-emerald-700 border-emerald-200"
                      delay={0.72}
                    />
                    <MockCard
                      title={isRtl ? 'מוחמד — ריתוך' : 'Mohammed — Welding'}
                      tag={isRtl ? 'מנטור' : 'Mentor'}
                      pay="₪200/hr"
                      location={isRtl ? 'חיפה' : 'Haifa'}
                      matchPct={79}
                      tagColor="bg-blue-50 text-blue-700 border-blue-200"
                      delay={0.84}
                    />
                    <MockCard
                      title={isRtl ? 'נועה — ספרות' : 'Noa — Barber'}
                      tag={isRtl ? 'חניך' : 'Apprentice'}
                      pay="₪90/hr"
                      location={isRtl ? 'ירושלים' : 'Jerusalem'}
                      matchPct={91}
                      tagColor="bg-emerald-50 text-emerald-700 border-emerald-200"
                      delay={0.96}
                    />
                  </div>
                  {/* bottom bar */}
                  <div className="flex justify-around items-center px-4 py-3 border-t border-slate-100">
                    {[['●', 'blue-500'], ['○', 'slate-300'], ['○', 'slate-300'], ['○', 'slate-300']].map(([s, c], i) => (
                      <div key={i} className={`text-${c} text-sm`}>{s}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* floating badge */}
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-4 -left-4 rtl:-left-auto rtl:-right-4 bg-white rounded-2xl shadow-2xl border border-slate-100 px-3.5 py-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-900">{isRtl ? 'נמצאה התאמה!' : 'Match found!'}</p>
                  <p className="text-[9px] text-slate-400">AI · 96% {isRtl ? 'התאמה' : 'match'}</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -top-4 -right-4 rtl:-right-auto rtl:-left-4 bg-white rounded-2xl shadow-2xl border border-slate-100 px-3 py-2 flex items-center gap-2">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <p className="text-[11px] font-black text-slate-900">{isRtl ? 'מאומת ✓' : 'Verified ✓'}</p>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ══ MARQUEE ═════════════════════════════════════════════════════════════ */}
      <div className="border-y border-slate-100 py-3 overflow-hidden bg-slate-50">
        <div className="flex whitespace-nowrap">
          <div className="mq flex shrink-0">
            {[...MARQUEE_TRADES, ...MARQUEE_TRADES, ...MARQUEE_TRADES, ...MARQUEE_TRADES].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-4 text-[9px] font-black uppercase tracking-[.24em] text-slate-400">
                {t}<span className="w-1 h-1 rounded-full bg-blue-300 shrink-0" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ STATS ════════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-16 px-5 sm:px-10 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {[
              { n: '8+',   l: { he: 'מקצועות',      en: 'Trades'          } },
              { n: 'AI',   l: { he: 'התאמה חכמה',   en: 'Smart Matching'  } },
              { n: '100%', l: { he: 'ללא עלות',      en: 'Free to Join'   } },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="text-center">
                  <p className="text-3xl sm:text-5xl font-black text-slate-900 leading-none tracking-tight">{s.n}</p>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-widest">
                    {isRtl ? s.l.he : s.l.en}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-20 px-5 sm:px-10 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-10">
          <Reveal className="text-center space-y-2">
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-[.24em]">
              {isRtl ? 'למה SkillLink' : 'Why SkillLink'}
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              {isRtl ? 'הדרך הישרה ביותר להתקדם.' : 'The straightest path to growth.'}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Zap,
                color: 'bg-blue-50 text-blue-600',
                t: { he: 'AI Matching חכם', en: 'Smart AI Matching' },
                d: { he: 'המערכת מנתחת את הפרופיל שלך ומוצאת את ההתאמה המדויקת — לפי מקצוע, מיקום ורמה.', en: 'The system analyzes your profile and surfaces the most precise match — by trade, location, and level.' },
              },
              {
                icon: ShieldCheck,
                color: 'bg-emerald-50 text-emerald-600',
                t: { he: 'מנטורים מאומתים', en: 'Verified Mentors' },
                d: { he: 'כל מנטור עובר תהליך אימות. אתה יודע עם מי אתה עובד לפני שאתה פונה.', en: 'Every mentor goes through a verification process. You know who you\'re dealing with before you reach out.' },
              },
              {
                icon: Briefcase,
                color: 'bg-amber-50 text-amber-600',
                t: { he: 'עבודה אמיתית, שכר אמיתי', en: 'Real Work, Real Pay' },
                d: { he: 'לא קורס, לא סימולציה. חניכות אמיתית על פרויקטים אמיתיים עם תגמול הוגן.', en: 'Not a course, not a simulation. Real apprenticeship on real projects with fair pay.' },
              },
            ].map(({ icon: Icon, color, t, d }, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 hover:shadow-md hover:border-slate-200 transition-all">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 mb-1.5">{isRtl ? t.he : t.en}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{isRtl ? d.he : d.en}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-24 px-5 sm:px-10 bg-white">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center space-y-2 mb-10 sm:mb-16">
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-[.24em]">
              {isRtl ? 'שלושה צעדים' : 'Three steps'}
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              {isRtl ? 'מתחילים תוך דקות.' : 'Up and running in minutes.'}
            </h2>
          </Reveal>

          <div className="relative space-y-0">
            {/* vertical line — desktop only */}
            <div className="hidden sm:block absolute left-8 rtl:left-auto rtl:right-8 top-8 bottom-8 w-px bg-slate-100" />

            {[
              {
                n: '01',
                color: 'bg-blue-600 text-white',
                t: { he: 'צור פרופיל', en: 'Create your profile' },
                d: { he: 'ציין מקצוע, רמת ניסיון ומיקום. פחות משתי דקות.', en: 'Enter your trade, experience level and location. Under two minutes.' },
                img: '/electrician_mentor.jpg',
              },
              {
                n: '02',
                color: 'bg-indigo-600 text-white',
                t: { he: 'גלה התאמות', en: 'Discover matches' },
                d: { he: 'ה-AI מנתח ומציג לך את ההתאמות המדויקות ביותר לפרופיל שלך.', en: 'AI analyzes and surfaces the most accurate matches for your profile.' },
                img: '/carpenter_mentor.jpg',
              },
              {
                n: '03',
                color: 'bg-emerald-600 text-white',
                t: { he: 'צא לשטח', en: 'Get to work' },
                d: { he: 'צבור ניסיון מעשי תחת מקצוען, ובנה קריירה שמשלמת.', en: 'Gain real experience under an expert and build a career that pays.' },
                img: '/construction_mentor.jpg',
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="flex items-start gap-5 sm:gap-8 py-6 sm:py-8 border-b border-slate-100 last:border-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-black shrink-0 shadow-lg ${step.color}`}>
                    {step.n}
                  </div>
                  <div className="flex-1 pt-0.5 sm:pt-1">
                    <h3 className="text-base sm:text-xl font-black text-slate-900 mb-1">
                      {isRtl ? step.t.he : step.t.en}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {isRtl ? step.d.he : step.d.en}
                    </p>
                  </div>
                  <div className="hidden sm:block w-20 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <img src={step.img} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOR MENTOR / FOR APPRENTICE ══════════════════════════════════════════ */}
      <section className="py-12 sm:py-24 px-5 sm:px-10 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-8">
          <Reveal className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              {isRtl ? 'אתה המנטור או החניך?' : 'Are you the mentor or the apprentice?'}
            </h2>
            <p className="text-sm text-slate-500">
              {isRtl ? 'SkillLink בנויה לשני הצדדים.' : 'SkillLink is built for both sides.'}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Mentor */}
            <Reveal>
              <div className="relative rounded-2xl overflow-hidden group">
                <div className="absolute inset-0">
                  <img src="/carpenter_mentor.jpg" alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/50" />
                </div>
                <div className="relative p-6 sm:p-8 space-y-4 min-h-[300px] sm:min-h-[360px] flex flex-col justify-end">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/80 border border-blue-500/40 text-[10px] font-black uppercase tracking-widest text-white mb-3">
                      <Briefcase size={9} />{isRtl ? 'למנטורים' : 'For Mentors'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-snug mb-2">
                      {isRtl ? <>חנך את הבא בתור.<br />תמצא כוח אדם שגדל אצלך.</> : <>Train the next generation.<br />Find talent that grows with you.</>}
                    </h3>
                    <ul className="space-y-1.5">
                      {(isRtl
                        ? ['פרסם הזדמנות — ללא עלות', 'קבל פניות מחניכים רציניים', 'מנטורים מאומתים מקבלים פי 5 יותר פניות']
                        : ['Post a listing — completely free', 'Receive applications from serious apprentices', 'Verified mentors get 5× more inquiries']
                      ).map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-white/60">
                          <CheckCircle2 size={12} className="text-blue-400 shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link to="/auth?mode=signup&role=mentor"
                    className="inline-flex items-center gap-2 w-fit px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all active:scale-95">
                    {isRtl ? 'הצטרף כמנטור' : 'Join as a Mentor'}
                    <ArrowRight size={13} className="rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Apprentice */}
            <Reveal delay={0.1}>
              <div className="relative rounded-2xl overflow-hidden group">
                <div className="absolute inset-0">
                  <img src="/barber_mentor.jpg" alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/50" />
                </div>
                <div className="relative p-6 sm:p-8 space-y-4 min-h-[300px] sm:min-h-[360px] flex flex-col justify-end">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600/80 border border-emerald-500/40 text-[10px] font-black uppercase tracking-widest text-white mb-3">
                      <GraduationCap size={9} />{isRtl ? 'לחניכים' : 'For Apprentices'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-snug mb-2">
                      {isRtl ? <>למד ממקצוענים אמיתיים.<br />הרוויח מהיום הראשון.</> : <>Learn from real professionals.<br />Earn from day one.</>}
                    </h3>
                    <ul className="space-y-1.5">
                      {(isRtl
                        ? ['חפש מנטורים לפי מקצוע ומיקום', 'ראה ציון התאמה לפני שאתה פונה', 'ניסיון מעשי עם תגמול הוגן']
                        : ['Search mentors by trade and location', 'See your compatibility score before applying', 'Real hands-on experience with fair pay']
                      ).map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-white/60">
                          <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link to="/auth?mode=signup&role=mentee"
                    className="inline-flex items-center gap-2 w-fit px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all active:scale-95">
                    {isRtl ? 'הצטרף כחניך' : 'Join as an Apprentice'}
                    <ArrowRight size={13} className="rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-28 px-5 sm:px-10 bg-[#07070e] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
        <Reveal className="relative max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-white/50 text-xs font-semibold">
            <Sparkles size={11} className="text-blue-400" />
            {isRtl ? 'ללא כרטיס אשראי' : 'No credit card required'}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            {isRtl ? 'ההזדמנות הבאה שלך כבר ממתינה.' : 'Your next opportunity is waiting.'}
          </h2>
          <p className="text-white/40 text-base sm:text-lg">
            {isRtl ? 'הצטרף לאלפי אנשי מקצוע שכבר בנו את הקריירה שלהם דרך SkillLink.' : "Join thousands of tradespeople who've already built their career through SkillLink."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth?mode=signup"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm transition-all shadow-2xl shadow-blue-600/30 active:scale-95">
              {isRtl ? 'צור חשבון חינמי' : 'Create a Free Account'}
              <ArrowRight size={14} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/app/opportunities"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 hover:border-white/20 bg-white/5 text-white/70 hover:text-white rounded-2xl font-semibold text-sm transition-all">
              {isRtl ? 'עיין בלי להירשם' : 'Browse without signing up'}
              <ChevronRight size={14} className="rtl:rotate-180" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#07070e] border-t border-white/6 py-8 sm:py-10 px-5 sm:px-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="text-base font-black tracking-tight text-white" dir="ltr">
            Skill<span className="text-blue-500">Link</span>
            <span className="text-white/20 font-normal text-sm ms-3">© 2026</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/30">
            {[
              { to: '/about',   he: 'אודות',   en: 'About'   },
              { to: '/contact', he: 'צור קשר', en: 'Contact' },
              { to: '/privacy', he: 'פרטיות',  en: 'Privacy' },
              { to: '/terms',   he: 'תנאים',   en: 'Terms'   },
            ].map(l => (
              <Link key={l.to} to={l.to} className="hover:text-white transition-colors">
                {isRtl ? l.he : l.en}
              </Link>
            ))}
          </div>
          <p className="text-[11px] text-white/20 uppercase tracking-widest">
            {isRtl ? 'נבנה בישראל 🇮🇱' : 'Built in Israel 🇮🇱'}
          </p>
        </div>
      </footer>
    </div>
  );
}
