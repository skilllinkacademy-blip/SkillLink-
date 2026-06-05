-- Capital market report: table + cron schedule at 15:50 IST (12:50 UTC / IDT)

CREATE TABLE IF NOT EXISTS public.market_reports (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    report_time TEXT        NOT NULL DEFAULT '15:50',
    summary     TEXT,
    data        JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.market_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read market reports"
    ON public.market_reports FOR SELECT
    TO authenticated
    USING (true);

-- Schedule the Edge Function every Sunday–Thursday at 12:50 UTC = 15:50 IDT (UTC+3).
-- Requires pg_cron + pg_net extensions (enabled by default on Supabase).
-- Replace <SERVICE_ROLE_KEY> below with the project's service-role key (Settings → API).
SELECT cron.schedule(
    'capital-market-report-afternoon',
    '50 12 * * 0,1,2,3,4',
    $$
        SELECT net.http_post(
            url     := 'https://cprfaimmxtqsmmutdbcb.supabase.co/functions/v1/capital-market-report',
            headers := jsonb_build_object(
                'Content-Type',  'application/json',
                'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
            ),
            body    := '{}'::jsonb
        );
    $$
);
