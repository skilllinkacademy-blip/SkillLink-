import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Zap, ArrowRight, Award, Briefcase, GraduationCap, Star, CheckCircle2, ChevronDown, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { barberShop, apprenticeImg, mentorImg, generalImg, electricalImg, weldingImg, mechanicImg, plumbingImg, constructionImg } from '../lib/assets';

interface LandingProps {
  isRtl: boolean;
}

const TRADES = [
  { label: { he: 'חשמל', en: 'Electrical' }, img: electricalImg },
  { label: { he: 'ריתוך', en: 'Welding' }, img: weldingImg },
  { label: { he: 'מכונאות', en: 'Mechanics' }, img: mechanicImg },
  { label: { he: 'אינסטלציה', en: 'Plumbing' }, img: plumbingImg },
  { label: { he: 'בנייה', en: 'Construction' }, img: constructionImg },
  { label: { he: 'עיצוב שיער', en: 'Hair Styling' }, img: barberShop },
];

const STEPS = [
  {
    n: '01',
    icon: GraduationCap,
    title: { he: 'צור פרופיל', en: 'Create your profile' },
    desc: { he: 'הגדר את הכישורים שלך, המיקום, וסוג ההזדמנות שאתה מחפש.', en: 'Define your skills, location, and the type of opportunity you are looking for.' },
  },
  {
    n: '02',
    icon: Zap,
    title: { he: 'גלה ידע מ-AI', en: 'AI-powered matching' },
    desc: { he: 'המערכת שלנו מוצאת את ההתאמה הטובה ביותר עבורך לפי מיקום, מקצוע ורמת ניסיון.', en: 'Our system finds the best match for you based on location, trade, and experience level.' },
  },
  {
    n: '03',
    icon: Briefcase,
    title: { he: 'התחל ולמד בשטח', en: 'Start learning in the field' },
    desc: { he: 'צא לשטח, צבור ניסיון מעשי אמיתי תחת הנחייתו של מקצוען מנוסה.', en: 'Go out to the field, gain real hands-on experience under the guidance of an experienced professional.' },
  },
];

const FEATURES = [
  { icon: ShieldCheck, color: 'text-blue-600 bg-blue-50', title: { he: 'מנטורים מאומתים', en: 'Verified Mentors' }, desc: { he: 'כל מנטור עובר תהליך אימות מקיף לפני שמתחיל לדרכו.', en: 'Every mentor goes through a thorough verification process before getting started.' } },
  { icon: Zap, color: 'text-amber-600 bg-amber-50', title: { he: 'התאמה חכמה', en: 'Smart Matching' }, desc: { he: 'אלגוריתם AI מחבר ביניכם בהתבסס על עשרות פרמטרים.', en: 'An AI algorithm connects you based on dozens of parameters.' } },
  { icon: Users, color: 'text-emerald-600 bg-emerald-50', title: { he: 'קהילה פעילה', en: 'Active Community' }, desc: { he: 'הצטרפו לרשת של מקצוענים שעוזרים אחד לשני לצמוח.', en: 'Join a network of professionals who help each other grow.' } },
  { icon: Award, color: 'text-purple-600 bg-purple-50', title: { he: 'הכרה מקצועית', en: 'Professional Recognition' }, desc: { he: 'בנו פרופיל מוניטין שפותח דלתות בתעשייה.', en: 'Build a reputation profile that opens doors in the industry.' } },
];

