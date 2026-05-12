import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, MapPin, Star, MessageSquare, Zap, ArrowUpRight, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductShowcaseProps {
  isRtl: boolean;
}

const STEPS = [
  {
    step: '01',
    en: { title: 'Post or Browse', desc: 'Mentors post apprenticeship openings. Apprentices browse by trade and location.' },
    he: { title: 'פרסם או חפש', desc: 'מנטורים מפרסמים הזדמנויות. חניכים מחפשים לפי מקצוע ואזור.' },
    icon: MapPin,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    step: '02',
    en: { title: 'Connect & Chat', desc: 'Send a message directly. No middlemen, no agencies — just real people.' },
    he: { title: 'התחבר ודבר', desc: 'שלח הודעה ישירות. אין מתווכים, אין סוכנויות — רק בני אדם אמיתיים.' },
    icon: MessageSquare,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    step: '03',
    en: { title: 'Learn on the Job', desc: 'Start your apprenticeship with a verified professional and build your career.' },
    he: { title: 'למד בשטח', desc: 'התחל התמחות עם מקצועי מאומת ובנה את הקריירה שלך.' },
    icon: Shield,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
];

const MOCK_CARDS = [
  { name: 'דוד כהן', trade: 'נגרות', location: 'תל אביב', pay: '40₪/שעה', verified: true, avatar: 'ד' },
  { name: 'מירה לוי', trade: 'חשמל', location: 'חיפה', pay: '45₪/שעה', verified: true, avatar: 'מ' },
  { name: 'יוסף אברהם', trade: 'אינסטלציה', location: 'ירושלים', pay: '38₪/שעה', verified: false, avatar: 'י' },
];

const TRADE_COLORS: Record<string, string> = {
  'נגרות': 'bg-amber-500/20 text-amber-300',
  'חשמל': 'bg-yellow-500/20 text-yellow-300',
  'אינסטלציה': 'bg-blue-500/20 text-blue-300',
};

function AppMockup({ isRtl }: { isRtl: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % MOCK_CARDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Browser chrome */}
      <div className="bg-slate-800 rounded-t-2xl px-4 py-3 flex items-center gap-2 border border-slate-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
        </div>
        <div className="flex-1 bg-slate-700/60 rounded-md text-slate-400 text-[10px] text-center py-1 font-mono">
          skill-link-eta.vercel.app/explore
        </div>
      </div>

      {/* App screen */}
      <div className="bg-slate-950 rounded-b-2xl border border-t-0 border-slate-700 p-4 space-y-3 min-h-[260px]">
        {/* Fake nav */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-white font-black text-sm">SkillLink<span className="text-emerald-400">.</span></span>
          <div className="flex gap-2">
            {['חיפוש', 'מנטורים', 'שמורים'].map(t => (
              <span key={t} className="text-[9px] text-slate-500 font-black uppercase tracking-wider">{t}</span>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {MOCK_CARDS.map((card, i) => (
              <motion.div
                key={card.name}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: i === active ? 1 : 0.45, y: 0, scale: i === active ? 1 : 0.97 }}
                transition={{ duration: 0.4 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  i === active ? 'bg-white/8 border-white/15' : 'bg-white/3 border-white/5'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                  {card.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-xs font-black truncate">{card.name}</span>
                    {card.verified && <CheckCircle size={10} className="text-emerald-400 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${TRADE_COLORS[card.trade] ?? 'bg-slate-700 text-slate-300'}`}>
                      {card.trade}
                    </span>
                    <span className="text-slate-500 text-[9px]">{card.location}</span>
                  </div>
                </div>
                <span className="text-emerald-400 text-[10px] font-black flex-shrink-0">{card.pay}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Match badge */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="flex items-center justify-center gap-2 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
        >
          <Zap size={11} className="text-emerald-400 fill-current" />
          <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            {isRtl ? '3 התאמות חדשות עבורך' : '3 New Matches Found'}
          </span>
        </motion.div>
      </div>

      {/* Floating badges */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: -28, y: 20 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute -left-4 top-16 bg-white rounded-2xl shadow-2xl px-3 py-2 flex items-center gap-2 border border-slate-100"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <CheckCircle size={12} className="text-white" />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{isRtl ? 'אומת' : 'Verified'}</p>
          <p className="text-[11px] font-black text-black">{isRtl ? 'מנטור מקצועי' : 'Pro Mentor'}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 28, y: -10 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute -right-4 bottom-24 bg-slate-900 rounded-2xl shadow-2xl px-3 py-2 flex items-center gap-2 border border-slate-700"
      >
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <Users size={11} className="text-white" />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{isRtl ? 'פעיל' : 'Active'}</p>
          <p className="text-[11px] font-black text-white">{isRtl ? '11 משתמשים' : '11 Users'}</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-3 top-8 bg-emerald-500 rounded-xl shadow-xl px-2.5 py-1.5 flex items-center gap-1.5"
      >
        <Star size={10} className="text-white fill-white" />
        <span className="text-white text-[10px] font-black">4.9</span>
      </motion.div>
    </div>
  );
}

export default function ProductShowcase({ isRtl }: ProductShowcaseProps) {
  return (
    <div className="bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top strip */}
      <div className="relative px-8 md:px-14 pt-12 pb-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.06)_0%,_transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left text */}
          <div className="flex-1 space-y-7 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
              <Zap size={11} className="fill-current animate-pulse" />
              {isRtl ? 'כך זה עובד' : 'See How It Works'}
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight">
              {isRtl
                ? <><span className="text-emerald-400">ללמוד מקצוע</span><br />זה לא היה קל יותר</>
                : <><span className="text-emerald-400">Learning a trade</span><br />has never been easier</>}
            </h2>

            <p className="text-slate-400 text-base font-medium leading-relaxed max-w-md">
              {isRtl
                ? 'SkillLink מחברת בין אומנים מקצועיים לחניכים שרוצים ללמוד את העבודה האמיתית — ישירות מהשטח, לא מסרטון YouTube.'
                : 'SkillLink connects skilled tradespeople with apprentices who want to learn the real job — directly on-site, not from a YouTube video.'}
            </p>

            {/* Steps */}
            <div className="space-y-3">
              {STEPS.map(({ step, en, he, icon: Icon, color, bg }) => (
                <div key={step} className={`flex items-start gap-4 p-4 rounded-2xl border ${bg} group`}>
                  <div className={`w-9 h-9 rounded-xl bg-slate-900 border ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-black ${color} uppercase tracking-widest`}>{step}</span>
                      <span className="text-white text-sm font-black">{isRtl ? he.title : en.title}</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{isRtl ? he.desc : en.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-7 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
            >
              {isRtl ? 'הצטרף עכשיו — בחינם' : 'Join Now — It\'s Free'}
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Right — App mockup */}
          <div className="flex-shrink-0 w-full max-w-xs lg:max-w-sm pb-0 lg:pb-0 relative">
            <AppMockup isRtl={isRtl} />
          </div>
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="mt-10 border-t border-slate-800 grid grid-cols-3 divide-x divide-slate-800">
        {[
          { value: '100%', label: isRtl ? 'בחינם לחלוטין' : 'Completely Free' },
          { value: '< 5min', label: isRtl ? 'להתחיל' : 'To Get Started' },
          { value: '4.9★', label: isRtl ? 'דירוג ממוצע' : 'Avg. Rating' },
        ].map(({ value, label }) => (
          <div key={label} className="py-5 px-4 text-center">
            <p className="text-white font-black text-xl">{value}</p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
