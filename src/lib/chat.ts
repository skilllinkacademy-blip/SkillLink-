import { SupabaseClient } from '@supabase/supabase-js';

export async function getOrCreateConversation(supabase: SupabaseClient, otherUserId: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not authenticated');

  const { data: existingConversation, error: fetchError } = await supabase
    .from('conversations')
    .select('*')
    .or(
      `and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`
    )
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existingConversation) {
    return existingConversation;
  }

  const { data: newConversation, error: insertError } = await supabase
    .from('conversations')
    .insert({
      participant_1: user.id,
      participant_2: otherUserId,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return newConversation;
}

export async function sendMessage(supabase: SupabaseClient, conversationId: string, content: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not authenticated');

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('participant_1, participant_2')
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) throw new Error('Conversation not found');

  const recipientId = conversation.participant_1 === user.id ? conversation.participant_2 : conversation.participant_1;

  const { data: message, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      recipient_id: recipientId,
      content: content,
    })
    .select()
    .single();

  if (msgError) throw msgError;

  const { error: updateError } = await supabase
    .from('conversations')
    .update({
      last_message: content,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  if (updateError) throw updateError;

  return message;
}

export async function fetchMessages(supabase: SupabaseClient, conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data;
}
