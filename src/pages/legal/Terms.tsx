import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

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
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            {isRtl ? 'עודכן לאחרונה: 20 ביולי 2026' : 'Last updated: July 20, 2026'}
          </p>
        </div>

        <div className="prose prose-emerald max-w-none space-y-8 text-gray-600 font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '1. כללי וקבלת התנאים' : '1. General & Acceptance'}</h2>
            <p>
              {isRtl
                ? 'ברוכים הבאים ל-SkillLink ("הפלטפורמה", "השירות", "אנחנו"). הפלטפורמה מופעלת על ידי SkillLink [שם הישות המשפטית וכתובתה יעודכנו עם השלמת הרישום]. תנאי שימוש אלה ("התנאים") מהווים הסכם משפטי מחייב בינך ("המשתמש") לבין מפעילי הפלטפורמה. עצם הגישה, ההרשמה או השימוש בפלטפורמה מהווים הסכמה מלאה ובלתי מותנית לתנאים אלה ולמדיניות הפרטיות שלנו. אם אינך מסכים לתנאי כלשהו — אנא הימנע משימוש בפלטפורמה.'
                : 'Welcome to SkillLink ("the Platform", "the Service", "we", "us"). The Platform is operated by SkillLink [legal entity name and address to be updated upon registration]. These Terms of Service ("Terms") form a binding legal agreement between you ("the User") and the Platform operators. Accessing, registering for, or using the Platform constitutes full and unconditional acceptance of these Terms and our Privacy Policy. If you do not agree to any term, please refrain from using the Platform.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '2. כשירות וגיל מינימלי' : '2. Eligibility & Minimum Age'}</h2>
            <p>
              {isRtl
                ? 'השימוש בפלטפורמה מותר מגיל 16 ומעלה בלבד. משתמשים בגילאי 16 עד 18 (או עד גיל הבגרות החוקי במדינתם) מצהירים ומתחייבים כי קיבלו את הסכמתם המפורשת של הורה או אפוטרופוס חוקי לשימוש בפלטפורמה, ובפרט להשתתפות בפעילות הכשרה מעשית. באחריות ההורה או האפוטרופוס לפקח על פעילות הקטין בפלטפורמה. אנו רשאים לדרוש הוכחת גיל או הסכמת הורים בכל עת. הרשמה של משתמש מתחת לגיל 16 אסורה, וחשבון כזה יימחק עם גילויו.'
                : 'Use of the Platform is permitted only for those aged 16 and above. Users aged 16 to 18 (or up to the legal age of majority in their jurisdiction) represent and warrant that they have obtained the explicit consent of a parent or legal guardian to use the Platform, and in particular to participate in hands-on training activity. The parent or guardian is responsible for supervising the minor’s activity. We may require proof of age or parental consent at any time. Registration by anyone under 16 is prohibited, and such accounts will be deleted upon discovery.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '3. מהות השירות — פלטפורמת תיווך בלבד' : '3. Nature of the Service — Intermediary Only'}</h2>
            <p>
              {isRtl
                ? 'SkillLink היא פלטפורמה טכנולוגית המחברת בין בעלי מקצוע ומנטורים לבין מתלמדים ("שירותי חיבור"). אנחנו איננו מעסיק, סוכנות השמה, קבלן, מוסד הכשרה מוסמך או צד לכל הסכם, עסקה או יחסי עבודה הנוצרים בין המשתמשים. איננו מעורבים בתנאי ההתקשרות, בתשלומים, בשעות העבודה, בפיקוח או בתוצריהם. כל התקשרות בין מנטור למתלמד היא באחריותם הבלעדית ובכפוף להסכמות ישירות ביניהם ולדין החל.'
                : 'SkillLink is a technology platform that connects professionals and mentors with apprentices ("Connection Services"). We are not an employer, staffing agency, contractor, accredited training institution, or a party to any agreement, transaction, or employment relationship formed between users. We are not involved in engagement terms, payments, working hours, supervision, or their outcomes. Any engagement between a mentor and an apprentice is their sole responsibility and subject to direct agreements between them and applicable law.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '4. היעדר יחסי עובד-מעביד' : '4. No Employment Relationship'}</h2>
            <p>
              {isRtl
                ? 'שום דבר בפלטפורמה או בתנאים אלה אינו יוצר יחסי עובד-מעביד, שותפות, שליחות או נאמנות בין SkillLink לבין מי מהמשתמשים, וכן איננו קובעים כי נוצרים יחסי עבודה בין המשתמשים לבין עצמם. ככל שנוצרים יחסי עבודה בין מנטור למתלמד — חובות המעביד (לרבות שכר מינימום, ניכויי מס, ביטוח לאומי, גמל ותנאים סוציאליים) חלות על הצדדים בלבד, ו-SkillLink אינה נושאת בהן ואינה אחראית להפרתן.'
                : 'Nothing in the Platform or these Terms creates an employer-employee relationship, partnership, agency, or fiduciary relationship between SkillLink and any user, nor do we determine that an employment relationship is formed between users themselves. To the extent an employment relationship arises between a mentor and an apprentice, employer obligations (including minimum wage, tax withholding, social security, pension, and benefits) rest solely with the parties, and SkillLink neither bears them nor is responsible for their breach.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '5. חשבון המשתמש' : '5. User Account'}</h2>
            <p>
              {isRtl
                ? 'עליך למסור מידע נכון, מדויק ומעודכן בעת ההרשמה, ולשמור על סודיות פרטי הכניסה שלך. אתה האחראי הבלעדי לכל פעילות המתבצעת בחשבונך. עליך להודיע לנו מיד על כל שימוש בלתי מורשה. אנו רשאים להשעות או לסגור חשבון שנמסרו לגביו פרטים כוזבים או שנעשה בו שימוש לרעה.'
                : 'You must provide true, accurate, and current information upon registration, and keep your login credentials confidential. You are solely responsible for all activity under your account. You must notify us immediately of any unauthorized use. We may suspend or close an account that provided false details or was misused.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '6. כללי התנהגות ותוכן אסור' : '6. Conduct & Prohibited Content'}</h2>
            <p>
              {isRtl
                ? 'אתה מתחייב שלא: (א) לפרסם תוכן שקרי, מטעה, פוגעני, מאיים, מפלה, גזעני או בלתי חוקי; (ב) להטריד, לאיים או לנצל משתמשים אחרים, ובפרט קטינים; (ג) להתחזות לאדם או גוף; (ד) לפרסם הצעות עבודה מנצלות, בלתי חוקיות או ללא כוונה אמיתית; (ה) לאסוף מידע על משתמשים אחרים, לשלוח דואר זבל או להפעיל בוטים; (ו) לפגוע באבטחת הפלטפורמה או לעקוף מנגנוני הגנה. אנו רשאים להסיר תוכן ולחסום משתמשים לפי שיקול דעתנו.'
                : 'You undertake not to: (a) post false, misleading, offensive, threatening, discriminatory, racist, or unlawful content; (b) harass, threaten, or exploit other users, particularly minors; (c) impersonate any person or entity; (d) post exploitative, unlawful, or non-genuine job offers; (e) scrape user data, send spam, or run bots; (f) compromise Platform security or bypass protections. We may remove content and block users at our discretion.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '7. בטיחות, סיכונים וביטוח' : '7. Safety, Risks & Insurance'}</h2>
            <p>
              {isRtl
                ? 'המשתמשים מבינים כי הכשרה מעשית בתחומי מלאכה ועבודות כפיים כרוכה בסיכונים פיזיים, לרבות אפשרות לפציעה. באחריות המשתמשים בלבד לוודא קיומם של אמצעי בטיחות נאותים, ציוד מגן, הדרכת בטיחות וכיסוי ביטוחי מתאים (ביטוח צד ג\', ביטוח תאונות אישיות, ביטוח חבות מעבידים ככל שרלוונטי) לפני תחילת כל פעילות. SkillLink אינה מספקת ביטוח כלשהו, אינה בודקת מקומות עבודה ואינה אחראית לכל נזק גוף או רכוש שייגרם במהלך או בעקבות פעילות בין משתמשים.'
                : 'Users understand that hands-on training in crafts and manual labor involves physical risks, including possible injury. It is the users’ sole responsibility to ensure adequate safety measures, protective equipment, safety briefings, and appropriate insurance coverage (third-party liability, personal accident, employer liability where relevant) before any activity. SkillLink provides no insurance, does not inspect workplaces, and is not responsible for any bodily or property harm caused during or as a result of activity between users.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '8. אימות, ביקורות ותוכן משתמשים' : '8. Verification, Reviews & User Content'}</h2>
            <p>
              {isRtl
                ? 'חשוב: סימון "מנטור מאומת" (ככל שקיים) מתייחס, לכל היותר, לאימות טכני של זהות או של מסמך שנמסר — ואינו בדיקה, אישור או ערובה לכך שהמשתמש מחזיק ברישיון מקצועי בתוקף, בהסמכה, בהכשרה או בכישורים כלשהם. SkillLink אינה בודקת ואינה מאמתת רישיונות, תעודות, הסמכות מקצועיות, כשירות, ניסיון או עבר פלילי של מנטורים או מתלמדים, ואינה ערבה לכך בשום צורה. האחריות המלאה לבדוק את זהותו, רישיונותיו, הסמכותיו, כשירותו ואמינותו של הצד השני — לפני ובמהלך כל התקשרות — חלה עליך, המשתמש, בלבד. תגי כישורים, ביקורות ודירוגים מבוססים על מידע ודעות שנמסרו על ידי משתמשים ואינם מהווים המלצה או מצג של SkillLink. בהעלאת תוכן (טקסט, תמונות, תיק עבודות) אתה מעניק ל-SkillLink רישיון לא-בלעדי, עולמי וללא תמלוגים להציג ולעבד את התוכן לצורך הפעלת השירות, ומצהיר כי הוא אינו מפר זכויות של צד שלישי.'
                : 'Important: a "Verified Mentor" mark (where present) refers, at most, to a technical verification of an identity or a submitted document — and is NOT a check, endorsement, or guarantee that the user holds a valid professional license, certification, training, or any qualifications. SkillLink does not check or verify licenses, certificates, professional qualifications, competence, experience, or criminal history of mentors or apprentices, and provides no warranty of any kind regarding them. The full responsibility to verify the other party’s identity, licenses, qualifications, competence, and reliability — before and during any engagement — rests solely on you, the User. Skill badges, reviews, and ratings are based on user-submitted information and opinions and do not constitute a recommendation or representation by SkillLink. By uploading content (text, images, portfolio) you grant SkillLink a non-exclusive, worldwide, royalty-free license to display and process it for operating the Service, and warrant that it does not infringe third-party rights.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '9. הגבלת אחריות' : '9. Limitation of Liability'}</h2>
            <p>
              {isRtl
                ? 'השירות מסופק כפי שהוא ("AS IS") וכפי שהוא זמין, ללא מצג או אחריות מכל סוג. במידה המרבית המותרת בדין, SkillLink, מפעיליה, עובדיה ונציגיה לא יישאו באחריות לכל נזק ישיר, עקיף, תוצאתי, מיוחד או עונשי (לרבות אובדן רווחים, נתונים, מוניטין, אובדן הזדמנות או נזקי גוף) הנובע מהשימוש בפלטפורמה, מהתקשרות בין משתמשים או מהסתמכות על תוכן בפלטפורמה. בכל מקרה, אחריותנו הכוללת המצטברת לא תעלה על הסכום ששילמת לנו בפועל בשלושת החודשים שקדמו לאירוע, ובהיעדר תשלום — לא תעלה על 200 ש"ח.'
                : 'The Service is provided "AS IS" and "AS AVAILABLE", without representation or warranty of any kind. To the maximum extent permitted by law, SkillLink, its operators, employees, and representatives shall not be liable for any direct, indirect, consequential, special, or punitive damages (including lost profits, data, goodwill, lost opportunity, or bodily harm) arising from use of the Platform, engagement between users, or reliance on Platform content. In any event, our total aggregate liability shall not exceed the amount you actually paid us in the three months preceding the event, and absent payment, shall not exceed ILS 200 (approx. USD 55).'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '10. שיפוי' : '10. Indemnification'}</h2>
            <p>
              {isRtl
                ? 'אתה מתחייב לשפות ולפצות את SkillLink ומפעיליה בגין כל תביעה, דרישה, נזק, הוצאה או הפסד (לרבות שכר טרחת עורך דין) הנובעים מהפרת תנאים אלה על ידך, משימוש לרעה בפלטפורמה, מהתקשרותך עם משתמשים אחרים או מהפרת זכויות צד שלישי.'
                : 'You agree to indemnify and hold harmless SkillLink and its operators from any claim, demand, damage, expense, or loss (including attorney fees) arising from your breach of these Terms, misuse of the Platform, your engagement with other users, or infringement of third-party rights.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '11. קניין רוחני' : '11. Intellectual Property'}</h2>
            <p>
              {isRtl
                ? 'כל הזכויות בפלטפורמה — לרבות עיצוב, לוגו, שם המותג, טקסטים, קוד, מאגרי מידע ותכונות — שמורות ל-SkillLink ומוגנות בדיני קניין רוחני. אין להעתיק, לשכפל, להפיץ, לבצע הנדסה לאחור או ליצור יצירות נגזרות מכל חלק בפלטפורמה ללא אישורנו מראש ובכתב. תוכן שהעלית נותר בבעלותך, בכפוף לרישיון השימוש שהוענק לנו לעיל.'
                : 'All rights in the Platform — including design, logo, brand name, text, code, databases, and features — are reserved to SkillLink and protected by intellectual property law. You may not copy, reproduce, distribute, reverse-engineer, or create derivative works from any part of the Platform without our prior written consent. Content you upload remains yours, subject to the license granted to us above.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '12. תשלומים ומנויים' : '12. Payments & Subscriptions'}</h2>
            <p>
              {isRtl
                ? 'השימוש בשירותי הליבה של הפלטפורמה חינמי כיום. ייתכן שנציע בעתיד מסלולים בתשלום (מנויים או תכונות פרימיום). תנאי תשלום ספציפיים, מדיניות ביטול והחזרים יוצגו במפורש בעת רכישת מסלול בתשלום ויהוו חלק בלתי נפרד מתנאים אלה. איננו גובים תשלום בגין ההתקשרות בין מנטור למתלמד ואיננו צד לתשלומים המועברים ביניהם.'
                : 'Use of the Platform’s core services is currently free. We may offer paid plans (subscriptions or premium features) in the future. Specific payment terms, cancellation, and refund policies will be presented explicitly upon purchasing a paid plan and will form an integral part of these Terms. We do not charge for the engagement between a mentor and an apprentice and are not a party to payments transferred between them.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '13. השעיה, סיום וזמינות' : '13. Suspension, Termination & Availability'}</h2>
            <p>
              {isRtl
                ? 'אתה רשאי להפסיק את השימוש ולמחוק את חשבונך בכל עת. אנו רשאים להשעות, להגביל או לסגור חשבון, ולהסיר תוכן, בכל מקרה של הפרת תנאים, פעילות בלתי חוקית או סיכון למשתמשים אחרים, בהודעה או בלעדיה כמתחייב מהנסיבות. איננו מתחייבים לזמינות רציפה של השירות ורשאים לשנות, להשעות או להפסיק את הפלטפורמה או חלקים ממנה בכל עת.'
                : 'You may stop using and delete your account at any time. We may suspend, restrict, or close an account, and remove content, in any case of breach, unlawful activity, or risk to other users, with or without notice as circumstances require. We do not guarantee uninterrupted availability and may modify, suspend, or discontinue the Platform or parts of it at any time.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '14. שינוי התנאים' : '14. Changes to the Terms'}</h2>
            <p>
              {isRtl
                ? 'אנו רשאים לעדכן תנאים אלה מעת לעת. שינוי מהותי יפורסם בפלטפורמה ו/או יישלח בהודעה. המשך השימוש לאחר עדכון מהווה הסכמה לתנאים המעודכנים. מומלץ לעיין בתנאים מדי פעם.'
                : 'We may update these Terms from time to time. A material change will be posted on the Platform and/or sent by notice. Continued use after an update constitutes acceptance of the updated Terms. We recommend reviewing the Terms periodically.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '15. הדין החל וסמכות שיפוט' : '15. Governing Law & Jurisdiction'}</h2>
            <p>
              {isRtl
                ? 'על תנאים אלה יחולו דיני מדינת ישראל, ללא כללי ברירת הדין. סמכות השיפוט הבלעדית נתונה לבתי המשפט המוסמכים במחוז תל אביב-יפו. אין באמור כדי לגרוע מזכויות מגן בלתי-ניתנות לוויתור העומדות לצרכן או למשתמש לפי דין החל במקום מושבו.'
                : 'These Terms are governed by the laws of the State of Israel, without its conflict-of-law rules. Exclusive jurisdiction lies with the competent courts of the Tel Aviv-Yafo district. This does not derogate from non-waivable protective rights available to a consumer or user under the applicable law of their place of residence.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{isRtl ? '16. יצירת קשר' : '16. Contact'}</h2>
            <p>
              {isRtl
                ? 'לשאלות בנוגע לתנאים אלה ניתן לפנות אלינו בדוא"ל: skilllink.academy@gmail.com.'
                : 'For questions regarding these Terms, contact us at: skilllink.academy@gmail.com.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
