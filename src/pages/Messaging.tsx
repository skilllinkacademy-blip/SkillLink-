import React, { useEffect, useState } from 'react';
import {
  Search,
  MessageSquare,
  Send,
  Image,
  MoreHorizontal,
  Info,
  AlertCircle,
} from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../App';
import {
  getOrCreateConversation,
  sendMessage,
  fetchMessages,
} from '../lib/chat';

interface MessagingProps {
  isRtl: boolean;
}

type ConversationItem = {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message: string | null;
  last_message_at: string | null;
  other_user_id: string;
  other_user_name: string | null;
  has_unread: boolean;
};

type MessageItem = {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export default function Messaging({ isRtl }: MessagingProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [sending, setSending] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // 1. משתמש מחובר
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    };
    loadUser();
  }, []);

  // 2. טעינת שיחות
  useEffect(() => {
    if (!currentUserId) return;

    const loadConversations = async () => {
      setLoadingConversations(true);

      const { data, error } = await supabase
        .from('conversations')
        .select(
          `
          id,
          participant_1,
          participant_2,
          last_message,
          last_message_at,
          profile1:profiles!conversations_participant_1_fkey ( id, full_name, username ),
          profile2:profiles!conversations_participant_2_fkey ( id, full_name, username ),
          messages(count)
        `
        )
        .or(
          `participant_1.eq.${currentUserId},participant_2.eq.${currentUserId}`
        )
        .order('last_message_at', { ascending: false });

      if (error || !data) {
        console.error('Error fetching conversations:', error);
        setLoadingConversations(false);
        return;
      }

      const mapped: ConversationItem[] = (data as any[]).map((row) => {
        const isP1 = row.participant_1 === currentUserId;
        const otherProfile = isP1 ? row.profile2 : row.profile1;

        const hasUnread =
          (row.messages?.[0]?.count_unread_for_user as boolean) ?? false;

        return {
          id: row.id,
          participant_1: row.participant_1,
          participant_2: row.participant_2,
          last_message: row.last_message,
          last_message_at: row.last_message_at,
          other_user_id: otherProfile?.id ?? '',
          other_user_name:
            otherProfile?.full_name || otherProfile?.username || 'User',
          has_unread: hasUnread,
        };
      });

      setConversations(mapped);
      setLoadingConversations(false);
    };

    loadConversations();
  }, [currentUserId]);

  // 3. טעינת הודעות לשיחה שנבחרה + סימון כנקראו
  useEffect(() => {
    if (!selectedConversation || !currentUserId) return;

    const loadMessagesAndMarkRead = async () => {
      const list = await fetchMessages(supabase, selectedConversation.id);
      setMessages(list as MessageItem[]);

      // סימון כל ההודעות אליי כנקראו
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', selectedConversation.id)
        .eq('recipient_id', currentUserId)
        .eq('is_read', false);

      // עדכון מקומי – אין לא נקראו לשיחה הזו
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id ? { ...c, has_unread: false } : c
        )
      );
    };

    loadMessagesAndMarkRead();
  }, [selectedConversation, currentUserId]);

  // 4. Realtime – הודעות חדשות בשיחה שנבחרה
  useEffect(() => {
    if (!selectedConversation) return;

    const ch = supabase
      .channel(`messages-${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as MessageItem]);
        }
      )
      .subscribe();

    setChannel(ch);

    return () => {
      ch.unsubscribe();
    };
  }, [selectedConversation?.id]);

  const handleSelectConversation = (conversation: ConversationItem) => {
    setSelectedConversation(conversation);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedConversation) return;
    setSending(true);
    const msg = await sendMessage(
      supabase,
      selectedConversation.id,
      input.trim()
    );
    if (msg) {
      setMessages((prev) => [...prev, msg as MessageItem]);
      setInput('');
    }
    setSending(false);
  };

  const filteredConversations = conversations.filter((c) =>
    c.other_user_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex">
      {/* Sidebar: Chat List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100 space-y-4">
          <h1 className="text-2xl font-black text-black">Messages</h1>
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all font-medium text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loadingConversations ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <MessageSquare className="text-gray-200" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-black">No messages yet</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                  Connect with mentors or apprentices to start a conversation.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredConversations.map((chat) => (
                <li
                  key={chat.id}
                  onClick={() => handleSelectConversation(chat)}
                  className={`p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-all ${
                    selectedConversation?.id === chat.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-black">
                      {chat.other_user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-black">
                        {chat.other_user_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">
                        {chat.last_message || 'Start the conversation'}
                      </p>
                    </div>
                  </div>

                  {chat.has_unread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main: Chat Interface */}
      <div className="hidden md:flex flex-1 flex-col bg-gray-50/30">
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
              <MessageSquare className="text-gray-200" size={48} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-black tracking-tight">
                Select a conversation
              </h2>
              <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                Choose a chat from the sidebar to start messaging. Your
                conversations are private and secure.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-8 py-4 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-black">
                  {selectedConversation.other_user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-black">
                    {selectedConversation.other_user_name}
                  </h3>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                    Messages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black">
                  <Info size={20} />
                </button>
                <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-red-500">
                  <AlertCircle size={20} />
                </button>
                <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
              {messages.map((m) => {
                const isMine = m.sender_id === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={`flex ${
                      isMine ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                        isMine
                          ? 'bg-black text-white rounded-br-sm'
                          : 'bg-gray-100 text-black rounded-bl-sm'
                      }`}
                    >
                      <p>{m.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Area */}
            <div className="p-8 bg-white border-t border-gray-100">
              <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-transparent focus-within:border-black transition-all shadow-inner">
                <button className="p-3 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-black shadow-sm">
                  <Image size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 bg-transparent border-none focus:ring-0 font-medium text-black"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
