import React from 'react';
import { X, Image, Video, FileText, Globe, ChevronDown } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl: boolean;
}

export default function CreatePostModal({ isOpen, onClose, isRtl }: CreatePostModalProps) {
  const [postType, setPostType] = React.useState('tip');
  
  const getPostPlaceholder = () => {
    switch (postType) {
      case 'tip':
        return isRtl 
          ? 'שתף טיפ מקצועי... (למשל: איך לחתוך קרמיקה בלי שהיא תישבר, או סוד לדירוג שיער מושלם)' 
          : 'Share a professional tip... (e.g. how to cut ceramics without breaking, or a secret for a perfect hair fade)';
      case 'question':
        return isRtl 
          ? 'שאל את המומחים... (למשל: איזה מברגה הכי מומלצת לעבודה בגבס? או איך פותרים תקלה X?)' 
          : 'Ask the masters... (e.g. which drill is best for drywall? or how to fix error X?)';
      case 'success':
        return isRtl 
          ? 'שתף סיפור הצלחה או פרויקט שסיימת... (למשל: לפני ואחרי של שיפוץ אמבטיה, או החניך הראשון שלי שפתח עסק)' 
          : 'Share a success story or finished project... (e.g. before & after of a bathroom renovation, or my first apprentice starting their own shop)';
      default:
        return isRtl 
          ? 'שתף משהו מהשטח...' 
          : 'Share something from the field...';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-black text-black">{isRtl ? 'צור פוסט חדש' : 'Create a post'}</h2>
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
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-black text-lg shadow-lg">
              {isRtl ? 'אני' : 'ME'}
            </div>
            <div>
              <span className="font-bold text-black block">{isRtl ? 'הפוסט שלי' : 'New Post'}</span>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] text-gray-400 border border-gray-200 rounded-full px-3 py-1 flex items-center gap-1 font-black uppercase tracking-widest cursor-default">
                  <Globe size={10} /> {isRtl ? 'כולם' : 'Anyone'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              {[
                { id: 'tip', label: isRtl ? '💡 טיפ' : '💡 Tip' },
                { id: 'question', label: isRtl ? '❓ שאלה' : '❓ Question' },
                { id: 'success', label: isRtl ? '🏆 הצלחה' : '🏆 Success' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setPostType(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                    postType === cat.id 
                      ? 'bg-black border-black text-white shadow-md' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <textarea 
              className="w-full h-40 p-4 bg-gray-50/50 rounded-2xl border-none focus:ring-2 focus:ring-black/5 resize-none text-lg placeholder:text-gray-300 text-black font-medium transition-all"
              placeholder={getPostPlaceholder()}
              autoFocus
            ></textarea>
          </div>

          {/* Media Upload Skeleton */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-100 border-dashed rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all group/upload">
              <div className="flex items-center justify-center gap-3">
                <Image className="w-6 h-6 text-slate-300 group-hover/upload:text-black transition-colors" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{isRtl ? 'הוסף תמונה או סרטון' : 'Add image or video'}</p>
              </div>
              <input type="file" className="hidden" />
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <div className="flex gap-2">
              <button className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all text-gray-600 hover:text-black group">
                <Video size={18} className="group-hover:scale-110 transition-transform" />
              </button>
              <button className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all text-gray-600 hover:text-black group">
                <FileText size={18} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-gray-800 transition-all active:scale-95"
            >
              {isRtl ? 'פרסם' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
