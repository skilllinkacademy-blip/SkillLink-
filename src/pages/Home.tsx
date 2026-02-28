import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image, Video, ThumbsUp, MessageSquare, Share2, Clock, Globe, MoreHorizontal, Calendar, ChevronDown, Hammer, ShieldCheck, CheckCircle2, Target, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/ui/Modal';
import { motion, AnimatePresence } from 'motion/react';
import { postService } from '../services/api';

interface PostData {
  id: string;
  userId: string;
  authorName: string;
  authorTrade: string;
  content: string;
  image?: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
}

interface HomeProps {
  user: any;
}

export default function Home({ user }: HomeProps) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const isHe = lang === 'he';
  
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postService.getPosts();
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!postText.trim()) return;
    
    try {
      await postService.createPost({ content: postText, image: postImage });
      showToast(isHe ? 'הפוסט פורסם!' : 'Post shared!', 'success');
      setPostText('');
      setPostImage(null);
      setIsPostModalOpen(false);
      fetchPosts();
    } catch (error) {
      showToast(isHe ? 'שגיאה בפרסום הפוסט' : 'Error sharing post', 'error');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await postService.likePost(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar - Mini Profile */}
        <div className="hidden lg:block col-span-1">
          <div className="linkedin-card p-0 sticky top-24">
            <div className="h-20 bg-black" />
            <div className="px-4 pb-4 -mt-10 text-center">
              <div className="w-20 h-20 rounded-full bg-white p-1 mx-auto">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-xl font-black">
                  {user?.name?.substring(0, 2).toUpperCase() || 'ME'}
                </div>
              </div>
              <h2 className="mt-3 font-black text-black text-lg">{user?.name}</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{user?.trade || user?.role}</p>
            </div>
            <div className="border-t border-gray-50 p-4 space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-400 uppercase tracking-wider">{isHe ? 'פרופיל' : 'Profile'}</span>
                <span className="text-black">100%</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-black h-full w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Feed */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          {/* Create Post Box */}
          <div className="linkedin-card p-5">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-black shrink-0">
                {user?.name?.substring(0, 2).toUpperCase() || 'ME'}
              </div>
              <button 
                onClick={() => setIsPostModalOpen(true)}
                className="flex-1 bg-gray-50 border border-gray-100 rounded-full px-6 text-left text-gray-400 font-medium hover:bg-gray-100 transition-all"
              >
                {isHe ? 'שתף עדכון מהשטח...' : 'Share an update from the field...'}
              </button>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-50">
              <button onClick={() => setIsPostModalOpen(true)} className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider hover:text-black transition-all">
                <Image size={18} className="text-black" /> {isHe ? 'תמונה' : 'Photo'}
              </button>
              <button onClick={() => setIsPostModalOpen(true)} className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider hover:text-black transition-all">
                <Video size={18} className="text-black" /> {isHe ? 'וידאו' : 'Video'}
              </button>
              <button onClick={() => setIsPostModalOpen(true)} className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider hover:text-black transition-all">
                <Calendar size={18} className="text-black" /> {isHe ? 'אירוע' : 'Event'}
              </button>
            </div>
          </div>

          {/* Feed Content */}
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="linkedin-card p-6 animate-pulse space-y-4">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-1/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-24 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="linkedin-card p-12 text-center space-y-6">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <Hammer className="text-black" size={48} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-black">
                    {isHe ? 'היה הראשון להצטרף ל-SkillLink באזורך!' : 'Be the first to join SkillLink in your area!'}
                  </h2>
                  <p className="text-gray-400 font-medium max-w-sm mx-auto">
                    {isHe ? 'שתף את העבודה שלך, מצא חניכים או מנטורים והתחל לבנות את העתיד.' : 'Share your work, find apprentices or mentors, and start building the future.'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsPostModalOpen(true)}
                  className="btn-primary"
                >
                  {isHe ? 'צור את הפוסט הראשון' : 'Create the first post'}
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {posts.map((post) => (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="linkedin-card"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-black shrink-0">
                            {post.authorName?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <Link to={`/profile/${post.userId}`} className="font-bold text-black hover:underline transition-colors text-sm truncate block">
                              {post.authorName}
                            </Link>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate leading-tight">{post.authorTrade}</p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 font-medium">
                              <Clock size={10} /> {new Date(post.createdAt).toLocaleDateString()} • <Globe size={10} />
                            </p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-black p-1">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>
                      <div className="text-black text-sm leading-relaxed space-y-4 mt-4 font-medium">
                        <p className="whitespace-pre-wrap">{post.content}</p>
                        {post.image && (
                          <div className="rounded-xl overflow-hidden border border-gray-50">
                            <img src={post.image} alt="Post content" className="w-full h-auto" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-5 py-3 border-t border-gray-50 flex justify-between">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${post.isLiked ? 'text-black' : 'text-gray-400 hover:text-black'}`}
                      >
                        <ThumbsUp size={18} className={post.isLiked ? 'fill-current' : ''} />
                        {post.likesCount || 0}
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-black text-xs font-black uppercase tracking-widest transition-all">
                        <MessageSquare size={18} />
                        {isHe ? 'תגובה' : 'Comment'}
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-black text-xs font-black uppercase tracking-widest transition-all">
                        <Share2 size={18} />
                        {isHe ? 'שתף' : 'Share'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right Sidebar - Beta Info */}
        <div className="hidden lg:block col-span-1">
          <div className="linkedin-card p-6 sticky top-24 space-y-8">
            <div className="space-y-4">
              <h3 className="font-black text-black flex items-center gap-2 text-sm uppercase tracking-wider">
                <ShieldCheck className="text-black" size={20} />
                {isHe ? 'סטטוס בטא' : 'Beta Status'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                {isHe ? 'SkillLink נמצא כרגע בגרסת בטא סגורה. אנחנו מאשרים מנטורים באופן ידני כדי להבטיח איכות.' : 'SkillLink is currently in closed beta. We are manually approving mentors to ensure quality.'}
              </p>
            </div>

            <div className="pt-6 border-t border-gray-50 space-y-6">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {isHe ? 'היעדים שלנו' : 'Our Goals'}
              </h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                    <CheckCircle2 size={16} className="text-black" />
                  </div>
                  <p className="text-xs text-black font-bold leading-tight">
                    {isHe ? 'בניית רשת מנטורים מאומתים' : 'Build a network of verified mentors'}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                    <Target size={16} className="text-black" />
                  </div>
                  <p className="text-xs text-black font-bold leading-tight">
                    {isHe ? 'יצירת 100 התמחויות ראשונות' : 'Create first 100 apprenticeships'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Create Post Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title={isHe ? 'צור פוסט חדש' : 'Create a post'}
      >
        <div className="space-y-6">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-black">
              {user?.name?.substring(0, 2).toUpperCase() || 'ME'}
            </div>
            <div>
              <span className="font-bold text-black block">{user?.name}</span>
              <button className="text-[10px] text-gray-400 border border-gray-200 rounded-full px-3 py-1 flex items-center gap-1 font-black uppercase tracking-widest">
                <Globe size={12} /> {isHe ? 'ציבורי' : 'Anyone'} <ChevronDown size={12} />
              </button>
            </div>
          </div>
          <textarea 
            className="w-full h-48 p-0 bg-transparent border-none focus:ring-0 resize-none text-xl placeholder:text-gray-300 text-black font-medium"
            placeholder={isHe ? 'על מה תרצה לדבר?' : 'What do you want to talk about?'}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            autoFocus
          ></textarea>
          
          {postImage && (
            <div className="relative rounded-2xl overflow-hidden border border-gray-100">
              <img src={postImage} alt="Preview" className="w-full h-auto" />
              <button 
                onClick={() => setPostImage(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black transition-all"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-gray-50">
            <div className="flex gap-2">
              <label className="p-3 bg-gray-50 rounded-full cursor-pointer hover:bg-gray-100 transition-all">
                <Image size={20} className="text-black" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <button className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all">
                <Video size={20} className="text-black" />
              </button>
            </div>
            <button 
              onClick={handlePost}
              disabled={!postText.trim()}
              className={`btn-primary px-10 py-3 ${!postText.trim() && 'opacity-50 cursor-not-allowed'}`}
            >
              {t('feed.post')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
