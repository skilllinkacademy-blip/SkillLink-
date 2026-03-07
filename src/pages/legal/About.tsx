import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Target, Zap, Heart } from 'lucide-react';

export default function About({ isRtl }: { isRtl: boolean }) {
  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-5xl mx-auto space-y-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
          <ArrowLeft size={18} className="rtl:rotate-180" />
          {isRtl ? 'חזרה לדף הבית' : 'Back to Home'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-black text-black tracking-tight leading-tight">
                {isRtl ? 'הסיפור של SkillLink' : 'The SkillLink Story'}
              </h1>
              <p className="text-xl text-gray-500 font-medium leading-relaxed">
                {isRtl 
                  ? 'אנחנו בונים את הגשר בין הידע המקצועי של המנטורים לבין התשוקה של הדור הבא.' 
                  : 'We are building the bridge between the professional knowledge of mentors and the passion of the next generation.'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="text-3xl font-black text-black mb-1">100%</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'מקצועיות' : 'Professionalism'}</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="text-3xl font-black text-black mb-1">24/7</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'תמיכה' : 'Support'}</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-3 -z-10 opacity-10 blur-2xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
              alt="Team" 
              className="rounded-[3rem] shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Target size={28} />
            </div>
            <h3 className="text-xl font-black text-black">{isRtl ? 'המשימה שלנו' : 'Our Mission'}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              {isRtl 
                ? 'להנגיש את עולם המקצועות הטכניים והמעשיים לכל מי שרוצה ללמוד ולהתפתח.' 
                : 'To make the world of technical and practical trades accessible to everyone who wants to learn and grow.'}
            </p>
          </div>

          <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-black text-black">{isRtl ? 'הערכים שלנו' : 'Our Values'}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              {isRtl 
                ? 'יושרה, מקצועיות, וקהילה תומכת הם הלב של כל מה שאנחנו עושים.' 
                : 'Integrity, professionalism, and a supportive community are at the heart of everything we do.'}
            </p>
          </div>

          <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-black text-black">{isRtl ? 'הקהילה שלנו' : 'Our Community'}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              {isRtl 
                ? 'אלפי מנטורים ומתלמדים שכבר מצאו את הדרך שלהם להצלחה.' 
                : 'Thousands of mentors and apprentices who have already found their path to success.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
