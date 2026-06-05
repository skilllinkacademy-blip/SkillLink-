import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? ''

const REPORT_TIME = '15:50'

// TA-35, TA-125 via Yahoo Finance (free, no key required)
const MARKET_SYMBOLS = [
  { symbol: 'TA35.TA',  label: 'מדד ת"א 35' },
  { symbol: 'TA125.TA', label: 'מדד ת"א 125' },
  { symbol: 'ILS=X',    label: 'דולר/שקל' },
]

Deno.serve(async (req) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    const marketData = await fetchMarketData()
    const summary = await generateSummary(marketData)

    const { data: report, error: insertErr } = await supabase
      .from('market_reports')
      .insert({ report_time: REPORT_TIME, summary, data: marketData })
      .select()
      .single()

    if (insertErr) throw insertErr

    // Notify all registered users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')

    if (profiles && profiles.length > 0) {
      const shortSummary = summary.slice(0, 180)
      await supabase.from('notifications').insert(
        profiles.map((p: { id: string }) => ({
          user_id: p.id,
          type: 'market_report',
          title: `דוח שוק ההון — ${REPORT_TIME}`,
          content: shortSummary,
          link: '/market',
        }))
      )
    }

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('capital-market-report error:', err)
    return new Response(JSON.stringify({ error: err?.message ?? 'unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

async function fetchMarketData(): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = {}

  await Promise.all(
    MARKET_SYMBOLS.map(async ({ symbol, label }) => {
      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        )
        const json = await res.json()
        const meta = json?.chart?.result?.[0]?.meta ?? {}
        const price: number = meta.regularMarketPrice ?? 0
        const prev: number = meta.previousClose ?? price
        const change = price - prev
        const changePct = prev !== 0 ? ((change / prev) * 100).toFixed(2) : '0.00'
        results[label] = { symbol, price, change: +change.toFixed(2), changePct: +changePct }
      } catch (e) {
        console.warn(`fetch failed for ${symbol}:`, e)
      }
    })
  )

  return results
}

async function generateSummary(data: Record<string, unknown>): Promise<string> {
  const lines = Object.entries(data)
    .map(([label, v]: [string, any]) =>
      `${label}: ${v.price} (${v.changePct >= 0 ? '+' : ''}${v.changePct}%)`
    )
    .join('\n')

  if (!GEMINI_API_KEY) {
    return `סיכום שוק ההון ל-${REPORT_TIME}:\n${lines}`
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `כתוב סיכום מקצועי וקצר (2-3 משפטים) בעברית על מצב שוק ההון הישראלי לשעה ${REPORT_TIME}, בהתבסס על הנתונים:\n${lines}`,
            }],
          }],
          generationConfig: { maxOutputTokens: 200 },
        }),
      }
    )
    const json = await res.json()
    return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? `עדכון שוק ההון — ${REPORT_TIME}:\n${lines}`
  } catch (e) {
    console.warn('Gemini summary failed:', e)
    return `עדכון שוק ההון — ${REPORT_TIME}:\n${lines}`
  }
}
