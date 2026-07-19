// Supabase Edge Function: server-side proxy to the Gemini API.
//
// Why: the Gemini API key must never ship to the browser. The client calls
// this function (over the user's Supabase session) and the key stays in
// Deno.env — set it once with:
//   supabase secrets set GEMINI_API_KEY=<your key>
//
// Contract mirrors @google/genai's generateContent so the client change is a
// drop-in: request { model?, contents, config? } → response { text }.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return json({ error: 'GEMINI_API_KEY is not configured on the server' }, 500);

  let payload: { model?: string; contents?: unknown; config?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const model = payload.model || 'gemini-2.5-flash';
  // Accept either a plain string prompt or the structured contents array.
  const contents =
    typeof payload.contents === 'string'
      ? [{ role: 'user', parts: [{ text: payload.contents }] }]
      : payload.contents;

  if (!contents) return json({ error: 'Missing contents' }, 400);

  const body: Record<string, unknown> = { contents };
  if (payload.config) body.generationConfig = payload.config;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    const data = await resp.json();
    if (!resp.ok) {
      return json({ error: data?.error?.message || 'Gemini request failed' }, resp.status);
    }
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    return json({ text });
  } catch (e) {
    return json({ error: `Proxy error: ${e instanceof Error ? e.message : String(e)}` }, 502);
  }
});
