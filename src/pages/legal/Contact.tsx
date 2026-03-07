import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react';

export default function Contact({ isRtl }: { isRtl: boolean }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-5xl mx-auto space-y-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
          <ArrowLeft size={18} className="rtl:rotate-180" />
          {isRtl ? 'חזרה לדף הבית' : 'Back to Home'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-black text-black tracking-tight leading-tight">
                {isRtl ? 'צור קשר' : 'Get in Touch'}
              </h1>
              <p className="text-xl text-gray-500 font-medium leading-relaxed">
                {isRtl 
                  ? 'יש לך שאלות? אנחנו כאן כדי לעזור לך לבנות את הקריירה שלך.' 
                  : 'Have questions? We are here to help you build your career.'}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isRtl ? 'אימייל' : 'Email'}</p>
                  <p className="text-lg font-black text-black">skilllink.academy@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isRtl ? 'מיקום' : 'Location'}</p>
                  <p className="text-lg font-black text-black">{isRtl ? 'ישראל' : 'Israel'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl -z-10"></div>
            
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-50">
                  <CheckCircle size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-black">{isRtl ? 'ההודעה נשלחה!' : 'Message Sent!'}</h2>
                  <p className="text-gray-500 font-medium">{isRtl ? 'נחזור אליך בהקדם האפשרי.' : 'We will get back to you as soon as possible.'}</p>
                </div>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  {isRtl ? 'שלח הודעה נוספת' : 'Send another message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'שם מלא' : 'Full Name'}</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none"
                    placeholder={isRtl ? 'הכנס את שמך...' : 'Enter your name...'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'אימייל' : 'Email Address'}</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none"
                    placeholder={isRtl ? 'your@email.com' : 'your@email.com'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isRtl ? 'הודעה' : 'Message'}</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none resize-none"
                    placeholder={isRtl ? 'איך נוכל לעזור?' : 'How can we help?'}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isRtl ? 'שלח הודעה' : 'Send Message'}
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
