<div dir="rtl">

# צ'קליסט השקה — SkillLink

מה שהקוד כבר מוכן, ומה שרק אתה (ירין) יכול לעשות לפני 10 המשתמשים הראשונים.

## ✅ מוכן בקוד (נעשה)

- מסלול קריטי מלא עובד: הרשמה → פרופיל → פרסום → עניין → צ'אט → ביקורת
- 34 טסטים + CI ירוק, 16 בדיקות RLS עוברות, 2 חורי אבטחה נסגרו
- README + ARCHITECTURE + SECURITY
- נתוני דמו: 6 מנטורים (4 מאומתים) + 9 הזדמנויות
- עמוד נחיתה, onboarding banner, מובייל תקין

## 🔴 חובה לפני השקה — רק אתה יכול

### אבטחה (קריטי)
- [ ] **הדלק אימות אימייל** ב-Supabase → Authentication → Providers → Email → "Confirm email". כרגע כבוי, כל אחד נרשם עם כל כתובת.
- [ ] **הדלק הגנת סיסמאות דלופות** — Authentication → Policies → "Leaked password protection" (HaveIBeenPwned).
- [ ] **הגדר את מפתח Gemini כ-secret** — הקוד כבר עבר לקרוא ל-Edge Function `gemini` (המפתח לא נחשף יותר בלקוח). נשאר רק להגדיר את הערך בצד שרת:
  ```bash
  supabase secrets set GEMINI_API_KEY=<your-gemini-key> --project-ref cprfaimmxtqsmmutdbcb
  ```
  (או דרך Supabase Dashboard → Edge Functions → Secrets.) **עד שתעשה זאת ה-AI ranking לא פעיל** — האפליקציה עובדת עם התאמה היוריסטית מקומית כ-fallback.
- [ ] **הסר את `VITE_GEMINI_API_KEY` מ-Vercel** (ומ-.env המקומי) — כבר לא בשימוש, אין טעם להשאירו חשוף.

### נתונים
- [ ] **נקה נתוני זבל** ב-DB — יש ~10 פרופילי בדיקה עם שמות ג'יבריש (`dfd`, `כדכע`, `lkj;j;`, `קבק`...). מחק דרך Supabase SQL Editor:
  ```sql
  -- בדוק קודם מי נמחק:
  SELECT email, raw_user_meta_data->>'full_name' FROM auth.users
  WHERE email NOT LIKE '%@skilllink.demo'
    AND email NOT IN ('skilllink.academy@gmail.com','yarinlavi1@gmail.com');
  ```
  מחק רק את אלה שאתה מזהה כזבל (זה נתונים שלך — אני לא נגעתי).
- [ ] **החלט על נתוני הדמו** — כשיצטרפו מספיק אנשים אמיתיים, הסר את הדמו:
  ```sql
  DELETE FROM auth.users WHERE email LIKE '%@skilllink.demo';
  ```
- [ ] **מחק את 2 משתמשי הבדיקה שלי** (mentor1/mentee1) אם לא צריך: `yarinlavi1+mentor1@gmail.com`, `yarinlavi1+mentee1@gmail.com`.

### תוכן ומיתוג
- [ ] **דומיין** — חבר דומיין קבוע ב-Vercel (במקום `*.vercel.app`).
- [x] **טקסטים משפטיים** — Terms (16 סעיפים) + Privacy (12 סעיפים, GDPR+CCPA+קטינים) נכתבו במלואם בעברית ואנגלית. ⚠️ **טיוטה — לא ייעוץ משפטי.** נשאר: (1) למלא שם הישות המשפטית + כתובת אחרי רישום (יש `[placeholder]` בסעיף 1 של כל מסמך); (2) מומלץ שעו"ד יסקור לפני השקה רחבה, במיוחד בגלל קטינים ו-GDPR. עמודי About / Contact — לבדוק שהתוכן מדויק.
- [ ] **תבניות אימייל של Supabase** — התאם את מיילי האימות/איפוס סיסמה לעברית ולמיתוג SkillLink (Authentication → Email Templates).
- [ ] **דוא"ל שולח** — ברירת המחדל של Supabase מוגבלת (3-4 מיילים/שעה). לפני נפח אמיתי חבר SMTP משלך (Resend/SendGrid) ב-Auth → SMTP Settings.
- [ ] **תמונות פרופיל לדמו** (אופציונלי) — המנטורים כרגע עם ראשי תיבות. אפשר להעלות אווטרים ל-bucket `avatars` כדי שייראו מלאים יותר.

### אנשים
- [ ] **גייס 3-5 מנטורים אמיתיים** לפני ההשקה — נתוני דמו מחזיקים את המראה, אבל משתמש ראשון שיפנה צריך לקבל תגובה אמיתית. (יש כבר חומרי גיוס ב-`Workspaces/SkillLink/recruitment`.)
- [ ] **הגדר משתמש אדמin** אמיתי לאישור אימותי מנטורים (כרגע `skilllink.academy@gmail.com`).

## 🟡 מומלץ (לא חוסם)

- [ ] Google OAuth — כפתור "המשך עם Google" קיים ב-UI; ודא שה-provider מוגדר ב-Supabase.
- [ ] הרץ שוב `supabase/tests/rls_tests.sql` אחרי כל שינוי סכמה עתידי.
- [ ] code splitting (`React.lazy`) — ה-bundle ~1.1MB; משפר טעינה ראשונית במובייל.
- [ ] תיקון אזהרת React על controlled inputs באשף פרסום הזדמנות (קוסמטי).

## הרצה מקומית מהירה (תזכורת)

<div dir="ltr">

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 34 tests
npm run lint    # type check
npm run build   # production build
```

</div>

</div>
