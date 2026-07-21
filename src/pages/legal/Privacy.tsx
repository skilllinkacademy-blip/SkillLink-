import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

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
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            {isRtl ? 'עודכן לאחרונה: 20 ביולי 2026' : 'Last updated: July 20, 2026'}
          </p>
        </div>

        <div className="prose prose-blue max-w-none space-y-8 text-gray-600 font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '1. מי אנחנו (בעל השליטה במידע)' : '1. Who We Are (Data Controller)'}</h2>
            <p>
              {isRtl
                ? 'SkillLink ("אנחנו") היא הגורם האחראי (Data Controller) לעיבוד המידע האישי שנאסף בפלטפורמה. פרטי הישות המשפטית וכתובתה יעודכנו עם השלמת רישום הישות. לכל פנייה בנושא פרטיות ניתן ליצור קשר בדוא"ל: skilllink.academy@gmail.com. מדיניות זו חלה על כל המשתמשים, ומפרטת כיצד אנו אוספים, משתמשים, משתפים ומגנים על המידע שלך.'
                : 'SkillLink ("we", "us") is the Data Controller responsible for processing personal data collected on the Platform. The legal entity details and address will be updated upon completion of entity registration. For any privacy matter, contact us at: skilllink.academy@gmail.com. This policy applies to all users and explains how we collect, use, share, and protect your data.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '2. איזה מידע אנו אוספים' : '2. Information We Collect'}</h2>
            <p>
              {isRtl
                ? 'מידע שאתה מוסר: שם מלא, כתובת דוא"ל, מספר טלפון, עיר, מקצוע, ניסיון, ביו, תמונות פרופיל ותיק עבודות, והודעות שאתה שולח. מידע לאימות מנטורים: מסמך מזהה (נשמר באחסון מוגן). מידע שנאסף אוטומטית: כתובת IP, סוג דפדפן ומכשיר, ונתוני שימוש בסיסיים לצרכי אבטחה ותפעול. איננו אוספים מידע רגיש שאינו נדרש לשירות.'
                : 'Information you provide: full name, email, phone, city, occupation, experience, bio, profile photos and portfolio, and messages you send. Mentor verification data: an ID document (stored in protected storage). Automatically collected: IP address, browser and device type, and basic usage data for security and operations. We do not collect sensitive data not required for the Service.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '3. הבסיס החוקי לעיבוד (GDPR)' : '3. Legal Basis for Processing (GDPR)'}</h2>
            <p>
              {isRtl
                ? 'עבור משתמשים באזור הכלכלי האירופי (EEA) ובבריטניה, אנו מעבדים מידע על בסיס: (א) ביצוע חוזה — כדי לספק את שירותי החיבור; (ב) הסכמתך — למשל לדיוור או לעיבוד מידע לא-חיוני, אותה ניתן לבטל בכל עת; (ג) אינטרס לגיטימי — לאבטחת הפלטפורמה, מניעת הונאה ושיפור השירות; (ד) חובה חוקית — כאשר נדרש על פי דין.'
                : 'For users in the European Economic Area (EEA) and the UK, we process data on the basis of: (a) contract performance — to provide the Connection Services; (b) your consent — e.g., for marketing or non-essential processing, which you may withdraw at any time; (c) legitimate interest — for platform security, fraud prevention, and service improvement; (d) legal obligation — where required by law.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '4. כיצד אנו משתמשים במידע' : '4. How We Use Information'}</h2>
            <p>
              {isRtl
                ? 'המידע משמש כדי: לחבר בין מנטורים למתלמדים ולחשב התאמות; לנהל את התקשורת והפרופיל שלך; לאמת זהות ומנטורים; לשלוח התראות והודעות שירות; למנוע שימוש לרעה, הונאה וספאם; ולשפר את הפלטפורמה. פרופילים והזדמנויות הם ציבוריים במהותם וגלויים למשתמשים אחרים; הודעות פרטיות, התראות ומסמכי אימות מוגבלים לך בלבד (ולמנהל מערכת לצורך אימות).'
                : 'We use information to: connect mentors and apprentices and compute matches; manage your communication and profile; verify identity and mentors; send notifications and service messages; prevent abuse, fraud, and spam; and improve the Platform. Profiles and opportunities are public by nature and visible to other users; private messages, notifications, and verification documents are restricted to you alone (and to an administrator for verification).'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '5. שיתוף מידע ומעבדי משנה' : '5. Sharing & Sub-processors'}</h2>
            <p>
              {isRtl
                ? 'איננו מוכרים ואיננו משכירים את המידע האישי שלך. אנו נעזרים בספקי שירות (מעבדי משנה) המעבדים מידע עבורנו בלבד: Supabase (בסיס נתונים, אימות ואחסון), Vercel (אירוח האתר), ו-Google Gemini (ניתוח התאמות מבוסס בינה מלאכותית, בקריאה מאובטחת בצד השרת). מידע יימסר לצדדים נוספים רק: (א) בהסכמתך; (ב) לפי דרישה חוקית או צו; (ג) להגנה על זכויותינו המשפטיות; (ד) במסגרת מיזוג או העברת פעילות, בכפוף למדיניות זו.'
                : 'We do not sell or rent your personal data. We use service providers (sub-processors) that process data on our behalf only: Supabase (database, authentication, storage), Vercel (site hosting), and Google Gemini (AI-based match analysis, via a secure server-side call). Data is disclosed to others only: (a) with your consent; (b) under legal requirement or order; (c) to protect our legal rights; (d) in a merger or business transfer, subject to this policy.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '6. העברת מידע בינלאומית' : '6. International Data Transfers'}</h2>
            <p>
              {isRtl
                ? 'ספקי השירות שלנו עשויים לאחסן ולעבד מידע בשרתים מחוץ למדינתך, לרבות מחוץ לאזור הכלכלי האירופי. במקרים כאלה אנו פועלים כדי שההעברה תיעשה תוך אמצעי הגנה מקובלים (כגון תניות חוזיות סטנדרטיות של האיחוד האירופי) ובהתאם לדין החל.'
                : 'Our service providers may store and process data on servers outside your country, including outside the EEA. In such cases we work to ensure the transfer is made with accepted safeguards (such as EU Standard Contractual Clauses) and in accordance with applicable law.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '7. עוגיות (Cookies) ואחסון מקומי' : '7. Cookies & Local Storage'}</h2>
            <p>
              {isRtl
                ? 'אנו משתמשים באחסון מקומי (Local Storage) ובעוגיות חיוניות לצורך ניהול ההתחברות (session), שמירת העדפות (כגון שפה) ותפעול תקין של השירות. איננו משתמשים בעוגיות פרסום של צד שלישי. ניתן לחסום עוגיות דרך הגדרות הדפדפן, אך הדבר עלול לפגוע בתפקוד השירות.'
                : 'We use local storage and essential cookies to manage your session, store preferences (such as language), and operate the Service correctly. We do not use third-party advertising cookies. You can block cookies via your browser settings, but this may impair the Service.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '8. שמירת מידע' : '8. Data Retention'}</h2>
            <p>
              {isRtl
                ? 'אנו שומרים את המידע כל עוד חשבונך פעיל, וכן לתקופה סבירה לאחר מכן ככל הנדרש לצרכים משפטיים, אבטחה, מניעת הונאה ועמידה בחובות חוקיות. עם מחיקת חשבונך, נמחק או ננכה את זיהוי המידע, למעט מידע שאנו נדרשים לשמור על פי דין.'
                : 'We retain data while your account is active, and for a reasonable period afterward as needed for legal, security, fraud-prevention, and legal-compliance purposes. Upon deletion of your account, we will delete or de-identify the data, except data we are required to retain by law.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '9. אבטחת מידע' : '9. Data Security'}</h2>
            <p>
              {isRtl
                ? 'אנו מיישמים אמצעי אבטחה טכניים וארגוניים, לרבות אכיפת הרשאות ברמת בסיס הנתונים (Row Level Security), הצפנת תעבורה, שמירת מפתחות רגישים בצד השרת בלבד, וגישה מוגבלת למסמכי אימות. עם זאת, אין מערכת מקוונת מאובטחת לחלוטין, ואיננו יכולים להבטיח אבטחה מוחלטת.'
                : 'We apply technical and organizational security measures, including database-level access enforcement (Row Level Security), transport encryption, keeping sensitive keys server-side only, and restricted access to verification documents. However, no online system is completely secure, and we cannot guarantee absolute security.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '10. הזכויות שלך' : '10. Your Rights'}</h2>
            <p>
              {isRtl
                ? 'בכפוף לדין החל, יש לך זכות לעיין במידע שלך, לתקנו, למחקו, להגביל או להתנגד לעיבודו, לקבל עותק נייד שלו (data portability), ולבטל הסכמה. משתמשי האיחוד האירופי/בריטניה (GDPR) זכאים גם להגיש תלונה לרשות פיקוח. תושבי קליפורניה (CCPA/CPRA) זכאים לדעת אילו נתונים נאספים, לבקש מחיקה, ולא להיות מופלים בשל מימוש זכויותיהם — ואיננו מוכרים מידע אישי. משתמשים בישראל זכאים לזכויות לפי חוק הגנת הפרטיות, התשמ"א-1981. חלק מהזכויות ניתן לממש ישירות דרך הגדרות החשבון, או בפנייה אלינו בדוא"ל.'
                : 'Subject to applicable law, you have the right to access, correct, delete, restrict, or object to processing of your data, receive a portable copy (data portability), and withdraw consent. EU/UK users (GDPR) also have the right to lodge a complaint with a supervisory authority. California residents (CCPA/CPRA) have the right to know what data is collected, to request deletion, and not to be discriminated against for exercising their rights — and we do not sell personal data. Users in Israel have rights under the Privacy Protection Law, 1981. Some rights can be exercised directly via account settings, or by contacting us by email.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '11. קטינים' : '11. Minors'}</h2>
            <p>
              {isRtl
                ? 'הפלטפורמה מיועדת לגיל 16 ומעלה. משתמשים מתחת לגיל 18 (או גיל הבגרות במדינתם) נדרשים להסכמת הורה או אפוטרופוס. איננו אוספים ביודעין מידע ממי שגילו נמוך מ-16. הורה או אפוטרופוס הסבור כי קטין מסר לנו מידע ללא הסכמה מוזמן לפנות אלינו, ואנו נפעל למחיקת המידע.'
                : 'The Platform is intended for ages 16 and above. Users under 18 (or the age of majority in their jurisdiction) require parental or guardian consent. We do not knowingly collect data from anyone under 16. A parent or guardian who believes a minor provided us data without consent is invited to contact us, and we will act to delete it.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '12. שינויים במדיניות ויצירת קשר' : '12. Changes & Contact'}</h2>
            <p>
              {isRtl
                ? 'אנו רשאים לעדכן מדיניות זו מעת לעת; שינוי מהותי יפורסם בפלטפורמה. לכל שאלה, בקשה למימוש זכויות או פנייה בנושא פרטיות, צור קשר בדוא"ל: skilllink.academy@gmail.com.'
                : 'We may update this policy from time to time; a material change will be posted on the Platform. For any question, rights request, or privacy matter, contact us at: skilllink.academy@gmail.com.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
