import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, MapPin, Star, MessageSquare, Zap, ArrowUpRight, Shield, Users, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductShowcaseProps {
  isRtl: boolean;
}

// Replace with your preferred YouTube video ID showing tradespeople/apprentices
const YOUTUBE_VIDEO_ID = 'g9YnSSdSXTI';

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

function VideoSection({ isRtl }: { isRtl: boolean }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-slate-900 rounded-full" />
        <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
          {isRtl ? 'ראה את הקסם בפעולה' : 'See the magic in action'}
        </span>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-xl border border-slate-200">
        {!playing ? (
          <>
            <img
              src={`https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`}
              alt="Video thumbnail"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center group"
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play size={22} className="text-slate-900 fill-slate-900 ml-1" />
              </div>
            </button>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-black text-sm">
                {isRtl ? 'מנטור מקצועי מלמד חניך — יחסי אמון אמיתיים' : 'Real master-apprentice bonds built through work'}
              </p>
            </div>
          </>
        ) : (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="SkillLink — apprenticeship video"
          />
        )}
      </div>
    </div>
  );
}

export default function ProductShowcase({ isRtl }: ProductShowcaseProps) {
  return (
    <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm">
      <div className="px-6 md:px-10 pt-8 pb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-200">
              <Zap size={9} className="fill-current" />
              {isRtl ? 'כך זה עובד' : 'How it works'}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {isRtl
                ? <><span className="text-emerald-600">ללמוד מקצוע</span> — ישירות מהשטח</>
                : <><span className="text-emerald-600">Learning a trade</span> — straight from the pros</>}
            </h2>
          </div>
          <Link
            to="/auth"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg"
          >
            {isRtl ? 'הצטרף בחינם' : 'Join Free'}
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: steps + mockup */}
          <div className="space-y-6">
            <div className="space-y-2.5">
              {STEPS.map(({ step, en, he, icon: Icon, color, bg }) => (
                <div key={step} className={`flex items-start gap-3 p-3.5 rounded-2xl border ${bg}`}>
                  <div className={`w-8 h-8 rounded-xl bg-white border ${bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon size={14} className={color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[9px] font-black ${color} uppercase tracking-widest`}>{step}</span>
                      <span className="text-slate-900 text-xs font-black">{isRtl ? he.title : en.title}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{isRtl ? he.desc : en.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <AppMockup isRtl={isRtl} />
          </div>

          {/* Right: video */}
          <VideoSection isRtl={isRtl} />
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="border-t border-slate-200 grid grid-cols-3 divide-x divide-slate-200 bg-white">
        {[
          { value: '100%', label: isRtl ? 'בחינם לחלוטין' : 'Completely Free' },
          { value: '< 5min', label: isRtl ? 'להתחיל' : 'To Get Started' },
          { value: '4.9★', label: isRtl ? 'דירוג ממוצע' : 'Avg. Rating' },
        ].map(({ value, label }) => (
          <div key={label} className="py-4 px-4 text-center">
            <p className="text-slate-900 font-black text-lg">{value}</p>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