export default function Landing({ isRtl }: LandingProps) {
  const [counts, setCounts] = useState({ mentors: 0, mentees: 0, total: 0 });
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
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

  return (
    <div className="min-h-screen bg-white" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left copy */}
            <div className={`flex-1 space-y-8 text-center lg:text-start transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-slate-300 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isRtl ? 'פלטפורמה חיה · בטא פעילה' : 'Live Platform · Active Beta'}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
                {isRtl ? (
                  <>ללמוד מקצוע<br /><span className="text-blue-400">ישירות בשטח</span></>
                ) : (
                  <>Learn a trade<br /><span className="text-blue-400">directly in the field</span></>
                )}
              </h1>

              <p className="text-slate-400 text-base sm:text-lg font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {isRtl
                  ? 'SkillLink מחברת מנטורים מנוסים עם חניכים מוטיבציוניים במגוון מקצועות טכניים. מצאו זה את זה, תפתחו יחד.'
                  : 'SkillLink connects experienced mentors with motivated apprentices across a wide range of trades. Find each other, grow together.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/auth?mode=signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                >
                  {isRtl ? 'הצטרפות חינם' : 'Join for Free'}
                  <ArrowRight size={16} className="rtl:rotate-180" />
                </Link>
                <Link
                  to="/app/opportunities"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/8 hover:bg-white/15 border border-white/10 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                  {isRtl ? 'עיון בהזדמנויות' : 'Browse Opportunities'}
                </Link>
              </div>

              {/* Social proof row */}
              <div className="flex items-center gap-4 justify-center lg:justify-start pt-2">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {[mentorImg, barberShop, electricalImg, generalImg].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-slate-900 object-cover" />
                  ))}
                </div>
                <div className="text-sm text-slate-400">
                  <span className="font-bold text-white">{counts.total}+</span>{' '}
                  {isRtl ? 'מקצוענים בפלטפורמה' : 'professionals on the platform'}
                </div>
              </div>
            </div>

            {/* Right image collage */}
            <div className={`flex-1 w-full max-w-lg lg:max-w-none transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-3 sm:space-y-4 pt-6">
                  <img src={mentorImg} alt="" className="w-full aspect-[4/3] object-cover rounded-2xl" />
                  <img src={weldingImg} alt="" className="w-full aspect-square object-cover rounded-2xl" />
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <img src={barberShop} alt="" className="w-full aspect-square object-cover rounded-2xl" />
                  <img src={electricalImg} alt="" className="w-full aspect-[4/3] object-cover rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8">
          <ChevronDown size={20} className="text-slate-600 animate-bounce" />
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { n: `${counts.mentors || '120'}+`, label: { he: 'מנטורים פעילים', en: 'Active Mentors' } },
              { n: `${counts.mentees || '380'}+`, label: { he: 'חניכים רשומים', en: 'Registered Apprentices' } },
              { n: '15+', label: { he: 'מקצועות', en: 'Trades' } },
              { n: '100%', label: { he: 'חינם להצטרפות', en: 'Free to Join' } },
            ].map((s, i) => (
              <div key={i} className="space-y-1">
                <p className="text-3xl font-black text-slate-900 tracking-tight">{s.n}</p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{isRtl ? s.label.he : s.label.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">{isRtl ? 'תהליך פשוט' : 'Simple Process'}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'איך זה עובד?' : 'How does it work?'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {STEPS.map((step, i) => (
              <div key={i} className="relative flex flex-col items-start gap-5 p-6 sm:p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <step.icon size={22} />
                  </div>
                  <span className="text-4xl font-black text-slate-100 group-hover:text-slate-200 transition-colors">{step.n}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">{isRtl ? step.title.he : step.title.en}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{isRtl ? step.desc.he : step.desc.en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRADES GRID ───────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <p className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">{isRtl ? 'מגוון מקצועות' : 'Trade Categories'}</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                {isRtl ? 'כל המקצועות, מקום אחד' : 'All trades, one place'}
              </h2>
            </div>
            <Link
              to="/app/opportunities"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-sm font-semibold transition-all"
            >
              {isRtl ? 'כל ההזדמנויות' : 'All opportunities'}
              <ArrowRight size={15} className="rtl:rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {TRADES.map((trade, i) => (
              <Link
                key={i}
                to="/app/opportunities"
                className="group relative aspect-video overflow-hidden rounded-2xl cursor-pointer"
              >
                <img
                  src={trade.img}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-sm sm:text-base">{isRtl ? trade.label.he : trade.label.en}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">{isRtl ? 'למה SkillLink?' : 'Why SkillLink?'}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'הפלטפורמה שנבנתה בשביל המקצוענים' : 'Built for the trades'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all space-y-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.color}`}>
                  <f.icon size={22} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900">{isRtl ? f.title.he : f.title.en}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{isRtl ? f.desc.he : f.desc.en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLIT SECTION (mentor/mentee) ─────────────── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Mentor card */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between gap-8 min-h-[340px]">
              <img src={mentorImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest">
                  <Briefcase size={12} />
                  {isRtl ? 'למנטורים' : 'For Mentors'}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {isRtl ? 'העבר ידע.\nקבל עזרה.' : 'Share knowledge.\nGet help.'}
                </h3>
                <ul className="space-y-2">
                  {(isRtl
                    ? ['פרסם הזדמנות בחינם', 'קבל עזרה מחניכים מוטיבציוניים', 'אמת את החשבון שלך וקבל פי 5 יותר פניות']
                    : ['Post an opportunity for free', 'Get help from motivated apprentices', 'Verify your account and get 5x more responses']
                  ).map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/auth?mode=signup"
                className="relative inline-flex items-center gap-2 w-fit px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95"
              >
                {isRtl ? 'הצטרף כמנטור' : 'Join as Mentor'}
                <ArrowRight size={15} className="rtl:rotate-180" />
              </Link>
            </div>

            {/* Apprentice card */}
            <div className="relative overflow-hidden rounded-3xl bg-blue-600 text-white p-8 sm:p-10 flex flex-col justify-between gap-8 min-h-[340px]">
              <img src={apprenticeImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-widest">
                  <GraduationCap size={12} />
                  {isRtl ? 'לחניכים' : 'For Apprentices'}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {isRtl ? 'למד מהטובים.\nהתחל להרוויח.' : 'Learn from the best.\nStart earning.'}
                </h3>
                <ul className="space-y-2">
                  {(isRtl
                    ? ['גלה מנטורים לפי מיקום ומקצוע', 'ראה ציון התאמה AI לפני שאתה פונה', 'קבל ניסיון מעשי ושכר']
                    : ['Find mentors by location and trade', 'See an AI match score before you apply', 'Get hands-on experience and pay']
                  ).map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-blue-100">
                      <CheckCircle2 size={14} className="text-white shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/auth?mode=signup"
                className="relative inline-flex items-center gap-2 w-fit px-6 py-3 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all active:scale-95"
              >
                {isRtl ? 'הצטרף כחניך' : 'Join as Apprentice'}
                <ArrowRight size={15} className="rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {isRtl ? 'מוכן לבנות\nאת הקריירה שלך?' : 'Ready to build\nyour career?'}
          </h2>
          <p className="text-slate-500 text-base sm:text-lg font-medium max-w-xl mx-auto">
            {isRtl
              ? 'הצטרפו לפלטפורמה שבה מנטורים וחניכים פוגשים זה את זה ובונים קשרים מקצועיים שנמשכים שנים.'
              : 'Join the platform where mentors and apprentices meet and build professional relationships that last for years.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-xl active:scale-95"
            >
              {isRtl ? 'התחל בחינם' : 'Get Started Free'}
              <ArrowRight size={16} className="rtl:rotate-180" />
            </Link>
            <Link
              to="/app/opportunities"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-bold text-sm hover:border-slate-300 transition-all active:scale-95"
            >
              {isRtl ? 'עיון ללא הרשמה' : 'Browse without signing up'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="bg-slate-950 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-3">
              <div className="text-2xl font-black tracking-tighter">
                SkillLink<span className="text-blue-400">.</span>
              </div>
              <p className="text-slate-400 text-sm max-w-xs">
                {isRtl ? 'הבית של המקצוענים החדשים בישראל.' : 'The home of the next generation of tradespeople in Israel.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm font-semibold text-slate-400">
              <Link to="/about" className="hover:text-white transition-colors">{isRtl ? 'אודות' : 'About'}</Link>
              <Link to="/contact" className="hover:text-white transition-colors">{isRtl ? 'צור קשר' : 'Contact'}</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">{isRtl ? 'פרטיות' : 'Privacy'}</Link>
              <Link to="/terms" className="hover:text-white transition-colors">{isRtl ? 'תנאים' : 'Terms'}</Link>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <p>© 2026 SkillLink. {isRtl ? 'כל הזכויות שמורות.' : 'All rights reserved.'}</p>
            <p className="uppercase tracking-widest">{isRtl ? 'נבנה עם ❤️ בישראל' : 'Built with ❤️ in Israel'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
