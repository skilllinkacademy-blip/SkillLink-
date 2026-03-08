import React, { useState, useEffect } from 'react';
import { MapPin, Zap, Users, Briefcase, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RadarMapProps {
  isRtl: boolean;
  opportunities: any[];
}

export default function RadarMap({ isRtl, opportunities }: RadarMapProps) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Mock "Live" projects for the radar effect
  const liveProjects = opportunities.slice(0, 5).map((opp, i) => ({
    ...opp,
    x: 20 + Math.random() * 60,
    y: 20 + Math.random() * 60,
    delay: i * 0.5
  }));

  return (
    <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden border border-slate-800">
      {/* Radar Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border border-slate-800 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-slate-800 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] border border-slate-800 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] border border-slate-800 rounded-full" />
        
        {/* Radar Sweep */}
        <div 
          className="absolute top-1/2 left-1/2 w-full h-full origin-top-left bg-gradient-to-tr from-emerald-500/10 to-transparent"
          style={{ 
            transform: `rotate(${pulse * 3.6}deg)`,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="space-y-6 text-center lg:text-start max-w-md">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/10">
            <Zap size={12} className="animate-pulse fill-current" />
            {isRtl ? 'רדאר פרויקטים חי' : 'Live Project Radar'}
          </div>
          <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
            {isRtl ? 'ראה מה קורה סביבך עכשיו' : 'See what\'s happening around you'}
          </h2>
          <p className="text-slate-400 font-medium text-lg leading-relaxed">
            {isRtl 
              ? 'מנטורים ומתלמדים פעילים בזמן אמת. הצטרף לפרויקט שקורה ברגע זה בקהילה המקצועית.' 
              : 'Masters and apprentices active in real-time. Join a project happening right now in the professional community.'}
          </p>
          <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
            <div className="flex items-center gap-3 text-white">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-sm font-black uppercase tracking-widest">12 {isRtl ? 'מנטורים בשטח' : 'Masters on-site'}</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-pulse" />
              <span className="text-sm font-black uppercase tracking-widest">8 {isRtl ? 'מתלמדים פעילים' : 'Active apprentices'}</span>
            </div>
          </div>
        </div>

        {/* Radar Visualization */}
        <div className="relative w-72 h-72 md:w-96 md:h-96 bg-slate-950/50 rounded-full border border-slate-800 backdrop-blur-md overflow-hidden shadow-inner">
          <AnimatePresence>
            {liveProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 0.8],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: project.delay,
                  repeatDelay: 3
                }}
                className="absolute"
                style={{ left: `${project.x}%`, top: `${project.y}%` }}
              >
                <div className="relative group">
                  <div className={`w-5 h-5 rounded-full shadow-2xl border-2 border-white/20 ${project.type === 'mentor_offer' ? 'bg-white' : 'bg-emerald-500'}`} />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-20 scale-90 group-hover:scale-100">
                    <div className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-2xl border border-slate-800 uppercase tracking-widest">
                      {project.title}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Center Point (User) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-emerald-500/20">
              <MapPin size={14} className="text-emerald-600" />
            </div>
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
