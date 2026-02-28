import { useLanguage } from '../contexts/LanguageContext';

export default function Terms() {
  const { lang } = useLanguage();
  const isHe = lang === 'he';

  return (
    <div className="max-w-[800px] mx-auto px-4 py-12">
      <div className="linkedin-card p-8 space-y-6">
        <h1 className="text-3xl font-bold text-primary border-b pb-4">
          {isHe ? 'תנאי שימוש' : 'Terms of Service'}
        </h1>
        
        <div className="space-y-6 text-primary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">{isHe ? '1. הצהרת פלטפורמה' : '1. Platform Disclaimer'}</h2>
            <p className="text-sm">
              {isHe 
                ? 'SkillLink היא פלטפורמת תיווך בלבד. אנחנו מחברים בין מנטורים לחניכים אך איננו צד להסכמים ביניהם.' 
                : 'SkillLink is an intermediary platform only. We connect mentors and apprentices but are not a party to any agreements between them.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">{isHe ? '2. יחסי עובד-מעביד' : '2. Employer-Employee Relationship'}</h2>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              {isHe 
                ? 'חשוב: השימוש בפלטפורמה אינו יוצר יחסי עובד-מעביד בין המשתמשים לבין SkillLink, ואינו מבטיח קיום יחסים כאלו בין המנטור לחניך.' 
                : 'IMPORTANT: Use of the platform does not create an employer-employee relationship between users and SkillLink, nor does it guarantee such a relationship between mentor and apprentice.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">{isHe ? '3. אחריות' : '3. Liability'}</h2>
            <p className="text-sm">
              {isHe 
                ? 'SkillLink אינה אחראית לטיב ההכשרה, לתשלומים בין הצדדים או לכל נזק שייגרם במהלך ההתמחות.' 
                : 'SkillLink is not responsible for the quality of training, payments between parties, or any damage caused during the apprenticeship.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">{isHe ? '4. יישוב סכסוכים' : '4. Dispute Resolution'}</h2>
            <p className="text-sm">
              {isHe 
                ? 'במקרה של מחלוקת, המשתמשים מסכימים לפנות תחילה לבוררות של SkillLink לפני נקיטת צעדים משפטיים.' 
                : 'In case of a dispute, users agree to first seek SkillLink arbitration before taking legal action.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
