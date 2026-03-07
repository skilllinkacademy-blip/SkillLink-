import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Send, Image, MoreHorizontal, User, Info, AlertCircle, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getOrCreateConversation, sendMessage as sendChatMessage, fetchMessages as fetchChatMessages } from '../lib/chat';

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
    <div className="h-[calc(100vh-8rem)] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex">
      {/* Sidebar: Chat List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-gray-100 space-y-4">
          <h1 className="text-2xl font-black text-black">{isRtl ? 'הודעות' : 'Messages'}</h1>
          <div className="relative group">
            <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors`} size={18} />
            <input 
              type="text" 
              placeholder={isRtl ? 'חפש הודעות...' : 'Search messages...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all font-medium text-sm`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-50 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversationId(conv.id);
                    setSelectedOtherUserId(conv.other_user?.id || null);
                  }}
                  className={`w-full p-4 flex gap-4 hover:bg-gray-50 transition-all text-start relative ${
                    selectedConversationId === conv.id ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black relative shrink-0 overflow-hidden">
                    {conv.other_user?.avatar_url ? (
                      <img src={conv.other_user.avatar_url} alt={conv.other_user.full_name} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                    ) : (
                      conv.other_user?.full_name?.charAt(0) || 'U'
                    )}
                    {conv.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 truncate">{conv.other_user?.full_name}</h4>
                      {conv.last_message_at && (
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                      {conv.last_message || (isRtl ? 'התחל שיחה...' : 'Start a conversation...')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <MessageSquare className="text-gray-200" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-black">{isRtl ? 'אין הודעות' : 'No messages yet'}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                  {isRtl ? 'התחבר למנטורים או מתלמדים כדי להתחיל שיחה.' : 'Connect with mentors or apprentices to start a conversation.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main: Chat Interface */}
      <div className={`flex-1 flex flex-col bg-gray-50/30 ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        {!selectedConversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
              <MessageSquare className="text-gray-200" size={48} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-black tracking-tight">{isRtl ? 'בחר שיחה' : 'Select a conversation'}</h2>
              <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                {isRtl 
                  ? 'בחר צ׳אט מהרשימה כדי להתחיל להתכתב. השיחות שלך פרטיות ומאובטחות.' 
                  : 'Choose a chat from the sidebar to start messaging. Your conversations are private and secure.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-8 py-4 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm">
              <div 
                className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (selectedConversation?.other_user?.username) {
                    navigate(`/app/u/${selectedConversation.other_user.username}`);
                  }
                }}
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedConversationId(null);
                  }} 
                  className="md:hidden p-2 -ml-2 text-gray-400 hover:text-black"
                >
                  <ArrowLeft size={20} className="rtl:rotate-180" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-black overflow-hidden">
                  {selectedConversation?.other_user?.avatar_url ? (
                    <img src={selectedConversation.other_user.avatar_url} alt={selectedConversation.other_user.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    selectedConversation?.other_user?.full_name?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-black">{selectedConversation?.other_user?.full_name || (isRtl ? 'טוען...' : 'Loading...')}</h3>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black">
                  <Info size={20} />
                </button>
                <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {messages.map((msg, idx) => {
                const isOwn = msg.sender_id === user?.id;
                const showDate = idx === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[idx-1].created_at).toDateString();
                
                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center">
                        <span className="px-3 py-1 bg-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-full">
                          {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                          isOwn ? 'bg-black text-white rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'
                        }`}>
                          {renderMessageContent(msg.content)}
                        </div>
                        <div className={`flex items-center gap-1.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[9px] text-gray-400 font-bold">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && (
                            msg.is_read ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} className="text-gray-300" />
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
            <div className="p-8 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-transparent focus-within:border-black transition-all shadow-inner">
                <label className="p-3 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-black shadow-sm cursor-pointer">
                  <Image size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={sending} />
                </label>
                <input 
                  type="text" 
                  placeholder={isRtl ? 'הקלד הודעה...' : 'Type a message...'}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 font-medium text-black"
                  disabled={sending}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
