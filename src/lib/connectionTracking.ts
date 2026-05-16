import { SupabaseClient } from '@supabase/supabase-js';

const ACTIVE_THRESHOLD = 3;

export async function checkAndUpdateConnectionStatus(
  supabase: SupabaseClient,
  conversationId: string
): Promise<void> {
  try {
    const { data: conv } = await supabase
      .from('conversations')
      .select('participant_1, participant_2, connection_status')
      .eq('id', conversationId)
      .single();

    if (!conv || conv.connection_status !== 'new') return;

    const [{ count: p1Count }, { count: p2Count }] = await Promise.all([
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('sender_id', conv.participant_1),
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('sender_id', conv.participant_2),
    ]);

    if ((p1Count ?? 0) >= ACTIVE_THRESHOLD && (p2Count ?? 0) >= ACTIVE_THRESHOLD) {
      await supabase
        .from('conversations')
        .update({
          connection_status: 'active',
          connection_status_updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
    }
  } catch {
    // Non-critical — do not surface to user
  }
}

export async function markConversationCompleted(
  supabase: SupabaseClient,
  userId: string,
  otherUserId: string
): Promise<void> {
  try {
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`
      )
      .maybeSingle();

    if (!conv) return;

    await supabase
      .from('conversations')
      .update({
        connection_status: 'completed',
        connection_status_updated_at: new Date().toISOString(),
      })
      .eq('id', conv.id);
  } catch {
    // Non-critical — do not surface to user
  }
}

export async function getConnectionSuccessMetrics(
  supabase: SupabaseClient
): Promise<{ total: number; active: number; completed: number; successRate: number }> {
  const [
    { count: total },
    { count: active },
    { count: completed },
  ] = await Promise.all([
    supabase.from('conversations').select('id', { count: 'exact', head: true }),
    supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('connection_status', 'active'),
    supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('connection_status', 'completed'),
  ]);

  const meaningful = (active ?? 0) + (completed ?? 0);
  const successRate = meaningful > 0 ? Math.round(((completed ?? 0) / meaningful) * 100) : 0;

  return {
    total: total ?? 0,
    active: active ?? 0,
    completed: completed ?? 0,
    successRate,
  };
}
