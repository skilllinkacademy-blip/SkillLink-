# Connection Success — עיצוב ומימוש
**תאריך:** 2026-05-16

---

## הבעיה

SkillLink אין לה שום דרך לדעת אם קישור מנטור-חניך הצליח. אי אפשר לענות על:
- "כמה קישורים הובילו לחניכות אמיתית?"
- "מה אחוז ההצלחה שלנו?"
- "האם מנטור X מוצלח?"

---

## דירוגי האפשרויות

| גישה | מאמץ | דיוק | Friction למשתמש |
|---|---|---|---|
| סקר אחרי 7 ימים (push) | גבוה — דורש scheduled function | בינוני | בינוני |
| ספירת הודעות בלבד (passive) | נמוך | נמוך — לא מדד הצלחה אמיתי | אפס |
| "Mark as completed" ידני | נמוך | בינוני — תלוי בשיתוף פעולה | בינוני |
| **Hybrid: passive + review (נבחר)** | **בינוני** | **גבוה** | **נמוך** |

---

## עיצוב שנבחר: Hybrid

### שלב 1 — Passive Signal (אוטומטי)
כאשר **שני הצדדים שלחו ≥3 הודעות כל אחד**, conversation מקבל `connection_status = 'active'`.

**לוגיקה:** `checkAndUpdateConnectionStatus()` ב-`connectionTracking.ts`  
**מתי נקרא:** אחרי כל `sendMessage()` ב-`chat.ts`

זה מגדיר "קישור פעיל" — שניים שבאמת דיברו.

### שלב 2 — Explicit Signal (ביקורת)
כאשר משתמש מגיש **ביקורת** על מנטור/חניך בדף הפרופיל, conversation ביניהם מקבל `connection_status = 'completed'`.

**לוגיקה:** `markConversationCompleted()` ב-`connectionTracking.ts`  
**מתי נקרא:** אחרי `supabase.from('reviews').insert()` ב-`Profile.tsx`

ביקורת = confirmation אנושי שהקישור הסתיים בדרך כלשהי.

---

## DB Schema

### שינוי בטבלה קיימת: `conversations`
```sql
ALTER TABLE public.conversations
    ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'new'
        CHECK (connection_status IN ('new', 'active', 'completed', 'stale')),
    ADD COLUMN IF NOT EXISTS connection_status_updated_at TIMESTAMPTZ;
```

### ערכי connection_status
| ערך | משמעות |
|---|---|
| `new` | שיחה התחילה, אבל צד אחד לפחות לא הגיב 3 פעמים |
| `active` | שני הצדדים שלחו ≥3 הודעות — קישור פעיל |
| `completed` | ביקורת הוגשה — קישור מאושר אנושית |
| `stale` | שמור לשימוש עתידי (לדוגמה: אין פעילות 60 יום) |

---

## המטריקה — "Success Rate"

```typescript
const { active, completed } = await getConnectionSuccessMetrics(supabase);
const meaningful = active + completed;
const successRate = meaningful > 0 ? (completed / meaningful) * 100 : 0;
```

**פירוש:** מתוך כל הקישורים שהגיעו לפחות לשיחה פעילה (≥3 הודעות מכל צד), כמה אחוז הגיעו לביקורת מאושרת.

**לדף נחיתה:** "X% מהקישורים שלנו מובילים לחניכות מוצלחת"

---

## קבצים שמומשו

| קובץ | תיאור |
|---|---|
| `supabase/migrations/20260516_add_missing_tables.sql` | הוספת עמודות לconversations + backfill |
| `src/lib/connectionTracking.ts` | checkAndUpdateConnectionStatus, markConversationCompleted, getConnectionSuccessMetrics |
| `src/lib/chat.ts` | קריאה ל-checkAndUpdateConnectionStatus אחרי sendMessage |
| `src/pages/Profile.tsx` | קריאה ל-markConversationCompleted אחרי review insert |

---

## מה נשאר להחלטת ירין

1. **UI לביקורת מ-context שיחה** — כרגע ביקורת רק מדף פרופיל. Nano Banana יכול להוסיף CTA בחלון השיחה אחרי שהיא הופכת `active`. ראו `ui_suggestions.md`.

2. **"Stale" detection** — conversation שלא ראה פעילות 60 יום יכול לקבל `stale`. אפשר לממש כ-Supabase scheduled function או כבדיקה ב-app load. לא מומש כרגע.

3. **Admin dashboard metrics** — `getConnectionSuccessMetrics()` קיים וניתן לקריאה. צריך להוסיף לדף AdminDashboard.tsx. ראו `ui_suggestions.md`.
