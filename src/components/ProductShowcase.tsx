import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, MapPin, MessageSquare, Zap, ArrowUpRight, Shield, Hammer, Wrench, Scissors, HardHat, Lightbulb, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductShowcaseProps {
  isRtl: boolean;
}

const TRADES = [
  { label: 'נגרות', labelEn: 'Carpentry', icon: Hammer, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
  { label: 'חשמלאות', labelEn: 'Electrical', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200' },
  { label: 'ספרות', labelEn: 'Barbering', icon: Scissors, color: 'text-pink-500', bg: 'bg-pink-50 border-pink-200' },
  { label: 'שיפוצים', labelEn: 'Renovations', icon: HardHat, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
  { label: 'אינסטלציה', labelEn: 'Plumbing', icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
];

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  delay: i * 0.35,
  x: 20 + Math.sin(i * 1.2) * 15,
  size: 6 + (i % 3) * 3,
}));

const STEPS = [
  {
    step: '01',
    en: { title: 'Post or Browse', desc: 'Mentors post openings. Apprentices browse by trade and location.' },
    he: { title: 'פרסם או חפש', desc: 'מנטורים מפרסמים. חניכים מחפשים לפי מקצוע ואזור.' },
    icon: MapPin,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-100',
  },
  {
    step: '02',
    en: { title: 'Connect & Chat', desc: 'Message directly — no middlemen, no agencies.' },
    he: { title: 'התחבר ודבר', desc: 'שלח הודעה ישירות — ללא מתווכים.' },
    icon: MessageSquare,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-100',
  },
  {
    step: '03',
    en: { title: 'Learn on the Job', desc: 'Train with a verified professional and build your career.' },
    he: { title: 'למד בשטח', desc: 'התמחה עם מקצועי מאומת ובנה קריירה.' },
    icon: Shield,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-100',
  },
];

const MOCK_CARDS = [
  { name: 'דוד כהן', trade: 'נגרות', location: 'תל אביב', pay: '40₪/שעה', verified: true, avatar: 'ד' },
  { name: 'מירה לוי', trade: 'חשמל', location: 'חיפה', pay: '45₪/שעה', verified: true, avatar: 'מ' },
  { name: 'יוסף אברהם', trade: 'אינסטלציה', location: 'ירושלים', pay: '38₪/שעה', verified: false, avatar: 'י' },
];

function AppMockup({ isRtl }: { isRtl: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % MOCK_CARDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full max-w-xs mx-auto">
      <div className="bg-slate-800 rounded-t-xl px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="flex-1 bg-slate-700/60 rounded text-slate-400 text-[9px] text-center py-0.5 font-mono">
          skilllink / explore
        </div>
      </div>

      <div className="bg-slate-950 rounded-b-xl border border-t-0 border-slate-700 p-3 space-y-2.5 min-h-[220px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <span className="text-white font-black text-xs">SkillLink<span className="text-emerald-400">.</span></span>
          <div className="flex gap-2">
            {['חיפוש', 'מנטורים'].map(t => (
              <span key={t} className="text-[8px] text-slate-500 font-black">{t}</span>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          {MOCK_CARDS.map((card, i) => (
            <motion.div
              key={card.name}
              animate={{ opacity: i === active ? 1 : 0.4, scale: i === active ? 1 : 0.97 }}
              transition={{ duration: 0.4 }}
              className={`flex items-center gap-2 p-2 rounded-lg border ${i === active ? 'bg-white/8 border-white/15' : 'bg-white/3 border-white/5'}`}
            >
              <div className="w-7 h-7 rounded-md bg-slate-700 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                {card.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-white text-[10px] font-black truncate">{card.name}</span>
                  {card.verified && <CheckCircle size={8} className="text-emerald-400 flex-shrink-0" />}
                </div>
                <div className="text-slate-500 text-[8px]">{card.trade} · {card.location}</div>
              </div>
              <span className="text-emerald-400 text-[9px] font-black flex-shrink-0">{card.pay}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
        >
          <Zap size={9} className="text-emerald-400 fill-current" />
          <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">
            {isRtl ? '3 התאמות חדשות' : '3 New Matches'}
          </span>
        </motion.div>
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-4 top-6 bg-emerald-500 rounded-xl shadow-lg px-2 py-1 flex items-center gap-1"
      >
        <Star size={9} className="text-white fill-white" />
        <span className="text-white text-[9px] font-black">4.9</span>
      </motion.div>
    </div>
  );
}

function TradeScene({ isRtl }: { isRtl: boolean }) {
  const [tradeIdx, setTradeIdx] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);

  const messages = isRtl
    ? ['תראה איך אני עושה את זה...', 'עכשיו תנסה בעצמך', 'מצוין! ממש כמוני', 'שאל אותי כל שאלה']
    : ['Watch how I do this...', 'Now you try it yourself', 'Perfect! Just like me', 'Ask me anything'];

  useEffect(() => {
    const t1 = setInterval(() => setTradeIdx(i => (i + 1) % TRADES.length), 2800);
    const t2 = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 2200);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const trade = TRADES[tradeIdx];
  const TradeIcon = trade.icon;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200" style={{ minHeight: 260 }}>
        {/* Subtle grid bg */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}
        />

        {/* LIVE badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500 rounded-full px-2.5 py-1 z-10">
          <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="text-white text-[9px] font-black uppercase tracking-widest">Live</span>
        </div>

        {/* Trade badge top-right */}
        <AnimatePresence mode="wait">
          <motion.div
            key={trade.label}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4 }}
            className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black z-10 ${trade.bg} ${trade.color}`}
          >
            <TradeIcon size={11} />
            {isRtl ? trade.label : trade.labelEn}
          </motion.div>
        </AnimatePresence>

        {/* Main scene */}
        <div className="relative flex items-center justify-center gap-0 py-10 px-6">
          {/* Mentor avatar */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-16 h-16 rounded-2xl bg-slate-700 border-2 border-slate-600 flex items-center justify-center shadow-xl relative">
              <span className="text-2xl font-black text-white">מ</span>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                <CheckCircle size={10} className="text-white" />
              </div>
            </div>
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">
              {isRtl ? 'מנטור' : 'Master'}
            </span>
          </div>

          {/* Skill transfer channel */}
          <div className="relative flex-1 flex items-center justify-center mx-2" style={{ height: 64 }}>
            {/* Base line */}
            <div className="absolute w-full h-0.5 bg-slate-700" />

            {/* Flowing particles */}
            {PARTICLES.map(p => (
              <motion.div
                key={p.id}
                className={`absolute rounded-full ${trade.color.replace('text-', 'bg-')}`}
                style={{ width: p.size, height: p.size, top: `calc(50% - ${p.size / 2}px + ${p.x - 20}%` }}
                animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.6, delay: p.delay, repeat: Infinity, ease: 'linear' }}
              />
            ))}

            {/* Central skill icon */}
            <motion.div
              key={trade.label + '-icon'}
              animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut' }}
              className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shadow-xl border ${trade.bg} ${trade.color}`}
            >
              <TradeIcon size={18} />
            </motion.div>
          </div>

          {/* Apprentice avatar */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-xl relative">
              <span className="text-2xl font-black text-white">ח</span>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-slate-900"
              >
                <Lightbulb size={9} className="text-white fill-white" />
              </motion.div>
            </div>
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">
              {isRtl ? 'חניך' : 'Apprentice'}
            </span>
          </div>
        </div>

        {/* Speech bubble */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={msgIdx}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="bg-white/8 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-black text-white">מ</span>
              </div>
              <span className="text-white/80 text-xs font-medium italic">"{messages[msgIdx]}"</span>
            </motion.div>
          </AnimatePresence>
        </div>
    </div>
  );
}

export default function ProductShowcase({ isRtl }: ProductShowcaseProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="px-5 md:px-8 pt-6 pb-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isRtl ? <>ללמוד מקצוע — <span className="text-emerald-600">ישירות מהשטח</span></> : <>Learn a trade — <span className="text-emerald-600">straight from the pros</span></>}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isRtl ? 'SkillLink מחברת מנטורים וחניכים בכל רחבי ישראל' : 'SkillLink connects masters and apprentices across Israel'}
            </p>
          </div>
          <Link
            to="/auth"
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {isRtl ? 'הצטרף' : 'Join free'}
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: steps + mockup */}
          <div className="space-y-4">
            <div className="space-y-2">
              {STEPS.map(({ step, en, he, icon: Icon, color, bg }) => (
                <div key={step} className={`flex items-center gap-3 p-3 rounded-xl border ${bg}`}>
                  <div className={`w-7 h-7 rounded-lg bg-white border ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={13} className={color} />
                  </div>
                  <div>
                    <span className="text-slate-900 text-sm font-semibold">{isRtl ? he.title : en.title}</span>
                    <p className="text-slate-500 text-xs leading-relaxed">{isRtl ? he.desc : en.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <AppMockup isRtl={isRtl} />
          </div>

          {/* Right: looping trade scene */}
          <TradeScene isRtl={isRtl} />
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
        {[
          { value: '100%', label: isRtl ? 'בחינם' : 'Free' },
          { value: '< 5min', label: isRtl ? 'להתחיל' : 'To Start' },
          { value: '4.9★', label: isRtl ? 'דירוג' : 'Rating' },
        ].map(({ value, label }) => (
          <div key={label} className="py-3 text-center">
            <p className="text-slate-900 font-bold text-sm">{value}</p>
            <p className="text-slate-400 text-[10px] mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
