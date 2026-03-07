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
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '1. קבלת התנאים' : '1. Acceptance of Terms'}</h2>
            <p>
              {isRtl 
                ? 'על ידי גישה או שימוש ב-SkillLink, אתה מסכים להיות מחויב לתנאים אלה. אם אינך מסכים לכל התנאים, אל תשתמש בשירות.'
                : 'By accessing or using SkillLink, you agree to be bound by these terms. If you do not agree to all terms, do not use the service.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '2. התנהגות משתמשים' : '2. User Conduct'}</h2>
            <p>
              {isRtl 
                ? 'אתה מסכים להשתמש ב-SkillLink רק למטרות חוקיות ובהתאם לתנאים אלה. חל איסור על התנהגות פוגענית, הטרדה או פרסום תוכן מטעה.'
                : 'You agree to use SkillLink only for lawful purposes and in accordance with these terms. Offensive behavior, harassment, or posting misleading content is strictly prohibited.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '3. אחריות מנטורים' : '3. Mentor Responsibilities'}</h2>
            <p>
              {isRtl 
                ? 'מנטורים אחראים לספק הדרכה מקצועית ומדויקת. SkillLink אינה אחראית לתוכן ההדרכה או לתוצאותיה.'
                : 'Mentors are responsible for providing professional and accurate guidance. SkillLink is not responsible for the content of the guidance or its outcomes.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '4. הגבלת אחריות' : '4. Limitation of Liability'}</h2>
            <p>
              {isRtl 
                ? 'SkillLink מסופקת "כפי שהיא" (AS IS). איננו מבטיחים שהשירות יהיה ללא תקלות או שהקשרים שנוצרו יובילו להצלחה תעסוקתית.'
                : 'SkillLink is provided "as is". We do not guarantee that the service will be error-free or that the connections made will lead to employment success.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '5. שינויים בתנאים' : '5. Changes to Terms'}</h2>
            <p>
              {isRtl 
                ? 'אנו שומרים לעצמנו את הזכות לשנות תנאים אלה בכל עת. המשך השימוש בשירות לאחר שינויים מהווה הסכמה לתנאים החדשים.'
                : 'We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
