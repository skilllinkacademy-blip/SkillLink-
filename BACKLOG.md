# SkillLink — Backlog שיפורים אוטומטיים

כל שבוע הרוטינה בוחרת פריט אחד מה-HIGH ומממשת אותו.
אחרי כל מימוש — מסמן [x] ומוסיף תאריך.

---

## 🔴 HIGH — קריטי לחוויה

- [ ] **Onboarding flow מלא** — אחרי הרשמה, ולד המדריך שלב-שלב: תמלא פרופיל → פרסם הזדמנות → מצא חיבור. עם progress bar ו-skip אפשרי
- [ ] **Empty states** — כשאין הזדמנויות / אין הודעות / אין ביקורות — הצג מסך מושך עם CTA ברור ולא מסך ריק
- [ ] **Profile completion score** — מד השלמת פרופיל (0-100%) עם הנחיות ספציפיות מה חסר, מוצג בראש הפרופיל
- [ ] **Search UX שיפור** — debounce ל-500ms, הצגת "מחפש..." spinner, הצגת מספר תוצאות
- [ ] **Mobile responsive בדיקה מלאה** — וידוא שכל הדפים עובדים טוב במובייל (הרוב המשתמשים יגיעו מפלאפון)
- [x] **Image upload validation** — בדיקת סוג קובץ (jpg/png/webp בלבד) וגודל (מקסימום 5MB) לפני העלאה ✅ 2026-06-14
- [ ] **Match score תיקון** — נורמליזציה של חישוב ה-match כך שלא יעבור 100

## 🟡 MEDIUM — שיפורי חוויה

- [ ] **"פעיל לאחרונה" badge** — הצגת כמה זמן עבר מאז כניסה אחרונה בפרופיל ובכרטיסי Explore
- [ ] **Conversation preview בהודעות** — הצגת 2-3 מילים ראשונות מהודעה אחרונה ב-Inbox
- [ ] **Notification grouping** — קיבוץ התראות מאותו סוג ("3 אנשים התעניינו בהזדמנות שלך")
- [ ] **Saved opportunities ריק state** — הצגת הנחיה "לא שמרת הזדמנויות עדיין" עם כפתור "גלה הזדמנויות"
- [ ] **Opportunity expiry** — הזדמנויות ישנות (>90 יום) מסומנות אוטומטית כ-"ישנה" עם הנחיה לבעלים לרענן
- [ ] **Review reminder** — אחרי 2 שבועות מ-connection active, שלח notification לשני הצדדים לכתוב ביקורת
- [ ] **Copy profile link** — כפתור "העתק קישור לפרופיל" בפרופיל האישי
- [ ] **Opportunity share** — כפתור שיתוף הזדמנות (copy link / WhatsApp)
- [ ] **Character counter בטופס הודעה** — מונה תווים בזמן אמת עם מקסימום 2000 תווים
- [ ] **Typing indicator** — הצגת "... כותב" בשיחה בזמן אמת

## 🟢 LOW — שיפורים נחמדים

- [ ] **Dark/Light mode** — toggle בין מצבים
- [ ] **Keyboard shortcuts** — Enter לשליחת הודעה, Esc לסגירת modal
- [ ] **PWA manifest** — הוספת manifest.json כדי שאפשר להוסיף לשולחן העבודה
- [ ] **SEO meta tags** — כותרות ותיאורים דינמיים לדפי הזדמנויות ופרופילים
- [ ] **Loading skeletons** — במקום spinner גנרי, skeleton cards שמדמים את התוכן

## 🔧 BUGS ידועים

- [ ] **api.ts dead code** — מחיקת /src/lib/api.ts ו-server.ts שלא בשימוש
- [ ] **Gemini model inconsistency** — איחוד geminiService.ts ו-aiService.ts לשימוש במודל אחד
- [ ] **Username uniqueness** — הוספת retry logic אם username נוצר כפול
- [ ] **Profile public privacy** — אם משתמש לא רוצה שפרופילו ייראה, אין הגנה

---

## ✅ הושלם

- **Image upload validation** — בדיקת סוג קובץ (jpg/png/webp) וגודל (מקסימום 5MB) ב-Profile, OpportunityNew, Messaging ✅ 2026-06-14

