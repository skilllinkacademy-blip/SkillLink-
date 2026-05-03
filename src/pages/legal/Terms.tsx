import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Terms({ isRtl }: { isRtl: boolean }) {
  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
          <ArrowLeft size={18} className="rtl:rotate-180" />
          {isRtl ? 'חזרה לדף הבית' : 'Back to Home'}
        </Link>

        <div className="space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <FileText size={32} />
          </div>
          <h1 className="text-4xl font-black text-black tracking-tight">
            {isRtl ? 'תנאי שימוש' : 'Terms of Service'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isRtl ? 'אנא קרא את תנאי השימוש בעיון לפני השימוש ב-SkillLink.' : 'Please read these terms carefully before using SkillLink.'}
          </p>
        </div>

        <div className="prose prose-emerald max-w-none space-y-8 text-gray-600 font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '1. קבלת התנאים והצהרת המשתמש' : '1. Acceptance of Terms'}</h2>
            <p>
              {isRtl 
                ? 'שימוש באתר SkillLink מותנה בהסכמתך המלאה לתנאים המפורטים להלן. הנך מצהיר כי אתה בן 18 ומעלה, או בעל אישור הורים חוקי לשימוש באתר, וכי כל המידע שמסרת בתהליך ההרשמה הוא נכון ומדויק.'
                : 'Use of SkillLink is contingent on your full agreement to the terms below. You declare you are 18+ or have legal parental consent, and all registration info provided is accurate.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '2. מהות השירות והגבלת אחריות' : '2. Nature of Service & Liability'}</h2>
            <p>
              {isRtl 
                ? 'SkillLink היא פלטפורמת תיווך המחברת בין מנטורים למתלמדים. האתר אינו צד לכל הסכם שייחתם בין המשתמשים ואינו נושא באחריות לטיב ההדרכה, תקינות מקום העבודה, בטיחות המשתמשים או תנאי התשלום ביניהם. האחריות על ביצוע העבודה והדרכתה חלה על המשתמשים בלבד.'
                : 'SkillLink is a brokerage platform connecting mentors and apprentices. The site is not a party to any agreement between users and bears no responsibility for guidance quality, workplace safety, or payment terms. Responsibility lies solely with the users.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '3. קניין רוחני' : '3. Intellectual Property'}</h2>
            <p>
              {isRtl 
                ? 'כל התוכן המופיע באתר, לרבות עיצוב, לוגו, טקסטים, קוד ותמונות, שייך ל-SkillLink ומוגן תחת חוק זכויות יוצרים. אין להעתיק, לשכפל או להפיץ כל חלק מהאתר ללא אישור מראש ובכתב.'
                : 'All content on the site, including design, logo, text, code, and images, belongs to SkillLink and is protected by copyright law. No part of the site may be copied or distributed without prior written consent.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '4. בטיחות וביטוח' : '4. Safety & Insurance'}</h2>
            <p>
              {isRtl 
                ? 'המנטורים והמתלמדים מבינים כי עבודות כפיים ותחומי מלאכה עשויים להיות כרוכים בסיכונים פיזיים. באחריות המשתמשים לוודא כי קיימים אמצעי בטיחות נאותים וביטוחים מתאימים (כגון ביטוח צד ג\', ביטוח תאונות אישיות וכד\') לפני תחילת כל פעילות משותפת.'
                : 'Mentors and apprentices understand that manual labor involves physical risks. It is the users\' responsibility to ensure proper safety measures and appropriate insurance before starting any joint activity.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '5. סמכות שיפוט' : '5. Jurisdiction'}</h2>
            <p>
              {isRtl 
                ? 'על תנאים אלו יחלו דיני מדינת ישראל בלבד. סמכות השיפוט הבלעדית בכל מחלוקת הנוגעת לשימוש באתר תוקנה לבתי המשפט המוסמכים במחוז תל אביב.'
                : 'These terms are governed solely by Israeli law. Exclusive jurisdiction for any dispute regarding the site is granted to the competent courts in the Tel Aviv district.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
