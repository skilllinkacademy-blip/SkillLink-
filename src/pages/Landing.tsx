import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface LandingProps {
  isRtl: boolean;
}

export default function Landing({ isRtl }: LandingProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8 text-center lg:text-start rtl:lg:text-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100">
                <Zap size={16} />
                {isRtl ? 'הפלטפורמה המובילה למקצועות טכניים' : 'The #1 platform for skilled trades'}
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                {isRtl ? (
                  <>ללמוד ישירות מ<span className="text-blue-600">מקצוענים</span></>
                ) : (
                  <>Learn directly from <span className="text-blue-600">real professionals</span></>
                )}
              </h1>
              
              <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {isRtl 
                  ? 'חברו למנטורים מיומנים באינסטלציה, חשמל, נגרות ועוד. התחילו את מסע ההתלמדות שלכם היום.'
                  : 'Connect with skilled mentors in plumbing, electrical, carpentry and more. Start your apprentice journey today.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link 
                  to="/auth?role=mentor" 
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
                >
                  {isRtl ? 'הצטרפות כמנטור' : 'Join as Mentor'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                </Link>
                <Link 
                  to="/auth?role=mentee" 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border-2 border-gray-900 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                  {isRtl ? 'הצטרפות כמתלמד' : 'Join as Apprentice'}
                </Link>
              </div>
              
              <p className="text-sm text-gray-400 font-medium">
                {isRtl ? 'הצטרפות חינם. אין צורך בכרטיס אשראי.' : 'Free to join. No credit card required.'}
              </p>
            </div>

            <div className="flex-1 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1000" 
                  alt="Professional at work"
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden sm:block animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isRtl ? 'מנטורים מאומתים' : 'Verified Mentors'}</p>
                    <p className="text-lg font-black text-gray-900">100% {isRtl ? 'מקצוענות' : 'Professional'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="text-5xl font-black text-gray-900">100+</div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">{isRtl ? 'מנטורים מיומנים' : 'Skilled Mentors'}</p>
            </div>
            <div className="space-y-4">
              <div className="text-5xl font-black text-gray-900">500+</div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">{isRtl ? 'מתלמדים' : 'Apprentices'}</p>
            </div>
            <div className="space-y-4">
              <div className="text-5xl font-black text-gray-900">20+</div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">{isRtl ? 'מקצועות' : 'Trades'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              {isRtl ? 'למה לבחור ב-SkillLink?' : 'Why choose SkillLink?'}
            </h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto">
              {isRtl 
                ? 'אנחנו בונים את הגשר בין הידע המקצועי של הדור הוותיק לבין התשוקה של הדור החדש.'
                : 'We build the bridge between the professional knowledge of the veteran generation and the passion of the new generation.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: isRtl ? 'למידה מעשית' : 'Hands-on Learning',
                desc: isRtl ? 'אל תסתפקו בתיאוריה. צאו לשטח ותלמדו איך הדברים באמת עובדים.' : 'Don\'t settle for theory. Go out to the field and learn how things really work.',
                icon: Zap,
                color: 'bg-blue-50 text-blue-600'
              },
              {
                title: isRtl ? 'רשת מקצועית' : 'Professional Network',
                desc: isRtl ? 'בנו קשרים עם בעלי עסקים ומקצוענים מובילים בתחום שלכם.' : 'Build connections with business owners and leading professionals in your field.',
                icon: Users,
                color: 'bg-emerald-50 text-emerald-600'
              },
              {
                title: isRtl ? 'אימות וביטחון' : 'Verified & Secure',
                desc: isRtl ? 'כל המנטורים עוברים תהליך אימות קפדני כדי להבטיח סביבת למידה בטוחה.' : 'All mentors undergo a rigorous verification process to ensure a safe learning environment.',
                icon: ShieldCheck,
                color: 'bg-purple-50 text-purple-600'
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all group">
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center space-y-4">
          <div className="flex gap-6 text-sm font-bold text-gray-500">
            <Link to="/privacy" className="hover:text-black transition-colors">{isRtl ? 'פרטיות' : 'Privacy'}</Link>
            <Link to="/terms" className="hover:text-black transition-colors">{isRtl ? 'תנאי שימוש' : 'Terms'}</Link>
            <Link to="/contact" className="hover:text-black transition-colors">{isRtl ? 'צור קשר' : 'Contact'}</Link>
          </div>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
            © 2026 SkillLink. {isRtl ? 'כל הזכויות שמורות.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
