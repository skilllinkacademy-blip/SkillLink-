# SkillLink — הוראות לClause Code

## הפרויקט
פלטפורמת מנטור/חניך ישראלית בשלב בטא לפני לאנץ'.
בעלים: ירין לוי (yarinlavi1@gmail.com)

## Stack
- Frontend: React 19 + TypeScript + Vite
- Backend: Supabase (Auth, DB, Storage, Realtime)
- Deploy: Vercel (static hosting, free tier)
- AI: Gemini API (`VITE_GEMINI_API_KEY`)

## קישורים חשובים
- GitHub: `skilllinkacademy-blip/SkillLink-` (branch: `main`)
- Vercel project: `skill-link` (prj_tk3D3hYznKpHqsOHeqO0BMkIJXDA)
- Supabase project ID: `cprfaimmxtqsmmutdbcb`

## כללים — חובה לקרוא לפני כל שינוי
1. **אל תיגע בעיצוב UI** — העיצוב נעשה ע"י "Nano Banana". שנה רק לוגיקה ו-data fetching
2. **תמיכה בעברית/RTL** — דרישת ליבה בכל הממשק
3. **Free tier בלבד** — Supabase free + Vercel free, אל תוסיף שירותים בתשלום
4. **Supabase בלבד** — אין Express/SQLite/API routes. הכל דרך Supabase client ישירות

## מבנה הפרויקט
```
src/
  App.tsx              — ניתוב ראשי
  components/          — קומפוננטות משותפות
  contexts/            — AuthContext וכו'
  pages/               — דפים (Home, Explore, Profile, ...)
  services/            — שירותי Supabase
  lib/                 — כלים עזר
  utils/               — פונקציות שירות
```

## טבלאות Supabase
`opportunities` | `profiles` | `saved_opportunities` | `opportunity_interests` | `notifications` | `reviews` | `mentor_verifications` | `conversations` | `messages`

## Storage Buckets
- `avatars` (public) — תמונות פרופיל
- `opportunities_images` (public) — תמונות הזדמנויות
- `mentor_id_docs` (private) — אימות מנטורים
- `post-images` (public)
- `profile_covers` (public)

## Env Variables
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
```

## מצב נוכחי
- Migration מ-Express/SQLite ל-Supabase: **הושלם ✅**
- פרוס על Vercel: **✅**
- קובצי שרת (server.ts, src/lib/api.ts): קיימים אך לא פעילים — dead code
- מוכן לבטא עם משתמשים אמיתיים
