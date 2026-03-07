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
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '1. איסוף מידע' : '1. Information Collection'}</h2>
            <p>
              {isRtl 
                ? 'אנו אוספים מידע שאתה מספק לנו ישירות בעת יצירת חשבון, עדכון הפרופיל שלך, או תקשורת עם משתמשים אחרים. זה כולל את שמך, כתובת האימייל שלך, מספר הטלפון שלך, וכל מידע אחר שתבחר לספק.'
                : 'We collect information you provide directly to us when you create an account, update your profile, or communicate with other users. This includes your name, email address, phone number, and any other information you choose to provide.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '2. שימוש במידע' : '2. How We Use Information'}</h2>
            <p>
              {isRtl 
                ? 'אנו משתמשים במידע שאנו אוספים כדי לספק, לתחזק ולשפר את השירותים שלנו, כדי לחבר בין מנטורים למתלמדים, וכדי לשלוח לך הודעות ועדכונים.'
                : 'We use the information we collect to provide, maintain, and improve our services, to connect mentors with apprentices, and to send you notifications and updates.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '3. שיתוף מידע' : '3. Information Sharing'}</h2>
            <p>
              {isRtl 
                ? 'איננו מוכרים את המידע האישי שלך לצדדים שלישיים. אנו משתפים מידע עם משתמשים אחרים רק כפי שנדרש כדי להקל על תהליך ההתלמדות (למשל, הצגת הפרופיל הציבורי שלך).'
                : 'We do not sell your personal information to third parties. We share information with other users only as needed to facilitate the mentorship process (e.g., showing your public profile).'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '4. אבטחה' : '4. Security'}</h2>
            <p>
              {isRtl 
                ? 'אנו נוקטים באמצעים סבירים כדי להגן על המידע האישי שלך מפני אובדן, גניבה ושימוש לרעה.'
                : 'We take reasonable measures to protect your personal information from loss, theft, and misuse.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '5. צור קשר' : '5. Contact Us'}</h2>
            <p>
              {isRtl 
                ? 'אם יש לך שאלות לגבי מדיניות הפרטיות שלנו, אנא צור קשר בכתובת: skilllink.academy@gmail.com'
                : 'If you have any questions about our Privacy Policy, please contact us at: skilllink.academy@gmail.com'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
