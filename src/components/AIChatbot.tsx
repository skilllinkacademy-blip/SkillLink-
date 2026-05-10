import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2, Users, Zap, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIChatResponse } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface AIChatbotProps {
  isRtl: boolean;
}

export default function AIChatbot({ isRtl }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: isRtl ? 'היי! אני העוזר החכם של SkillLink. איך אני יכול לעזור לך היום?' : 'Hi! I am the SkillLink AI Assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await getAIChatResponse(
        [...messages, { role: 'user', content: userMessage }],
        isRtl
      );
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error('Chat Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = isRtl ? [
    { id: 'apprentice', label: 'איך מוצאים חניך?', icon: Users },
    { id: 'mentor', label: 'איך אני הופך למנטור?', icon: Sparkles },
    { id: 'match', label: 'מה זה ציון התאמה?', icon: Zap },
    { id: 'cost', label: 'כמה זה עולה?', icon: DollarSign }
  ] : [
    { id: 'apprentice', label: 'How to find apprentice?', icon: Users },
    { id: 'mentor', label: 'How to become master?', icon: Sparkles },
    { id: 'match', label: 'What is match score?', icon: Zap },
    { id: 'cost', label: 'What is the cost?', icon: DollarSign }
  ];

  return (
    <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-[999]`}>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] shadow-[0_20px_40px_rgba(15,23,42,0.4)] flex items-center justify-center relative group overflow-hidden"
            id="ai-chat-trigger"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageSquare size={28} className="relative z-10" />
            <div className="absolute top-3 right-3 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse shadow-lg" />
            
            {/* Tooltip */}
            <div className={`absolute ${isRtl ? 'right-full mr-4' : 'left-full ml-4'} top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl`}>
              {isRtl ? 'שאל את העוזר החכם' : 'Ask AI Assistant'}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 200, opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ y: 200, opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            className="w-[350px] md:w-[420px] h-[600px] bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.25)] border border-slate-100 flex flex-col overflow-hidden relative"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-900 to-transparent opacity-5" />

            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-[1.1rem] flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent group-hover:scale-150 transition-transform duration-700" />
                  <Sparkles size={24} className="text-emerald-400 relative z-10" />
                </div>
                <div>
                  <h4 className="text-base font-black tracking-tight leading-none mb-1">SkillLink AI</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'זמין תמיד' : 'Always Active'}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all bg-white/5 active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#FDFDFD]">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-1 shadow-sm ${
                      m.role === 'user' ? 'bg-white text-slate-400 border border-slate-100' : 'bg-slate-900 text-emerald-400'
                    }`}>
                      {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] flex gap-3">
                    <div className="w-8 h-8 rounded-lg shrink-0 bg-slate-900 text-emerald-400 flex items-center justify-center shadow-md">
                      <Bot size={14} />
                    </div>
                    <div className="p-5 rounded-[1.5rem] rounded-tl-none bg-white border border-slate-100 shadow-sm flex gap-1">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quick Actions */}
              {messages.length === 1 && !isLoading && (
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        setInput(action.label);
                        // Trigger send manually or just let them click send
                      }}
                      className="p-4 bg-white border border-slate-100 rounded-2xl text-start hover:border-slate-900 hover:shadow-md transition-all group"
                    >
                      <action.icon size={18} className="text-slate-400 group-hover:text-emerald-500 mb-2 transition-colors" />
                      <div className="text-[10px] font-black text-slate-900 leading-tight uppercase tracking-widest">{action.label}</div>
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Overlay */}
            <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
              <form onSubmit={handleSend} className="relative group/form">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isRtl ? 'איך אפשר לעזור?' : 'How can I help?'}
                  className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-8 focus:ring-slate-900/5 transition-all outline-none"
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`absolute ${isRtl ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 transition-all shadow-xl`}
                >
                  <Send size={18} className={isRtl ? 'rotate-180' : ''} />
                </button>
              </form>
              <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
                Powered by Gemini AI • SkillLink Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
