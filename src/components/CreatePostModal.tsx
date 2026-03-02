import React from 'react';
import { X, Image, Video, FileText, Globe, ChevronDown } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl: boolean;
}

export default function CreatePostModal({ isOpen, onClose, isRtl }: CreatePostModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-black text-black">Create a post</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-black text-lg">
              ME
            </div>
            <div>
              <span className="font-bold text-black block">My Name</span>
              <button className="text-[10px] text-gray-400 border border-gray-200 rounded-full px-3 py-1 flex items-center gap-1 font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                <Globe size={12} /> Anyone <ChevronDown size={12} />
              </button>
            </div>
          </div>

          <textarea 
            className="w-full h-48 p-0 bg-transparent border-none focus:ring-0 resize-none text-xl placeholder:text-gray-300 text-black font-medium"
            placeholder="What do you want to talk about?"
            autoFocus
          ></textarea>

          {/* Post Type Dropdown Skeleton */}
          <div className="flex gap-2">
            <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-black transition-all">
              <option>Tip</option>
              <option>Tutorial</option>
              <option>Question</option>
              <option>Mentor Offer</option>
            </select>
          </div>

          {/* Media Upload Skeleton */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-100 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Image className="w-8 h-8 mb-2 text-gray-300" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Image Upload (Click or Drag)</p>
              </div>
              <input type="file" className="hidden" />
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <div className="flex gap-2">
              <button className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all text-gray-600 hover:text-black">
                <Image size={20} />
              </button>
              <button className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all text-gray-600 hover:text-black">
                <Video size={20} />
              </button>
              <button className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all text-gray-600 hover:text-black">
                <FileText size={20} />
              </button>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-black text-white rounded-full font-black uppercase tracking-widest text-sm shadow-xl hover:bg-gray-800 transition-all active:scale-95"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
