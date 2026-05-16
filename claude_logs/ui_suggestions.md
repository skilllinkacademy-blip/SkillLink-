# UI Suggestions לNano Banana
**תאריך עדכון אחרון:** 2026-05-16

---

## 1. CTA "איך הלך?" בשיחת WhatsApp שהפכה 'active'
**עדיפות:** גבוהה  
**הקשר:** כאשר `conversation.connection_status === 'active'` (שני הצדדים שלחו ≥3 הודעות), הוסף באנר/כרטיס בחלק עליון של חלון השיחה.

**טקסט מוצע (עברית):**  
"נראה שנפגשתם 🎉 — ספר לנו איך הלך? כתוב ביקורת ל-[שם המנטור/חניך]"

**פעולה:** לינק לדף פרופיל של הצד השני, עם hash `#reviews` שפותח טופס הביקורת אוטומטית.

**הערה טכנית:** `connection_status` זמין ב-conversations table. בMessaging.tsx בדוק `selectedConversation.connection_status === 'active'` ו-`!selectedConversation.has_review` (שדה שניתן להוסיף עם JOIN לreviews).

---

## 2. מטריקות הצלחה ב-Admin Dashboard
**עדיפות:** בינונית  
**הקשר:** `getConnectionSuccessMetrics()` ב-`src/lib/connectionTracking.ts` מחזירה { total, active, completed, successRate }.

**הצגה מוצעת:** 4 כרטיסי KPI ב-AdminDashboard.tsx:
- סך שיחות
- שיחות פעילות (≥3 הודעות מכל צד)
- קישורים מושלמים (עם ביקורת)
- אחוז הצלחה

---

## 3. שדות חובה בהרשמה
**עדיפות:** גבוהה  
**הקשר:** ניתן להירשם עם פרופיל ריק לחלוטין. זה מוביל ל-AI matching גרוע.

**מוצע:** הוסף validation ב-Profile.tsx / Auth.tsx לשדות: occupation, city, bio (לפחות 30 תווים), role.

---

## 4. "סטטוס Online" אמיתי
**עדיפות:** נמוכה  
**הקשר:** ה-"Online" badge בחלון השיחה (Messaging.tsx שורה 441) הוא hardcoded — תמיד מראה "Online".

**מוצע:** להשתמש ב-Supabase Realtime Presence לסטטוס אמיתי, או להסיר את הbadge עד שמממשים.

---

## 5. אישור קבלת עניין למנטור
**עדיפות:** בינונית  
**הקשר:** כאשר מנטור פותח הזדמנות ומישהו מביע עניין, הוא מקבל notification. אבל אין לו דרך "לאשר" או "לדחות" את הבקשה בצורה מסודרת.

**מוצע:** בOpportunityDetails.tsx, ברשימת המתעניינים שבה המנטור רואה את הפרופילים — הוסף כפתורי "שלח הודעה" ו-"הסר" ברורים יותר (כרגע יש removeInterest אבל לא "שלח הודעה" ישיר).
