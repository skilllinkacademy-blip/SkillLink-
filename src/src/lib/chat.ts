import { createClient, SupabaseClient } from '@supabase/supabase-js'

type Conversation = {
  id: string
  participant_1: string
  participant_2: string
  last_message: string | null
  last_message_at: string | null
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  recipient_id: string
  content: string
  is_read: boolean
  created_at: string
}

export async function getOrCreateConversation(
  supabase: SupabaseClient,
  otherUserId: string
): Promise<Conversation | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return null
  const currentUserId = userData.user.id

  const { data: existing, error: fetchError } = await supabase
    .from('conversations')
    .select('*')
    .or(
      `and(participant_1.eq.${currentUserId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${currentUserId})`
    )
    .maybeSingle()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('getOrCreateConversation fetch error', fetchError)
    return null
  }

  if (existing) return existing as Conversation

  const { data: inserted, error: insertError } = await supabase
    .from('conversations')
    .insert({
      participant_1: currentUserId,
      participant_2: otherUserId,
    })
    .select('*')
    .single()

  if (insertError) {
    console.error('getOrCreateConversation insert error', insertError)
    return null
  }

  return inserted as Conversation
}

export async function sendMessage(
  supabase: SupabaseClient,
  conversationId: string,
  content: string
): Promise<Message | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return null
  const currentUserId = userData.user.id

  const { data: convo, error: convoError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  if (convoError || !convo) {
    console.error('sendMessage conversation error', convoError)
    return null
  }

  const recipientId =
    convo.participant_1 === currentUserId
      ? convo.participant_2
      : convo.participant_1

  const { data: inserted, error: insertError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      recipient_id: recipientId,
      content,
    })
    .select('*')
    .single()

  if (insertError) {
    console.error('sendMessage insert error', insertError)
    return null
  }

  const { error: updateError } = await supabase
    .from('conversations')
    .update({
      last_message: content,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversationId)

  if (updateError) {
    console.error('sendMessage update conversation error', updateError)
  }

  return inserted as Message
}

export async function fetchMessages(
  supabase: SupabaseClient,
  conversationId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error || !data) {
    console.error('fetchMessages error', error)
    return []
  }

  return data as Message[]
}
feat: add chat helpers
