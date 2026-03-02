import React, { useState } from 'react';
import { Plus, Briefcase, MessageSquare, Share2, Heart, Clock, Globe, MoreHorizontal } from 'lucide-react';
import CreatePostModal from '../components/CreatePostModal';

interface HomeProps {
  isRtl: boolean;
}

export default function Home({ isRtl }: HomeProps) {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Skeleton */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="h-20 bg-gray-50" />
            <div className="px-6 pb-6 -mt-10 text-center">
              <div className="w-20 h-20 rounded-2xl bg-black border-4 border-white mx-auto flex items-center justify-center text-white font-black text-2xl shadow-xl">
                ME
              </div>
              <h3 className="mt-4 font-black text-black">My Name</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Apprentice • Trade</p>
            </div>
            <div className="border-t border-gray-50 p-4 space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-400 uppercase tracking-widest">Profile views</span>
                <span className="text-black">0</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-400 uppercase tracking-widest">Post impressions</span>
                <span className="text-black">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-6 space-y-6">
          {/* Create Post Trigger */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-black text-lg shadow-md">
              ME
            </div>
            <button 
              onClick={() => setIsPostModalOpen(true)}
              className="flex-1 text-left px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 font-bold transition-all border border-transparent hover:border-gray-200"
            >
              Start a post...
            </button>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-16 text-center space-y-8 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Briefcase className="text-gray-200" size={48} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-black tracking-tight">No posts yet.</h2>
              <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                Be the first to join SkillLink in your area! Share your skills, ask questions, or find a mentor.
              </p>
            </div>
            <button 
              onClick={() => setIsPostModalOpen(true)}
              className="px-10 py-4 bg-black text-white rounded-full font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Create Post
            </button>
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-black text-black mb-4 uppercase tracking-widest text-xs">Trending Trades</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-black">Trade Name</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">0 active mentors</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Create Post Button */}
      <button 
        onClick={() => setIsPostModalOpen(true)}
        className="lg:hidden fixed bottom-8 right-8 w-16 h-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-800 transition-all active:scale-90 z-40"
      >
        <Plus size={32} />
      </button>

      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        isRtl={isRtl}
      />
    </div>
  );
}
