import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export default function Privacy({ isRtl }: { isRtl: boolean }) {
  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
          <ArrowLeft size={18} className="rtl:rotate-180" />
          {isRtl ? 'חזרה לדף הבית' : 'Back to Home'}
        </Link>

        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl font-black text-black tracking-tight">
            {isRtl ? 'מדיניות פרטיות' : 'Privacy Policy'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isRtl ? 'הפרטיות שלך חשובה לנו ב-SkillLink.' : 'Your privacy is important to us at SkillLink.'}
          </p>
        </div>

        <div className="prose prose-blue max-w-none space-y-8 text-gray-600 font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '1. סוגי המידע הנאספים' : '1. Information Collection'}</h2>
            <p>
              {isRtl 
                ? 'אנו אוספים מידע אישי מזהה הכולל שם מלא, כתובת דוא"ל, מספר טלפון, ומידע מקצועי שאתה בוחר לשתף בפרופיל שלך. בנוסף, אנו אוספים מידע טכני כגון כתובת IP, סוג דפדפן ונתוני שימוש לצרכי אבטחה ושיפור השירות.'
                : 'We collect personally identifiable information including full name, email address, phone number, and professional info you choose to share. Additionally, we collect technical data like IP addresses and usage data for security and service improvement.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '2. המטרה שלשמה נאסף המידע' : '2. Purpose of Collection'}</h2>
            <p>
              {isRtl 
                ? 'המידע משמש לחיבור בין מנטורים למתלמדים, ניהול התקשורת בתוך הפלטפורמה, אימות זהות המשתמשים, ומניעת שימוש לרעה או הונאה. אנו גם משתמשים במידע כדי לעדכן אותך בהזדמנויות רלוונטיות לפי העדפותיך.'
                : 'Information is used to connect mentors and apprentices, manage internal communication, verify user identity, and prevent abuse or fraud. We also use it to update you on relevant opportunities based on your preferences.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '3. שיתוף מידע עם צדדים שלישיים' : '3. Third-Party Sharing'}</h2>
            <p>
              {isRtl 
                ? 'SkillLink אינה מוכרת או משכירה את המידע האישי שלך. מידע ישותף רק במקרים של: (א) הסכמה מפורשת שלך, (ב) דרישה חוקית ע"י רשויות המדינה, (ג) הגנה על זכויותיו המשפטיות של האתר במקרה של מחלוקת משפטית.'
                : 'SkillLink does not sell or rent your personal information. Info is shared only if: (a) explicit consent, (b) legal requirement by authorities, (c) protecting legal rights in case of a dispute.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '4. אבטחת מידע ושימורו' : '4. Data Security'}</h2>
            <p>
              {isRtl 
                ? 'אנו מיישמים אמצעי אבטחה טכנולוגיים וארגוניים מתקדמים להגנה על המידע שלך. המידע נשמר על שרתי ענן מאובטחים. עם זאת, אין אבטחה מוחלטת באינטרנט והנך מאשר כי אתה מוסר את המידע מרצונך.'
                : 'We implement advanced technological and organizational security measures. Data is stored on secure cloud servers. However, no internet security is absolute, and you acknowledge providing data voluntarily.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '5. זכות העיון ומחיקת המידע' : '5. Your Rights'}</h2>
            <p>
              {isRtl 
                ? 'על פי חוק הגנת הפרטיות, התשמ"א-1981, הנך זכאי לעיין במידע השמור עליך, לבקש את תיקונו או מחיקתו. ניתן לעשות זאת באמצעות הגדרות החשבון או בפנייה לצוות התמיכה שלנו.'
                : 'According to the Privacy Protection Law, you are entitled to review your saved info, request correction or deletion via account settings or support.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
