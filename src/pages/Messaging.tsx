import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Send, Image, MoreHorizontal, User, Info, AlertCircle, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getOrCreateConversation, sendMessage as sendChatMessage, fetchMessages as fetchChatMessages } from '../lib/chat';
import { resolveAsset } from '../lib/assets';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  other_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    occupation?: string;
    username?: string;
  };
  unread_count: number;
}

interface MessagingProps {
  isRtl: boolean;
}

export default function Messaging({ isRtl }: MessagingProps) {
  const { user, refreshUnreadCount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle recipient from location state (e.g. from "Send Message" button)
  useEffect(() => {
    const state = location.state as { recipientId?: string; recipientName?: string };
    if (state?.recipientId) {
      setSelectedOtherUserId(state.recipientId);
      fetchConversations();
    } else {
      fetchConversations();
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedOtherUserId) {
      const setupChat = async () => {
        try {
          const conv = await getOrCreateConversation(supabase, selectedOtherUserId);
          setSelectedConversationId(conv.id);
        } catch (err) {
          console.error('Error setting up chat:', err);
        }
      };
      setupChat();
    }
  }, [selectedOtherUserId]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);

      // Subscribe to new messages for this conversation
      const channel = supabase
        .channel(`chat:${selectedConversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selectedConversationId}`
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (newMsg.sender_id !== user?.id) {
              setMessages((prev) => [...prev, newMsg]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversationId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversationId && messages.length > 0) {
      const hasUnread = messages.some(m => m.recipient_id === user?.id && !m.is_read);
      if (hasUnread) {
        markAsRead(selectedConversationId);
      }
    }
  }, [messages, selectedConversationId, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch conversations
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          p1:profiles!participant_1(id, full_name, avatar_url, occupation, username),
          p2:profiles!participant_2(id, full_name, avatar_url, occupation, username)
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      // Fetch unread counts for each conversation
      const { data: unreadData, error: unreadError } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (unreadError) throw unreadError;

      const unreadCounts = unreadData.reduce((acc: Record<string, number>, msg) => {
        acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
        return acc;
      }, {});

      const formattedConversations: Conversation[] = convData.map(conv => {
        const otherUser = conv.participant_1 === user.id ? conv.p2 : conv.p1;
        return {
          ...conv,
          other_user: otherUser,
          unread_count: unreadCounts[conv.id] || 0
        };
      });

      setConversations(formattedConversations);
      
      // Update global unread count
      refreshUnreadCount();
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;
    
    try {
      // Update DB
      const { data: updatedMessages, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .eq('is_read', false)
        .select();

      if (error) throw error;

      // Update local conversation unread count
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c));
      
      // Update global unread count
      refreshUnreadCount();
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user || !selectedConversationId) return;
    
    setSending(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/messages/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Reusing avatars bucket for simplicity
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Send message with image URL using the new sendMessage function
      const data = await sendChatMessage(supabase, selectedConversationId, `[IMAGE:${publicUrl}]`);

      setMessages((prev) => [...prev, data as Message]);
      
      // Update conversation list
      setConversations(prev => {
        const existing = prev.find(c => c.id === selectedConversationId);
        if (existing) {
          return [
            { ...existing, last_message: '📷 Image', last_message_at: data.created_at },
            ...prev.filter(c => c.id !== selectedConversationId)
          ];
        }
        return prev;
      });
    } catch (err: any) {
      console.error('Error uploading image:', err.message);
      alert(isRtl ? 'שגיאה בהעלאת תמונה: ' + err.message : 'Error uploading image: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const renderMessageContent = (content: string) => {
    if (content.startsWith('[IMAGE:') && content.endsWith(']')) {
      const url = content.substring(7, content.length - 1);
      return <img src={url} alt="Attachment" className="max-w-full rounded-lg mt-1 mb-1" style={{ maxHeight: '200px' }} />;
    }
    return content;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConversationId || !newMessage.trim() || sending) return;

    setSending(true);
    const msgContent = newMessage.trim();
    setNewMessage('');

    try {
      const data = await sendChatMessage(supabase, selectedConversationId, msgContent);

      setMessages((prev) => [...prev, data as Message]);
      
      // Update conversation list last message
      setConversations(prev => {
        const existing = prev.find(c => c.id === selectedConversationId);
        if (existing) {
          return [
            { ...existing, last_message: msgContent, last_message_at: data.created_at },
            ...prev.filter(c => c.id !== selectedConversationId)
          ];
        }
        return prev;
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setNewMessage(msgContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.other_user?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="h-full bg-white overflow-hidden flex animate-in fade-in duration-500">
      {/* Sidebar: Chat List */}
      <div className={`w-full md:w-72 lg:w-80 border-r border-slate-100 flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 space-y-3">
          <h1 className="text-base font-bold text-slate-900">{isRtl ? 'הודעות' : 'Messages'}</h1>
          <div className="relative">
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={15} />
            <input
              type="text"
              placeholder={isRtl ? 'חפש...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-2.5 bg-slate-50 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversationId(conv.id);
                    setSelectedOtherUserId(conv.other_user?.id || null);
                  }}
                  className={`w-full p-3.5 flex gap-3 hover:bg-slate-50 transition-all text-start relative ${
                    selectedConversationId === conv.id ? 'bg-slate-50' : ''
                  }`}
                >
                  {selectedConversationId === conv.id && (
                    <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} bottom-0 w-0.5 bg-slate-900`} />
                  )}
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm relative shrink-0 overflow-hidden border border-slate-200">
                    {conv.other_user?.avatar_url ? (
                      <img src={resolveAsset(conv.other_user.avatar_url) || ''} alt={conv.other_user.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      conv.other_user?.full_name?.charAt(0) || 'U'
                    )}
                    {conv.unread_count > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className={`text-sm font-semibold truncate ${conv.unread_count > 0 ? 'text-slate-900' : 'text-slate-700'}`}>{conv.other_user?.full_name}</span>
                      {conv.last_message_at && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                      {conv.last_message || (isRtl ? 'התחל שיחה...' : 'Start a conversation...')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto border border-slate-100">
                <MessageSquare className="text-slate-200" size={20} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-slate-700">{isRtl ? 'אין הודעות' : 'No messages yet'}</p>
              <p className="text-xs text-slate-400 max-w-[180px] mx-auto">
                {isRtl ? 'התחבר למנטורים או מתלמדים כדי להתחיל שיחה.' : 'Connect with mentors or apprentices to start a conversation.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main: Chat Interface */}
      <div className={`flex-1 flex flex-col ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        {!selectedConversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
              <MessageSquare className="text-slate-200" size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">{isRtl ? 'בחר שיחה' : 'Select a conversation'}</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                {isRtl
                  ? 'בחר צ׳אט מהרשימה כדי להתחיל להתכתב.'
                  : 'Choose a chat from the list to start messaging.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex justify-between items-center">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  if (selectedConversation?.other_user?.username) {
                    navigate(`/app/u/${selectedConversation.other_user.username}`);
                  }
                }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedConversationId(null); }}
                  className="md:hidden p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft size={18} className="rtl:rotate-180" />
                </button>
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm overflow-hidden border border-slate-200">
                  {selectedConversation?.other_user?.avatar_url ? (
                    <img src={resolveAsset(selectedConversation.other_user.avatar_url) || ''} alt={selectedConversation.other_user.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    selectedConversation?.other_user?.full_name?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors">{selectedConversation?.other_user?.full_name || (isRtl ? 'טוען...' : 'Loading...')}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {selectedConversation?.other_user?.occupation || (isRtl ? 'חבר קהילה' : 'Community member')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-700">
                  <Info size={16} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-700">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
              {messages.map((msg, idx) => {
                const isOwn = msg.sender_id === user?.id;
                const showDate = idx === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[idx-1].created_at).toDateString();

                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center py-2">
                        <span className="px-3 py-1 bg-white border border-slate-200 text-[10px] font-medium text-slate-400 rounded-full">
                          {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[72%] space-y-1`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isOwn
                            ? 'bg-slate-900 text-white rounded-tr-sm'
                            : 'bg-white text-slate-900 border border-slate-100 rounded-tl-sm shadow-sm'
                        }`}>
                          {renderMessageContent(msg.content)}
                        </div>
                        <div className={`flex items-center gap-1.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && (
                            msg.is_read
                              ? <CheckCheck size={12} className="text-emerald-500" />
                              : <Check size={12} className="text-slate-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-50 pl-2 pr-2 py-2 rounded-xl border border-slate-200 focus-within:border-slate-400 transition-colors">
                <label className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer rounded-lg transition-colors">
                  <Image size={16} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={sending} />
                </label>
                <input
                  type="text"
                  placeholder={isRtl ? 'הקלד הודעה...' : 'Type a message...'}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors active:scale-95 disabled:opacity-40"
                >
                  <Send size={14} className={isRtl ? 'rotate-180' : ''} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
