import { supabase } from './supabase';

// Client wrapper for the server-side Gemini proxy (supabase/functions/gemini).
// Mirrors @google/genai's generateContent shape so callers stay unchanged:
//   const res = await callGemini({ model, contents, config });
//   res.text
// The Gemini API key lives only in the Edge Function's env, never in the bundle.
export interface GeminiParams {
  model?: string;
  contents: unknown;
  config?: Record<string, unknown>;
}

export async function callGemini(params: GeminiParams): Promise<{ text: string }> {
  const { data, error } = await supabase.functions.invoke('gemini', { body: params });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return { text: data?.text ?? '' };
}
