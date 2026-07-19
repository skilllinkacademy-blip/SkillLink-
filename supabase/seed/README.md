<div dir="rtl">

# Supabase — seed & tests

## `demo_data.sql`
נתוני דמו להשקה: 6 מנטורים + 9 הזדמנויות. כל חשבונות הדמו עם אימייל `@skilllink.demo` ומזהים בקידומת `d0000000-...`.

הסרה נקייה:
<div dir="ltr">

```sql
DELETE FROM auth.users WHERE email LIKE '%@skilllink.demo';
```

</div>

## `../tests/rls_tests.sql`
16 בדיקות RLS שמוכיחות בידוד בין משתמשים. מריצים ב-SQL Editor; רץ בטרנזקציה ומתגלגל לאחור. פלט הצלחה: `ALL RLS TESTS PASSED`.

</div>
