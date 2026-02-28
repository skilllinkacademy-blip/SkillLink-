import { useLanguage } from '../contexts/LanguageContext';

export default function Privacy() {
  const { lang } = useLanguage();
  const isHe = lang === 'he';

  return (
    <div className="max-w-[800px] mx-auto px-4 py-12">
      <div className="linkedin-card p-8 space-y-6">
        <h1 className="text-3xl font-bold text-primary border-b pb-4">
          {isHe ? 'מדיניות פרטיות' : 'Privacy Policy'}
        </h1>
        
        <div className="space-y-6 text-primary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">{isHe ? '1. איסוף מידע' : '1. Data Collection'}</h2>
            <p className="text-sm">
              {isHe 
                ? 'אנו אוספים מידע אישי הדרוש ליצירת פרופיל מנטור או חניך, כולל שם, פרטי קשר וניסיון מקצועי.' 
                : 'We collect personal data necessary to create a mentor or apprentice profile, including name, contact details, and professional experience.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">{isHe ? '2. שימוש במידע' : '2. Use of Information'}</h2>
            <p className="text-sm">
              {isHe 
                ? 'המידע משמש לחיבור בין משתמשים, שיפור השירות והגנה על בטיחות הקהילה.' 
                : 'Information is used to connect users, improve the service, and protect community safety.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">{isHe ? '3. שיתוף מידע' : '3. Data Sharing'}</h2>
            <p className="text-sm">
              {isHe 
                ? 'איננו מוכרים את המידע שלך לצדדים שלישיים. המידע משותף רק עם משתמשים אחרים לצורך יצירת התאמות.' 
                : 'We do not sell your data to third parties. Data is only shared with other users for the purpose of creating matches.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
