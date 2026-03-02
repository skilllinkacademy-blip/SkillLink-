import React, { useState } from 'react';
import { Search, MessageSquare, Send, Image, MoreHorizontal, User, Info, AlertCircle } from 'lucide-react';

interface MessagingProps {
  isRtl: boolean;
}

export default function Messaging({ isRtl }: MessagingProps) {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex">
      {/* Sidebar: Chat List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100 space-y-4">
          <h1 className="text-2xl font-black text-black">Messages</h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search messages..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all font-medium text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Empty Chat List State */}
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
        </div>
      </div>

      {/* Main: Chat Interface */}
      <div className="hidden md:flex flex-1 flex-col bg-gray-50/30">
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
              <MessageSquare className="text-gray-200" size={48} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-black tracking-tight">Select a conversation</h2>
              <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                Choose a chat from the sidebar to start messaging. Your conversations are private and secure.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-8 py-4 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-black">
                  U
                </div>
                <div>
                  <h3 className="font-bold text-black">User Name</h3>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Online</p>
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
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {/* Messages would go here */}
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
                  className="flex-1 bg-transparent border-none focus:ring-0 font-medium text-black"
                />
                <button className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-xl active:scale-95">
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
