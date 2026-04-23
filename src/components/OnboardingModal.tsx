import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, GraduationCap, Presentation, Search, MessageCircle,
  CheckCircle2, ArrowRight, X, Zap, Users, Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingModalProps {
  isRtl: boolean;
}

const ONBOARDING_KEY = 'skilllink_onboarding_done';

export default function OnboardingModal({ isRtl }: OnboardingModalProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;
    const done = localStorage.getItem(`${ONBOARDING_KEY}_${user.id}`);
    if (!done) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);

  const dismiss = () => {
    if (user) {
      localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
    }
    setVisible(false);
  };

  const isMentor = profile?.role === 'mentor';

  const steps = isMentor ? [
    {
      icon: Presentation,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      title: isRtl ? 'ברוכים הבאים, מנטור!' : 'Welcome, Mentor!',
      desc: isRtl
        ? 'אתה עכשיו חלק מהקהילה שמכשירה את דור העתיד של בעלי המקצוע בישראל.'
        : "You're now part of the community training Israel's next generation of tradespeople.",
      action: null,
    },
    {
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      title: isRtl ? 'פרסם הזדמנות' : 'Post an Opportunity',
      desc: isRtl
        ? 'ספר לצעירים מה אתה מלמד, מה הם ילמדו, ומה אתה מחפש. זה לוקח 2 דקות.'
        : "Tell apprentices what you teach, what they'll learn, and what you're looking for. Takes 2 minutes.",
      action: { label: isRtl ? 'פרסם עכשיו' : 'Post Now', path: '/app/opportunities/new' },
    },
    {
      icon: Wrench,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      title: isRtl ? 'השלם את הפרופיל שלך' : 'Complete Your Profile',
      desc: isRtl
        ? 'פרופיל מלא עם תמונה ותיאור מקבל 3x יותר פניות. קח 3 דקות להשלים אותו.'
        : 'A complete profile with photo & bio gets 3x more inquiries. Take 3 minutes to finish it.',
      action: { label: isRtl ? 'ערוך פרופיל' : 'Edit Profile', path: '/app/profile' },
    },
  ] : [
    {
      icon: GraduationCap,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      title: isRtl ? 'ברוכים הבאים, מתלמד!' : 'Welcome, Apprentice!',
      desc: isRtl
        ? 'אתה עכשיו בדרך ללמוד מקצוע אמיתי ישירות מהשטח. בוא נתחיל!'
        : "You're on the path to learning a real trade straight from the field. Let's get started!",
      action: null,
    },
    {
      icon: Search,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      title: isRtl ? 'חפש מנטור' : 'Find a Mentor',
      desc: isRtl
        ? 'עיין בהזדמנויות של מנטורים קרובים אליך לפי מיקום, מקצוע וזמינות.'
        : 'Browse mentor opportunities near you by location, trade, and availability.',
      action: { label: isRtl ? 'גלה הזדמנויות' : 'Explore Opportunities', path: '/app/opportunities' },
    },
    {
      icon: MessageCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      title: isRtl ? 'שלח הודעה' : 'Send a Message',
      desc: isRtl
        ? 'מצאת מנטור שמתאים? לחץ "שלח הודעה" בפרופיל שלו ותתחיל שיחה. ישירה, מהירה, אפקטיבית.'
        : 'Found a mentor you like? Hit "Send Message" on their profile and start a conversation.',
      action: { label: isRtl ? 'חפש מנטורים' : 'Find Mentors', path: '/app/search' },
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500" />

            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === step ? 'w-6 bg-blue-600' : i < step ? 'w-3 bg-emerald-500' : 'w-3 bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={dismiss}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className={`w-16 h-16 ${currentStep.bg} rounded-2xl flex items-center justify-center`}>
                    <currentStep.icon size={32} className={currentStep.color} />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{currentStep.title}</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">{currentStep.desc}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bonus tip on last step */}
              {isLast && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <Star size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-amber-700 leading-relaxed">
                    {isRtl
                      ? 'טיפ: פרופיל מלא עם תמונה ותיאור ברור מכפיל את הסיכוי שלך לקבל ענייה!'
                      : 'Tip: A complete profile with a photo doubles your chance of getting a response!'}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {currentStep.action && (
                  <button
                    onClick={() => {
                      dismiss();
                      navigate(currentStep.action!.path);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <Zap size={15} />
                    {currentStep.action.label}
                  </button>
                )}

                {isLast ? (
                  <button
                    onClick={dismiss}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                  >
                    <CheckCircle2 size={15} />
                    {isRtl ? 'הבנתי!' : "Got it!"}
                  </button>
                ) : (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    className={`${currentStep.action ? 'px-5' : 'flex-1'} flex items-center justify-center gap-2 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95`}
                  >
                    {isRtl ? 'הבא' : 'Next'}
                    <ArrowRight size={15} className="rtl:rotate-180" />
                  </button>
                )}
              </div>

              <p className="text-center text-xs text-gray-300 font-medium">
                {isRtl ? 'SkillLink · חינם לחלוטין, לתמיד' : 'SkillLink · 100% free, forever'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
