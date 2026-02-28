import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'he';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.network': 'Network',
    'nav.jobs': 'Apprenticeships',
    'nav.messaging': 'Messages',
    'nav.notifications': 'Alerts',
    'nav.me': 'Profile',
    'nav.explore': 'Search',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'My Profile',
    'app.title': 'SkillLink',
    'toast.success': 'Success',
    'toast.error': 'Error',
    'toast.applied': 'Request sent successfully!',
    'toast.dispute': 'Report submitted.',
    'toast.log': 'Log updated.',
    'toast.post': 'Update shared!',
    'modal.apply.title': 'Request Apprenticeship',
    'modal.apply.subtitle': 'Send a structured request to the mentor.',
    'modal.apply.cancel': 'Cancel',
    'modal.apply.confirm': 'Send Request',
    'modal.dispute.title': 'Report User',
    'modal.dispute.subtitle': 'Help us keep SkillLink safe.',
    'modal.dispute.reason1': 'Inappropriate behavior',
    'modal.dispute.reason2': 'Safety concern',
    'modal.dispute.reason3': 'Other',
    'modal.dispute.cancel': 'Cancel',
    'modal.dispute.confirm': 'Report',
    'feed.share': 'Share an update',
    'feed.post': 'Post',
    'feed.media': 'Photo',
    'feed.event': 'Project',
    'feed.article': 'Article',
    'nav.settings': 'Settings',
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.darkmode': 'Dark Mode',
    'settings.language': 'Language',
    'settings.subscription': 'Verification',
    'settings.sub.desc': 'Get your verification badge',
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save Changes',
    'cert.title': 'Trade Skills',
    'cert.desc': 'Verified by SkillLink',
    'cert.hours': 'hours',
    'fee.trust': 'Platform Fee',
    'vision.title': 'SkillLink News',
    'vision.subtitle': 'Trade Insights',
    'trades.electrician': 'Electrician',
    'trades.plumber': 'Plumber',
    'trades.barber': 'Barber',
    'trades.mechanic': 'Auto Mechanic',
    'trades.construction': 'Construction',
    'agreement.title': 'Apprenticeship Agreement',
    'agreement.clause1': 'No employer-employee relationship exists.',
    'agreement.clause2': 'Compensation is determined privately between parties.',
    'agreement.clause3': 'SkillLink acts only as an intermediary.',
    'agreement.confirm': 'I confirm and agree to the terms.',
    'landing.hero.title': 'The Future of Trades is Hands-On',
    'landing.hero.subtitle': 'SkillLink connects master tradespeople with the next generation of apprentices. Real work. Real skills. Real trades.',
    'landing.join.apprentice': 'Join as Apprentice',
    'landing.join.mentor': 'Join as Mentor',
    'landing.login': 'Log In',
    'beta.banner': 'SkillLink is currently in closed beta. Early members shape the future.',
    'empty.mentors': 'No mentors available yet in your area.',
    'empty.cta': 'Start building the first verified trade network in your city.',
    'auth.register.title': 'Create your account',
    'auth.login.title': 'Welcome back',
    'auth.role.select': 'Select your role to continue',
    'auth.name': 'Full Name',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.location': 'City / Location',
    'auth.age': 'Age',
    'auth.trade': 'Trade / Specialty',
    'auth.submit.register': 'Create Account',
    'auth.submit.login': 'Log In',
    'auth.switch.login': 'Already have an account? Log in',
    'auth.switch.register': 'New to SkillLink? Join now',
    'auth.verify.title': 'Verify your email',
    'auth.verify.desc': 'We sent a verification link to your email. Please check your inbox.',
    'auth.verify.done': 'I have verified my email',
  },
  he: {
    'nav.home': 'בית',
    'nav.network': 'רשת',
    'nav.jobs': 'התמחויות',
    'nav.messaging': 'הודעות',
    'nav.notifications': 'התראות',
    'nav.me': 'פרופיל',
    'nav.explore': 'חיפוש',
    'nav.dashboard': 'לוח בקרה',
    'nav.profile': 'הפרופיל שלי',
    'app.title': 'SkillLink',
    'toast.success': 'הצלחה',
    'toast.error': 'שגיאה',
    'toast.applied': 'הבקשה נשלחה בהצלחה!',
    'toast.dispute': 'הדיווח הוגש.',
    'toast.log': 'הדיווח עודכן.',
    'toast.post': 'העדכון פורסם!',
    'modal.apply.title': 'בקשת התמחות',
    'modal.apply.subtitle': 'שלח בקשה מובנית למנטור.',
    'modal.apply.cancel': 'ביטול',
    'modal.apply.confirm': 'שלח בקשה',
    'modal.dispute.title': 'דווח על משתמש',
    'modal.dispute.subtitle': 'עזור לנו לשמור על SkillLink בטוחה.',
    'modal.dispute.reason1': 'התנהגות לא הולמת',
    'modal.dispute.reason2': 'חשש בטיחותי',
    'modal.dispute.reason3': 'אחר',
    'modal.dispute.cancel': 'ביטול',
    'modal.dispute.confirm': 'דווח',
    'feed.share': 'שתף עדכון',
    'feed.post': 'פרסם',
    'feed.media': 'תמונה',
    'feed.event': 'פרויקט',
    'feed.article': 'מאמר',
    'nav.settings': 'הגדרות',
    'settings.title': 'הגדרות',
    'settings.appearance': 'מראה',
    'settings.darkmode': 'מצב כהה',
    'settings.language': 'שפה',
    'settings.subscription': 'אימות',
    'settings.sub.desc': 'קבל תג אימות',
    'profile.edit': 'ערוך פרופיל',
    'profile.save': 'שמור שינויים',
    'cert.title': 'מיומנויות מקצועיות',
    'cert.desc': 'מאומת על ידי SkillLink',
    'cert.hours': 'שעות',
    'fee.trust': 'עמלת פלטפורמה',
    'vision.title': 'חדשות SkillLink',
    'vision.subtitle': 'תובנות מקצועיות',
    'trades.electrician': 'חשמלאי',
    'trades.plumber': 'אינסטלטור',
    'trades.barber': 'ספר',
    'trades.mechanic': 'מכונאי רכב',
    'trades.construction': 'בנייה',
    'agreement.title': 'הסכם התמחות',
    'agreement.clause1': 'לא קיימים יחסי עובד-מעביד.',
    'agreement.clause2': 'התגמול נקבע באופן פרטי בין הצדדים.',
    'agreement.clause3': 'SkillLink משמשת כמתווכת בלבד.',
    'agreement.confirm': 'אני מאשר ומסכים לתנאים.',
    'landing.hero.title': 'עתיד המקצועות נמצא בידיים',
    'landing.hero.subtitle': 'SkillLink מחברת בין מנטורים מקצועיים לדור הבא של החניכים. עבודה אמיתית. מיומנויות אמיתיות. מקצועות אמיתיים.',
    'landing.join.apprentice': 'הצטרף כחניך',
    'landing.join.mentor': 'הצטרף כמנטור',
    'landing.login': 'התחברות',
    'beta.banner': 'SkillLink נמצאת כרגע בבטא סגורה. החברים הראשונים מעצבים את העתיד.',
    'empty.mentors': 'אין עדיין מנטורים זמינים באזורך.',
    'empty.cta': 'היה הראשון לבנות את רשת המקצועות המאומתת בעיר שלך.',
    'auth.register.title': 'צור חשבון',
    'auth.login.title': 'ברוך הבא חזרה',
    'auth.role.select': 'בחר את התפקיד שלך כדי להמשיך',
    'auth.name': 'שם מלא',
    'auth.email': 'כתובת אימייל',
    'auth.password': 'סיסמה',
    'auth.location': 'עיר / מיקום',
    'auth.age': 'גיל',
    'auth.trade': 'מקצוע / התמחות',
    'auth.submit.register': 'צור חשבון',
    'auth.submit.login': 'התחבר',
    'auth.switch.login': 'כבר יש לך חשבון? התחבר',
    'auth.switch.register': 'חדש ב-SkillLink? הצטרף עכשיו',
    'auth.verify.title': 'אמת את האימייל שלך',
    'auth.verify.desc': 'שלחנו קישור אימות לאימייל שלך. אנא בדוק את תיבת הדואר הנכנס.',
    'auth.verify.done': 'אימתתי את האימייל שלי',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('he');
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const t = (key: string) => {
    return translations[lang][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
