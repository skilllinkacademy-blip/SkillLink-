import React, { useState, useEffect } from 'react';
import { Star, Send, User, ShieldCheck, MessageSquare, TrendingUp, Award, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface ReviewsProps {
  isRtl: boolean;
  targetUserId?: string;
  targetUserName?: string;
  targetUserAvatar?: string;
  targetUserOccupation?: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  reviewer_occupation?: string;
  reviewer_verified?: boolean;
  category?: string;
}

const CATEGORIES = {
  he: ['מקצועיות', 'תקשורת', 'אמינות', 'סבלנות', 'ידע מקצועי'],
  en: ['Professionalism', 'Communication', 'Reliability', 'Patience', 'Expertise'],
};

function StarRating({
  value,
  onChange,
  size = 28,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(star)}
          className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 fill-slate-100'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="industrial-card p-8 space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-100 rounded-xl w-32" />
          <div className="h-3 bg-slate-100 rounded-xl w-20" />
        </div>
        <div className="h-4 bg-slate-100 rounded-xl w-24" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded-xl w-full" />
        <div className="h-3 bg-slate-100 rounded-xl w-4/5" />
      </div>
    </div>
  );
}

export default function Reviews({
  isRtl,
  targetUserId,
  targetUserName,
  targetUserAvatar,
  targetUserOccupation,
}: ReviewsProps) {
  const { user, profile } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('');

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      reviews.length > 0
        ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100)
        : 0,
  }));

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const endpoint = targetUserId
        ? `/reviews?targetUserId=${targetUserId}`
        : '/reviews/me';
      const res = await api.get(endpoint);
      setReviews(res.data || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [targetUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/reviews', {
        targetUserId: targetUserId || profile?.supabase_id,
        rating,
        comment,
        category,
      });
      setSubmitted(true);
      setShowForm(false);
      setRating(0);
      setComment('');
      setCategory('');
      await fetchReviews();
    } catch (err: any) {
      setError(err.message || (isRtl ? 'שגיאה בשליחה' : 'Submission error'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(isRtl ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const cats = isRtl ? CATEGORIES.he : CATEGORIES.en;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/10 flex items-center justify-center">
            <Star size={20} className="text-amber-500 fill-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-black tracking-tight">
              {isRtl ? 'דירוגים וביקורות' : 'Ratings & Reviews'}
            </h1>
            {targetUserName && (
              <p className="text-slate-400 font-medium text-sm">
                {isRtl ? `ביקורות על ${targetUserName}` : `Reviews for ${targetUserName}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {!loading && reviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Big Score */}
          <div className="industrial-card p-10 flex items-center gap-8">
            <div className="text-center">
              <div className="text-7xl font-black text-slate-900 leading-none tracking-tighter">
                {avgRating}
              </div>
              <StarRating value={Math.round(Number(avgRating))} readonly size={22} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                {reviews.length} {isRtl ? 'ביקורות' : 'Reviews'}
              </p>
            </div>
            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 w-3">{star}</span>
                  <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: star * 0.05 }}
                      className="h-full bg-amber-400 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: TrendingUp,
                label: isRtl ? 'דירוג ממוצע' : 'Avg Rating',
                value: avgRating ?? '—',
                color: 'text-emerald-600',
                bg: 'bg-emerald-500/10',
              },
              {
                icon: MessageSquare,
                label: isRtl ? 'סה"כ ביקורות' : 'Total Reviews',
                value: reviews.length,
                color: 'text-slate-900',
                bg: 'bg-slate-100',
              },
              {
                icon: Award,
                label: isRtl ? '5 כוכבים' : '5 Stars',
                value: `${ratingDistribution[0].pct}%`,
                color: 'text-amber-600',
                bg: 'bg-amber-400/10',
              },
              {
                icon: Star,
                label: isRtl ? 'ביקורת אחרונה' : 'Last Review',
                value: reviews[0] ? formatDate(reviews[0].created_at) : '—',
                color: 'text-blue-600',
                bg: 'bg-blue-500/10',
              },
            ].map((stat, i) => (
              <div key={i} className="industrial-card p-6 space-y-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <div>
                  <div className={`text-2xl font-black ${stat.color} tracking-tight`}>{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Write Review Button / Form */}
      {user && (
        <div className="space-y-6">
          {!showForm && !submitted && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 transition-all active:scale-95 group"
            >
              <Star size={16} className="text-amber-400 fill-amber-400" />
              {isRtl ? 'כתוב ביקורת' : 'Write a Review'}
            </button>
          )}

          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 px-8 py-5 bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] text-emerald-700 font-black text-sm"
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Star size={16} className="text-white fill-white" />
              </div>
              {isRtl ? '✅ הביקורת שלך נשלחה בהצלחה!' : '✅ Your review was submitted successfully!'}
            </motion.div>
          )}

          <AnimatePresence>
            {showForm && (
              <motion.form
                key="review-form"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                onSubmit={handleSubmit}
                className="industrial-card p-10 space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {isRtl ? 'שתף את חוויתך' : 'Share Your Experience'}
                  </h3>
                  <p className="text-slate-400 font-medium text-sm">
                    {isRtl
                      ? 'הביקורת שלך עוזרת לבנות קהילה מקצועית אמינה.'
                      : 'Your review helps build a trustworthy professional community.'}
                  </p>
                </div>

                {/* Star Rating */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {isRtl ? 'דירוג כללי' : 'Overall Rating'}
                  </label>
                  <StarRating value={rating} onChange={setRating} size={36} />
                  {rating > 0 && (
                    <p className="text-xs font-black text-amber-500 uppercase tracking-widest">
                      {['', isRtl ? 'גרוע' : 'Poor', isRtl ? 'סביר' : 'Fair', isRtl ? 'טוב' : 'Good', isRtl ? 'מצוין' : 'Great', isRtl ? 'מושלם!' : 'Excellent!'][rating]}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {isRtl ? 'קטגוריה (אופציונלי)' : 'Category (Optional)'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {cats.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(category === cat ? '' : cat)}
                        className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                          category === cat
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {isRtl ? 'ביקורת כתובה' : 'Written Review'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={
                      isRtl
                        ? 'ספר על החוויה שלך עם המנטור / המתלמד...'
                        : 'Tell us about your experience with this mentor / apprentice...'
                    }
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-slate-900 transition-all font-medium outline-none resize-none text-slate-900"
                  />
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      {comment.length}/500
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-5 bg-red-50 border-2 border-red-100 rounded-[2rem] text-red-600 text-sm font-bold">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors border-2 border-slate-100 hover:border-slate-200"
                  >
                    {isRtl ? 'ביטול' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || rating === 0}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <>
                        <Send size={16} />
                        {isRtl ? 'שלח ביקורת' : 'Submit Review'}
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-8">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isRtl ? 'כל הביקורות' : 'All Reviews'}
          </h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-6 py-2 rounded-full border border-slate-200">
            {reviews.length} {isRtl ? 'ביקורות' : 'Reviews'}
          </span>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="industrial-card p-24 text-center space-y-8">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
              <Star className="text-slate-200" size={48} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {isRtl ? 'אין ביקורות עדיין' : 'No reviews yet'}
              </h2>
              <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                {isRtl
                  ? 'היה הראשון להשאיר ביקורת ולעזור לבנות את הקהילה.'
                  : 'Be the first to leave a review and help build the community.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="industrial-card p-8 space-y-5 group"
              >
                {/* Reviewer Info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl overflow-hidden border border-slate-200 shrink-0">
                      {review.reviewer_avatar ? (
                        <img
                          src={review.reviewer_avatar}
                          alt={review.reviewer_name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        review.reviewer_name?.charAt(0) || <User size={20} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-base tracking-tight">
                          {review.reviewer_name}
                        </span>
                        {review.reviewer_verified && (
                          <ShieldCheck size={16} className="text-emerald-600 fill-emerald-500/10" />
                        )}
                      </div>
                      {review.reviewer_occupation && (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {review.reviewer_occupation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-1 shrink-0">
                    <StarRating value={review.rating} readonly size={18} />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>

                {/* Category Badge */}
                {review.category && (
                  <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                    {review.category}
                  </span>
                )}

                {/* Comment */}
                <div>
                  <p
                    className={`text-slate-600 font-medium leading-relaxed text-sm transition-all ${
                      expandedId === review.id ? '' : 'line-clamp-3'
                    }`}
                  >
                    {review.comment}
                  </p>
                  {review.comment?.length > 180 && (
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === review.id ? null : review.id)
                      }
                      className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 hover:text-slate-900 transition-colors"
                    >
                      {expandedId === review.id
                        ? isRtl ? 'הצג פחות' : 'Show less'
                        : isRtl ? 'קרא עוד' : 'Read more'}
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${expandedId === review.id ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
