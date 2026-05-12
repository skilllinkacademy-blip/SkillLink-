import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ArrowRight, ArrowLeft, Loader2, User as UserIcon, ShieldCheck, Filter, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface ReviewsPageProps {
  isRtl: boolean;
}

export default function ReviewsPage({ isRtl }: ReviewsPageProps) {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [reviewsData, setReviewsData] = useState<{
    reviews: any[];
    stats: any;
    distribution: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get profile by username
        const { data: profileData, error: pError } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, role, is_verified, occupation')
          .eq('username', username)
          .single();

        if (pError) throw pError;
        setProfile(profileData);

        // 2. Get reviews with reviewer info from Supabase
        const { data: rawReviews } = await supabase
          .from('reviews')
          .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url, username, is_verified)')
          .eq('profile_id', profileData.id)
          .order('created_at', { ascending: false });

        const reviews = (rawReviews || []).map((r: any) => ({
          id: r.id,
          professional: r.professionalism ?? r.professional ?? 0,
          teaching: r.teaching_quality ?? r.teaching ?? 0,
          workEthic: r.work_ethic ?? 0,
          reliability: r.reliability ?? 0,
          comment: r.comment || '',
          createdAt: r.created_at,
          fromName: r.reviewer?.full_name || 'Anonymous',
          fromAvatar: r.reviewer?.avatar_url || null,
          fromVerified: r.reviewer?.is_verified ? 1 : 0,
        }));

        // Compute stats locally
        const total = reviews.length;
        const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        const overallScores = reviews.map((r: any) => (r.professional + r.teaching + r.workEthic + r.reliability) / 4);
        const overallAvg = avg(overallScores);

        const stats = {
          total,
          overallAvg,
          avgProfessional: avg(reviews.map((r: any) => r.professional)),
          avgTeaching: avg(reviews.map((r: any) => r.teaching)),
          avgWorkEthic: avg(reviews.map((r: any) => r.workEthic)),
          avgReliability: avg(reviews.map((r: any) => r.reliability)),
        };

        const distribution = [1, 2, 3, 4, 5].map(star => ({
          stars: star,
          count: overallScores.filter(s => Math.round(s) === star).length,
        }));

        setReviewsData({ reviews, stats, distribution });
      } catch (err) {
        console.error('Error fetching reviews page data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-500 font-bold animate-pulse">{isRtl ? 'טוען ביקורות...' : 'Loading reviews...'}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <h2 className="text-2xl font-black">{isRtl ? 'משתמש לא נמצא' : 'User not found'}</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 font-bold flex items-center gap-2 mx-auto">
          {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          {isRtl ? 'חזרה' : 'Go back'}
        </button>
      </div>
    );
  }

  const { reviews = [], stats = {}, distribution = [] } = reviewsData || {};
  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(r => Math.round((r.professional + r.teaching + r.workEthic + r.reliability) / 4) === filterRating);

  const starStats = [5, 4, 3, 2, 1].map(star => {
    const dist = distribution.find(d => d.stars === star);
    return {
      stars: star,
      count: dist ? dist.count : 0,
      percentage: stats.total ? Math.round(((dist ? dist.count : 0) / stats.total) * 100) : 0
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button onClick={() => navigate(-1)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
          {isRtl ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-black">{isRtl ? `ביקורות על ${profile.full_name}` : `Reviews for ${profile.full_name}`}</h1>
          <p className="text-gray-500 font-medium">{profile.occupation || profile.role}</p>
        </div>
        <div className="w-12 h-12" /> {/* Spacer */}
      </div>

      {/* Summary Section */}
      <div className="grid md:grid-cols-3 gap-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
        {/* Big Number */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 border-b md:border-b-0 md:border-e border-gray-100 pb-6 md:pb-0">
          <div className="text-6xl font-black text-black">
            {stats.overallAvg ? stats.overallAvg.toFixed(1) : '0.0'}
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                size={20} 
                fill={s <= Math.round(stats.overallAvg || 0) ? "#EAB308" : "none"} 
                className={s <= Math.round(stats.overallAvg || 0) ? "text-yellow-500" : "text-gray-300"} 
              />
            ))}
          </div>
          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {isRtl ? `${stats.total || 0} חוות דעת` : `${stats.total || 0} Reviews`}
          </div>
        </div>

        {/* Categories breakdown */}
        <div className="space-y-4 px-4 border-b md:border-b-0 md:border-e border-gray-100 pb-6 md:pb-0">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{isRtl ? 'לפי קטגוריות' : 'By Category'}</h3>
          {[
            { label: isRtl ? 'מקצועיות' : 'Professionalism', val: stats.avgProfessional },
            { label: isRtl ? 'איכות הוראה' : 'Teaching Quality', val: stats.avgTeaching },
            { label: isRtl ? 'מוסר עבודה' : 'Work Ethic', val: stats.avgWorkEthic },
            { label: isRtl ? 'אמינות' : 'Reliability', val: stats.avgReliability },
          ].map(cat => (
            <div key={cat.label} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>{cat.label}</span>
                <span className="text-blue-600">{cat.val ? cat.val.toFixed(1) : '---'}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(cat.val || 0) * 20}%` }}
                  className="h-full bg-blue-600 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stars Breakdown */}
        <div className="space-y-3 pt-4 md:pt-0">
           <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{isRtl ? 'פילוח כוכבים' : 'Stars Distribution'}</h3>
           {starStats.map(item => (
             <button 
              key={item.stars} 
              onClick={() => setFilterRating(filterRating === item.stars ? 'all' : item.stars)}
              className={`w-full flex items-center gap-3 group transition-all p-1 rounded-lg ${filterRating === item.stars ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
             >
               <span className="text-xs font-bold w-4">{item.stars}</span>
               <Star size={12} className="text-yellow-500 fill-current" />
               <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-yellow-400" style={{ width: `${item.percentage}%` }} />
               </div>
               <span className="text-xs font-medium text-gray-400 w-8">{item.count}</span>
             </button>
           ))}
        </div>
      </div>

      {/* Filter and Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">{isRtl ? 'כל הביקורות' : 'All Reviews'}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
            <Filter size={16} />
            <span>{isRtl ? 'סינון:' : 'Filter:'}</span>
            <select 
              value={filterRating} 
              onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent border-none focus:ring-0 cursor-pointer font-black text-blue-600"
            >
              <option value="all">{isRtl ? 'הכל' : 'All'}</option>
              <option value="5">5 כוכבים</option>
              <option value="4">4 כוכבים</option>
              <option value="3">3 כוכבים</option>
              <option value="2">2 כוכבים</option>
              <option value="1">1 כוכב</option>
            </select>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="bg-gray-50 p-12 rounded-[2.5rem] text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Star size={32} className="text-gray-200" />
            </div>
            <p className="text-gray-500 font-bold">{isRtl ? 'לא נמצאו ביקורות מתאימות' : 'No matching reviews found'}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReviews.map((review) => (
              <motion.div 
                layout
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden">
                      {review.fromAvatar ? (
                        <img src={review.fromAvatar} alt={review.fromName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                          <UserIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-sm flex items-center gap-1.5">
                        {review.fromName}
                        {review.fromVerified === 1 && (
                          <CheckCircle2 size={14} className="text-blue-500" />
                        )}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium">
                        {new Date(review.createdAt).toLocaleDateString(isRtl ? 'he-IL' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-black">
                    <Star size={14} className="fill-current" />
                    {((review.professional + review.teaching + review.workEthic + review.reliability) / 4).toFixed(1)}
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed font-medium">
                   {review.comment}
                </p>

                {/* Tags if any logic used */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase rounded-lg border border-gray-100">
                    {isRtl ? 'מאומת' : 'Verified'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
