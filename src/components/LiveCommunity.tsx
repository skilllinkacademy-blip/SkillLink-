import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Users, Briefcase, Star, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface LiveCommunityProps {
  isRtl: boolean;
}

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (target === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatCard({ value, label, icon: Icon, accent }: { value: number; label: string; icon: any; accent: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-black text-white tabular-nums">{count}+</p>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function LiveCommunity({ isRtl }: LiveCommunityProps) {
  const [stats, setStats] = useState({ mentors: 0, apprentices: 0, opportunities: 0 });
  const [recentOpps, setRecentOpps] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ count: mentorCount }, { count: menteeCount }, { count: oppCount }, { data: opps }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentor'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentee'),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase
          .from('opportunities')
          .select('id, title, trade, location, type, profiles(full_name, avatar_url)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);
      setStats({
        mentors: mentorCount || 0,
        apprentices: menteeCount || 0,
        opportunities: oppCount || 0,
      });
      setRecentOpps(opps || []);
    };
    load();
  }, []);

  const tradeColors: Record<string, string> = {
    plumbing: 'bg-blue-500/20 text-blue-300',
    electricity: 'bg-yellow-500/20 text-yellow-300',
    carpentry: 'bg-amber-500/20 text-amber-300',
    welding: 'bg-orange-500/20 text-orange-300',
    painting: 'bg-purple-500/20 text-purple-300',
    tiling: 'bg-cyan-500/20 text-cyan-300',
    default: 'bg-emerald-500/20 text-emerald-300',
  };

  const getTradeColor = (trade: string) =>
    tradeColors[trade?.toLowerCase()] ?? tradeColors.default;

  return (
    <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

        {/* LEFT — headline + stats */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
            <Zap size={11} className="fill-current animate-pulse" />
            {isRtl ? 'הקהילה שלנו בזמן אמת' : 'Community — Live Stats'}
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight">
              {isRtl
                ? <>בני אדם אמיתיים.<br /><span className="text-emerald-400">מקצועות אמיתיים.</span></>
                : <>Real people.<br /><span className="text-emerald-400">Real trades.</span></>}
            </h2>
            <p className="text-slate-400 font-medium text-base leading-relaxed max-w-sm">
              {isRtl
                ? 'SkillLink מחברת בין אומנים מקצועיים לחניכים שרוצים ללמוד מהשטח — לא מסרטוני YouTube.'
                : 'SkillLink connects skilled tradespeople with apprentices who want to learn on the job — not from YouTube.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              value={stats.mentors}
              label={isRtl ? 'מנטורים' : 'Mentors'}
              icon={Star}
              accent="bg-emerald-500/20 text-emerald-400"
            />
            <StatCard
              value={stats.apprentices}
              label={isRtl ? 'חניכים' : 'Apprentices'}
              icon={Users}
              accent="bg-blue-500/20 text-blue-400"
            />
            <StatCard
              value={stats.opportunities}
              label={isRtl ? 'הזדמנויות' : 'Opportunities'}
              icon={Briefcase}
              accent="bg-purple-500/20 text-purple-400"
            />
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-xl"
          >
            {isRtl ? 'גלה הזדמנויות' : 'Explore Opportunities'}
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* RIGHT — live opportunity feed */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            {isRtl ? 'הזדמנויות אחרונות' : 'Latest Opportunities'}
          </p>
          {recentOpps.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
              ))
            : recentOpps.map((opp, i) => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  <Link
                    to={`/opportunities/${opp.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15 transition-all group"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-slate-700 flex-shrink-0 overflow-hidden">
                      {opp.profiles?.avatar_url
                        ? <img src={opp.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-black">
                            {opp.profiles?.full_name?.[0] ?? '?'}
                          </div>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-black truncate leading-tight">{opp.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 truncate">{opp.location}</p>
                    </div>

                    {opp.trade && (
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${getTradeColor(opp.trade)}`}>
                        {opp.trade}
                      </span>
                    )}

                    <ArrowUpRight size={14} className="text-slate-600 group-hover:text-white transition-colors flex-shrink-0" />
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </div>
  );
}
