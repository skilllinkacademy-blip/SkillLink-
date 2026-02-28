import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, Edit, Image, Paperclip, Smile, Send, ChevronLeft, User, MessageSquare, Hammer, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { messageService } from '../services/api';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Messaging() {
  const { lang, t } = useLanguage();
  const isHe = lang === 'he';
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('user');

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    
    // Listen for new messages via Socket.IO
    const handleNewMessage = (msg: any) => {
      if (activeChat && (msg.senderId === activeChat.id || msg.receiverId === activeChat.id)) {
        setMessages(prev => [...prev, msg]);
      }
      fetchConversations(); // Refresh list to show latest message
    };

    messageService.onMessage(handleNewMessage);
    return () => {
      // Cleanup listener if needed (messageService should handle it)
    };
  }, [activeChat]);

  useEffect(() => {
    if (initialUserId) {
      startNewChat(initialUserId);
    }
  }, [initialUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await messageService.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = async (userId: string) => {
    try {
      const response = await messageService.getMessages(userId);
      setMessages(response.data);
      // Find user info from conversations or fetch if needed
      const existing = conversations.find(c => c.id === userId);
      if (existing) {
        setActiveChat(existing);
      } else {
        // Mock active chat info until we have a way to fetch user by ID easily
        setActiveChat({ id: userId, name: 'User', trade: 'Mentor' });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const msg = {
        receiverId: activeChat.id,
        content: newMessage.trim()
      };
      await messageService.sendMessage(msg);
      setNewMessage('');
      // Local update will happen via Socket.IO listener or we can manually add it
      // For better UX, let's manually add it if socket is slow
      const localMsg = {
        id: Date.now().toString(),
        senderId: 'me', // backend will replace
        receiverId: activeChat.id,
        content: newMessage.trim(),
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, localMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 h-[calc(100vh-120px)]">
      <div className="linkedin-card h-full overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Left Pane - Chat List */}
        <div className={`w-full md:w-[320px] lg:w-[400px] border-r border-gray-50 flex flex-col h-full bg-white ${activeChat && 'hidden md:flex'}`}>
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-black text-black">{isHe ? 'הודעות' : 'Messaging'}</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black"><MoreHorizontal size={20} /></button>
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black"><Edit size={20} /></button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="relative">
              <Search className={`absolute ${isHe ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
              <input 
                type="text" 
                placeholder={isHe ? 'חפש הודעות...' : 'Search messages...'}
                className={`w-full ${isHe ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all text-sm font-medium`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-12 bg-gray-100 rounded-full" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-2 bg-gray-100 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 h-full">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                  <MessageSquare size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-black">{isHe ? 'אין הודעות עדיין' : 'No messages yet'}</h3>
                  <p className="text-xs text-gray-400 font-medium">{isHe ? 'ההודעות שלך עם מנטורים ואפליקנטים יופיעו כאן.' : 'Your messages with mentors and apprentices will appear here.'}</p>
                </div>
              </div>
            ) : (
              conversations.map((chat) => (
                <button 
                  key={chat.id}
                  onClick={() => startNewChat(chat.id)}
                  className={`w-full p-4 flex gap-4 hover:bg-gray-50 transition-all border-b border-gray-50 text-left ${activeChat?.id === chat.id ? 'bg-gray-50' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-black shrink-0 shadow-lg">
                    {chat.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-black truncate text-sm">{chat.name}</h4>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{chat.lastMessageTime}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate font-medium">{chat.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Pane - Conversation */}
        <div className={`flex-1 flex flex-col h-full bg-white ${!activeChat && 'hidden md:flex'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveChat(null)} className="md:hidden p-2 hover:bg-gray-50 rounded-full">
                    <ChevronLeft size={20} className={isHe ? 'rotate-180' : ''} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-black text-xs shadow-md">
                    {activeChat.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-black text-sm truncate">{activeChat.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">{activeChat.trade}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black"><MoreHorizontal size={20} /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === 'me' || msg.senderId === msg.currentUserId; // currentUserId needs to be passed
                  return (
                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${isMe ? 'bg-black text-white rounded-tr-none' : 'bg-white text-black border border-gray-100 rounded-tl-none'}`}>
                        <p>{msg.content}</p>
                        <span className={`text-[9px] mt-2 block font-bold uppercase tracking-wider ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-50 bg-white">
                <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
                  <textarea 
                    rows={1}
                    placeholder={isHe ? 'כתוב הודעה...' : 'Write a message...'}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all resize-none font-medium text-sm"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button type="button" className="p-2.5 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black"><Image size={20} /></button>
                      <button type="button" className="p-2.5 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black"><Paperclip size={20} /></button>
                      <button type="button" className="p-2.5 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black"><Smile size={20} /></button>
                    </div>
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-black text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50 shadow-xl active:scale-95 flex items-center gap-2"
                    >
                      {isHe ? 'שלח' : 'Send'}
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                <Send size={48} />
              </div>
              <div className="space-y-2 max-w-sm">
                <h2 className="text-2xl font-black text-black">{isHe ? 'התחל שיחה' : 'Start a Conversation'}</h2>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  {isHe ? 'כאשר תתחבר למנטור או תשלח בקשת התמחות, תוכל לנהל כאן את כל התקשורת שלך.' : 'When you connect with a mentor or send an apprenticeship request, you can manage all your communication here.'}
                </p>
              </div>
              <Link to="/explore" className="btn-primary px-10">
                {isHe ? 'מצא מנטור' : 'Find a Mentor'}
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
