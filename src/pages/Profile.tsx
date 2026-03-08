import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, ShieldCheck, Clock, Camera, Pencil, Briefcase, Info, Save, X, Loader2, User as UserIcon, Globe, ExternalLink, Hammer, Users, ArrowRight, Heart, Trash2, Upload, Phone, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProfileProps {
  isRtl: boolean;
  isPublicView?: boolean;
}

export default function Profile({ isRtl, isPublicView = false }: ProfileProps) {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const { user, profile: myProfile, refreshProfile } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    headline: '',
    bio: '',
    location: '',
    city: '',
    phone: '',
    occupation: '',
    years_experience: 0,
    workload: '',
    availability: '',
    skills_level: '',
    desired_salary: 0,
    what_i_want_to_learn: '',
    who_i_want_to_teach: '',
    availability_days: [] as string[],
    portfolio_urls: [] as string[],
    cover_url: '',
    skills: [] as { name: string; level: string; verified: boolean; verified_by?: string }[]
  });

  const [activeTab, setActiveTab] = useState<'about' | 'saved' | 'reviews'>('about');
  const [savedOpportunities, setSavedOpportunities] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (isPublicView && username) {
          const { data: publicProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();
          
          if (fetchError) throw fetchError;
          data = publicProfile;
        } else if (myProfile) {
          data = myProfile;
        } else if (user) {
          // Fallback to fetching by ID if myProfile is not yet in context
          const { data: myData, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (fetchError) {
            if (fetchError.code === 'PGRST116') {
              // Profile doesn't exist, create a basic one
              const metadata = user.user_metadata || {};
              const generatedUsername = `user_${Math.random().toString(36).substring(2, 10)}`;
              
              const { data: newProfile, error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                  id: user.id,
                  username: generatedUsername,
                  full_name: metadata.full_name || 'User',
                  role: metadata.role || 'mentee',
                  location: metadata.location || 'Unknown',
                  updated_at: new Date().toISOString(),
                })
                .select()
                .single();
                
              if (upsertError) {
                throw new Error(`Failed to create profile: ${upsertError.message} (${upsertError.code})`);
              }
              data = newProfile;
              await refreshProfile(); // Update context
            } else {
              throw fetchError;
            }
          } else {
            data = myData;
          }
        }

        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || '',
            username: data.username || '',
            headline: data.headline || '',
            bio: data.bio || '',
            location: data.location || '',
            city: data.city || '',
            phone: data.phone || '',
            occupation: data.occupation || '',
            years_experience: data.years_experience || 0,
            workload: data.workload || '',
            availability: data.availability || '',
            skills_level: data.skills_level || '',
            desired_salary: data.desired_salary || 0,
            what_i_want_to_learn: data.what_i_want_to_learn || '',
            who_i_want_to_teach: data.who_i_want_to_teach || '',
            availability_days: data.availability_days || [],
            portfolio_urls: data.portfolio_urls || [],
            cover_url: data.cover_url || '',
            skills: data.skills || []
          });
          fetchReviews(data.id);
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isPublicView, username, myProfile, user]);

  useEffect(() => {
    if (activeTab === 'reviews' && profile?.id) {
      fetchReviews(profile.id);
    }
  }, [activeTab, profile?.id]);

  const fetchReviews = async (profileId: string) => {
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id (
            full_name,
            avatar_url,
            username
          )
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "public.reviews" does not exist')) {
          setReviews([]);
        } else {
          throw error;
        }
      } else {
        setReviews(data || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleAddReview = async () => {
    if (!user || !profile) return;
    if (!newReview.comment.trim()) {
      alert(isRtl ? 'אנא הוסף תגובה' : 'Please add a comment');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          profile_id: profile.id,
          reviewer_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment
        });

      if (error) {
        console.error('Supabase review error:', error);
        if (error.message.includes('relation "public.reviews" does not exist')) {
          alert(isRtl 
            ? 'מערכת הדירוגים עדיין לא הופעלה במסד הנתונים. אנא פנה למנהל.' 
            : 'Review system is not yet active in the database.');
        } else {
          alert(isRtl ? `שגיאה: ${error.message}` : `Error: ${error.message}`);
          throw error;
        }
      } else {
        setNewReview({ rating: 5, comment: '' });
        setShowReviewForm(false);
        fetchReviews(profile.id);
        alert(isRtl ? 'הביקורת נוספה בהצלחה!' : 'Review added successfully!');
      }
    } catch (err: any) {
      console.error('Error adding review:', err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved' && user?.id === profile?.id) {
      const fetchSaved = async () => {
        setLoadingSaved(true);
        const { data, error } = await supabase
          .from('saved_opportunities')
          .select(`
            opportunity_id,
            opportunities (
              *,
              profiles (*)
            )
          `)
          .eq('user_id', user.id);
        
        if (!error && data) {
          setSavedOpportunities(data.map(d => d.opportunities).filter(Boolean));
        }
        setLoadingSaved(false);
      };
      fetchSaved();
    }
  }, [activeTab, profile?.id, user?.id]);

  const handleSave = async (field?: string, value?: any) => {
    if (!user) return;
    setSaving(true);
    try {
      const updatePayload: any = field ? { [field]: value } : { ...formData };
      
      // Remove portfolio_urls from the update payload if it's a full save
      if (!field) {
        delete updatePayload.portfolio_urls;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updatePayload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
    } catch (err: any) {
      console.error('Error updating profile:', err.message);
      // Only alert on full save or critical errors
      if (!field) {
        alert(isRtl ? 'שגיאה בעדכון הפרופיל: ' + err.message : 'Error updating profile: ' + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/cover.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      setFormData(prev => ({ ...prev, cover_url: publicUrl }));
      await refreshProfile();
    } catch (err: any) {
      console.error('Error uploading cover:', err.message);
      if (err.message.includes('column') && err.message.includes('schema cache')) {
        alert(isRtl 
          ? 'חסרה עמודה במסד הנתונים. אנא הרץ את ה-SQL הבא ב-Supabase:\n\nALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;' 
          : 'Database column missing. Please run the following SQL in Supabase:\n\nALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;');
      } else {
        alert(isRtl ? 'שגיאה בהעלאת תמונת נושא: ' + err.message : 'Error uploading cover photo: ' + err.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket "avatars" not found. Please run the SQL script in Supabase to create the required buckets.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      await refreshProfile();
    } catch (err: any) {
      console.error('Error uploading avatar:', err.message);
      alert(isRtl ? 'שגיאה בהעלאת תמונה: ' + err.message : 'Error uploading avatar: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setUploading(true);
    try {
      const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
    } catch (err: any) {
      console.error('Error removing avatar:', err.message);
      alert(isRtl ? 'שגיאה בהסרת תמונה' : 'Error removing avatar');
    } finally {
      setUploading(false);
    }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Reusing avatars bucket for simplicity
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newUrls = [...(formData.portfolio_urls || []), publicUrl];
      setFormData({ ...formData, portfolio_urls: newUrls });
      
      // We don't update the database here because the column might not exist yet.
      // The user needs to run the SQL query first.
      // If we try to update, it will throw an error.
      // We will just update the local state for now.
      // To actually save it, the user must run the SQL query and then click Save Profile.
      // Actually, if we don't save it to DB, it will be lost on refresh.
      // Let's try to save it, but catch the specific error and alert the user.
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ portfolio_urls: newUrls })
        .eq('id', user.id);

      if (updateError) {
        if (updateError.message.includes('portfolio_urls')) {
          throw new Error('Please run the SQL query to add the portfolio_urls column to the profiles table.');
        }
        throw updateError;
      }
      await refreshProfile();
    } catch (err: any) {
      console.error('Error uploading portfolio image:', err.message);
      if (err.message.includes('column') && err.message.includes('schema cache')) {
        alert(isRtl 
          ? 'חסרה עמודה במסד הנתונים. אנא הרץ את ה-SQL הבא ב-Supabase:\n\nALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_urls TEXT[];' 
          : 'Database column missing. Please run the following SQL in Supabase:\n\nALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_urls TEXT[];');
      } else {
        alert(isRtl ? 'שגיאה בהעלאת תמונה: ' + err.message : 'Error uploading image: ' + err.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePortfolioImage = async (urlToRemove: string) => {
    if (!user) return;
    const newUrls = (formData.portfolio_urls || []).filter(url => url !== urlToRemove);
    setFormData({ ...formData, portfolio_urls: newUrls });
    try {
      await supabase.from('profiles').update({ portfolio_urls: newUrls }).eq('id', user.id);
      await refreshProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const masteryLevel = useMemo(() => {
    if (!profile) return '';
    if (profile.role === 'mentor') return isRtl ? 'מנטור מומחה' : 'Master Mentor';
    const verifiedSkills = (formData.skills || []).filter(s => s.verified).length;
    if (verifiedSkills >= 5) return isRtl ? 'בעל מקצוע (Journeyman)' : 'Journeyman';
    if (verifiedSkills >= 2) return isRtl ? 'מתלמד שנה ב\'' : 'Year 2 Apprentice';
    return isRtl ? 'מתלמד מתחיל' : 'Junior Apprentice';
  }, [profile?.role, formData.skills, isRtl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-black text-black">{isRtl ? 'הפרופיל לא נמצא' : 'Profile Not Found'}</h2>
        <p className="text-gray-500 font-medium">{isRtl ? 'לא הצלחנו למצוא את המשתמש שחיפשת.' : 'We couldn\'t find the user you were looking for.'}</p>
        <button onClick={() => navigate('/app/opportunities')} className="px-8 py-3 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs">
          {isRtl ? 'חזרה לפיד' : 'Back to Feed'}
        </button>
      </div>
    );
  }

  const isMyProfile = user?.id === profile.id;
  const isMentor = profile.role === 'mentor';

  // Calculate profile completion
  const completionFields = [
    formData.full_name,
    formData.headline,
    formData.bio,
    formData.city || formData.location,
    formData.occupation,
    profile.avatar_url,
    formData.cover_url,
    formData.phone
  ];
  const completedCount = completionFields.filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / completionFields.length) * 100);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  const trustScore = Math.min(100, (completionPercentage * 0.5) + (reviews.length * 5) + (profile?.is_verified ? 20 : 0));

  const isRecentlyActive = (updatedAt: string) => {
    if (!updatedAt) return false;
    const lastActive = new Date(updatedAt);
    const now = new Date();
    const diffInHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Mastery Journey Indicator */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              <ShieldCheck size={12} />
              {isRtl ? 'סטטוס מקצועי מאומת' : 'Verified Professional Status'}
            </div>
            <h2 className="text-4xl font-black tracking-tight">{masteryLevel}</h2>
            <p className="text-slate-400 font-medium text-lg">
              {isMentor 
                ? (isRtl ? 'מכשיר את דור העתיד של בעלי המקצוע בישראל.' : 'Training the next generation of Israeli tradespeople.') 
                : (isRtl ? 'בדרך להפוך לבעל מקצוע עצמאי ומיומן.' : 'On the path to becoming a skilled independent professional.')}
            </p>
          </div>
          
          <div className="flex items-center gap-8 w-full md:w-auto">
            <div className="flex-1 md:w-64 space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>{isRtl ? 'התקדמות למאסטרי' : 'Mastery Progress'}</span>
                <span>{isMentor ? '100%' : `${Math.min(100, (formData.skills || []).filter(s => s.verified).length * 20)}%`}</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-1">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                  style={{ width: isMentor ? '100%' : `${Math.min(100, (formData.skills || []).filter(s => s.verified).length * 20)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-xl">
        <div className="h-48 bg-gray-50 relative group/cover">
          {formData.cover_url ? (
            <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
          )}
          
          {isMyProfile && (
            <label className="absolute top-4 right-4 p-3 bg-black/40 text-white rounded-2xl hover:bg-black/70 transition-all backdrop-blur-md cursor-pointer z-20 border border-white/20">
              <Camera size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploading} />
            </label>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-30">
              <Loader2 className="animate-spin text-white" size={32} />
            </div>
          )}
        </div>
        
        <div className="px-8 pb-8 -mt-16 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-black border-8 border-white flex items-center justify-center text-white font-black text-4xl shadow-2xl overflow-hidden relative">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  profile.full_name?.charAt(0) || 'U'
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={24} />
                  </div>
                )}
              </div>
              {isMyProfile && (
                <div className="absolute -bottom-2 -right-2 flex gap-1 z-10">
                  <label className="p-2.5 bg-white text-black rounded-xl shadow-xl border-2 border-white hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center">
                    <Camera size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                  </label>
                  {profile.avatar_url && (
                    <button 
                      onClick={handleRemoveAvatar} 
                      disabled={uploading} 
                      className="p-2.5 bg-white text-red-600 rounded-xl shadow-xl border-2 border-white hover:bg-red-50 transition-all cursor-pointer flex items-center justify-center"
                      title={isRtl ? 'הסר תמונה' : 'Remove Image'}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                {isMyProfile ? (
                  <input 
                    type="text" 
                    value={formData.full_name} 
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    onBlur={() => handleSave('full_name', formData.full_name)}
                    className="text-3xl font-black text-black bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded-lg w-full max-w-md transition-all"
                  />
                ) : (
                  <h1 className="text-3xl font-black text-black">{profile.full_name}</h1>
                )}
                {profile.role === 'mentor' && (profile.is_verified || profile.verification_status === 'approved') && (
                  <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-100">
                    <ShieldCheck size={14} fill="currentColor" />
                    {isRtl ? 'מנטור מאומת' : 'Verified Mentor'}
                  </span>
                )}
                {profile.role === 'mentor' && !(profile.is_verified || profile.verification_status === 'approved') && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 border border-gray-200">
                    {isRtl ? 'מנטור בבדיקה' : 'Pending Mentor'}
                  </span>
                )}
              </div>
              
              <div className="text-lg font-bold text-gray-500 flex items-center gap-2">
                {isMyProfile ? (
                  <input 
                    type="text" 
                    value={formData.headline} 
                    onChange={(e) => setFormData({...formData, headline: e.target.value})}
                    onBlur={() => handleSave('headline', formData.headline)}
                    placeholder={isRtl ? 'כותרת (למשל: חשמלאי מוסמך)' : 'Headline (e.g. Master Electrician)'}
                    className="bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded-lg w-full max-w-md transition-all"
                  />
                ) : (
                  <span>{profile.headline || profile.occupation || (isRtl ? 'משתמש SkillLink' : 'SkillLink User')}</span>
                )}
              </div>
            </div>

            {isMyProfile && saving && (
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                <Loader2 size={14} className="animate-spin" />
                {isRtl ? 'שומר...' : 'Saving...'}
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="text-lg font-black text-black">
                {isMentor ? (
                  isMyProfile ? (
                    <input 
                      type="number" 
                      value={formData.years_experience} 
                      onChange={(e) => setFormData({...formData, years_experience: parseInt(e.target.value) || 0})}
                      onBlur={() => handleSave('years_experience', formData.years_experience)}
                      className="w-16 bg-transparent text-center outline-none"
                    />
                  ) : (profile.years_experience || 0)
                ) : (isRtl ? 'מתחיל' : 'Beginner')}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {isMentor ? (isRtl ? 'שנות ניסיון' : 'Years Exp') : (isRtl ? 'רמה' : 'Level')}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="text-lg font-black text-black">
                {isMyProfile ? (
                  <input 
                    type="text" 
                    value={formData.city || formData.location} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    onBlur={() => handleSave('city', formData.city)}
                    className="w-full bg-transparent text-center outline-none"
                  />
                ) : (profile.city || profile.location || '---')}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'עיר' : 'City'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="text-lg font-black text-black">
                {isMyProfile ? (
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    onBlur={() => handleSave('phone', formData.phone)}
                    className="w-full bg-transparent text-center outline-none"
                  />
                ) : (profile.phone || '---')}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'טלפון' : 'Phone'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="text-lg font-black text-black">
                {isMyProfile ? (
                  <input 
                    type="text" 
                    value={formData.availability} 
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    onBlur={() => handleSave('availability', formData.availability)}
                    className="w-full bg-transparent text-center outline-none"
                  />
                ) : (profile.availability || profile.workload || '---')}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'זמינות' : 'Availability'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl text-center relative overflow-hidden group">
              <div className="text-lg font-black text-black">
                {trustScore}%
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'מדד אמינות' : 'Trust Score'}</div>
              <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl text-center relative overflow-hidden group">
              <div className="text-lg font-black text-black flex items-center justify-center gap-1.5">
                {isRecentlyActive(profile.updated_at) ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-600">{isRtl ? 'פעיל' : 'Active'}</span>
                  </>
                ) : (
                  <span className="text-gray-400">{isRtl ? 'לאחרונה' : 'Recent'}</span>
                )}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'סטטוס' : 'Status'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Bio & Info */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex gap-4 border-b border-gray-200 pb-4 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('about')}
              className={`text-lg font-black transition-colors whitespace-nowrap ${activeTab === 'about' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {isRtl ? 'אודות' : 'About'}
            </button>
            {isMyProfile && (
              <button 
                onClick={() => setActiveTab('saved')}
                className={`text-lg font-black transition-colors whitespace-nowrap ${activeTab === 'saved' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {isRtl ? 'מועדפים' : 'Saved'}
              </button>
            )}
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`text-lg font-black transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {isRtl ? 'ביקורות' : 'Reviews'} ({reviews.length})
            </button>
          </div>

          {activeTab === 'about' && (
            <>
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                <h2 className="text-2xl font-black text-black">{isRtl ? 'קצת עלי' : 'Bio'}</h2>
                {isMyProfile ? (
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    onBlur={() => handleSave('bio', formData.bio)}
                    rows={4}
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none resize-none"
                  />
                ) : (
                  <p className="text-gray-500 font-medium leading-relaxed text-lg">
                    {profile.bio || (isRtl ? 'עדיין לא נוסף תיאור אישי.' : 'No bio added yet.')}
                  </p>
                )}
                
                <div className="pt-8 border-t border-gray-50">
                  <h3 className="text-xl font-black text-black mb-4">
                    {isMentor ? (isRtl ? 'את מי אני רוצה ללמד?' : 'Who I want to teach?') : (isRtl ? 'למה אני רוצה ללמוד' : 'Why I want to learn')}
                  </h3>
                  {isMyProfile ? (
                    <textarea 
                      value={isMentor ? formData.who_i_want_to_teach : formData.what_i_want_to_learn}
                      onChange={(e) => setFormData({...formData, [isMentor ? 'who_i_want_to_teach' : 'what_i_want_to_learn']: e.target.value})}
                      onBlur={() => handleSave(isMentor ? 'who_i_want_to_teach' : 'what_i_want_to_learn', isMentor ? formData.who_i_want_to_teach : formData.what_i_want_to_learn)}
                      rows={3}
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none resize-none"
                    />
                  ) : (
                    <p className="text-gray-500 font-medium leading-relaxed">
                      {(isMentor ? profile.who_i_want_to_teach : profile.what_i_want_to_learn) || (isRtl ? 'עדיין לא נוסף מידע.' : 'No information added yet.')}
                    </p>
                  )}
                </div>
              </div>

              {/* Trade Passport / Skills */}
              <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 -z-10" />
                
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-[0.2em]">
                      Official Document
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                      <Briefcase size={32} className="text-slate-900" />
                      {isRtl ? 'דרכון מקצועי' : 'Trade Passport'}
                    </h2>
                    <p className="text-slate-500 font-medium max-w-md">
                      {isRtl ? 'ריכוז מיומנויות טכניות שאומתו בשטח על ידי מנטורים מוסמכים.' : 'A collection of technical competencies verified in the field by certified mentors.'}
                    </p>
                  </div>
                  {isMyProfile && (
                    <button 
                      onClick={() => {
                        const name = prompt(isRtl ? 'שם המיומנות:' : 'Skill Name:');
                        if (name) {
                          const newSkills = [...(formData.skills || []), { name, level: 'Level 1', verified: false }];
                          setFormData({ ...formData, skills: newSkills });
                          handleSave('skills', newSkills);
                        }
                      }}
                      className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.skills && formData.skills.length > 0 ? (
                    formData.skills.map((skill, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:border-emerald-200 transition-all duration-500">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${skill.verified ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {skill.verified ? <ShieldCheck size={28} /> : <Hammer size={28} />}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-lg">{skill.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-200/50 px-2 py-0.5 rounded-md">{skill.level}</span>
                              {skill.verified && (
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                  {isRtl ? 'מאומת בשטח' : 'Field Verified'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isMyProfile ? (
                          <button 
                            onClick={() => {
                              const newSkills = formData.skills.filter((_, idx) => idx !== i);
                              setFormData({ ...formData, skills: newSkills });
                              handleSave('skills', newSkills);
                            }}
                            className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          myProfile?.role === 'mentor' && !skill.verified && (
                            <button 
                              onClick={async () => {
                                if (!user) return;
                                const newSkills = [...formData.skills];
                                newSkills[i] = { ...newSkills[i], verified: true, verified_by: user.id };
                                
                                const { error } = await supabase
                                  .from('profiles')
                                  .update({ skills: newSkills })
                                  .eq('id', profile.id);
                                
                                if (error) {
                                  alert(isRtl ? 'שגיאה בעדכון הפרופיל.' : 'Error updating profile.');
                                } else {
                                  setFormData({ ...formData, skills: newSkills });
                                  alert(isRtl ? 'המיומנות אומתה בהצלחה!' : 'Skill verified successfully!');
                                }
                              }}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-1.5"
                            >
                              <ShieldCheck size={12} />
                              {isRtl ? 'אמת מיומנות' : 'Verify Skill'}
                            </button>
                          )
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-16 text-center space-y-4 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <Hammer className="text-slate-200" size={40} />
                      </div>
                      <p className="text-slate-400 font-bold text-lg">
                        {isRtl ? 'טרם נוספו מיומנויות לדרכון המקצועי.' : 'No skills recorded in the trade passport yet.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-black">{isRtl ? 'גלריית עבודות' : 'Gallery of Work'}</h2>
                  {isMyProfile && (
                    <label className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer flex items-center gap-1">
                      <Upload size={16} />
                      {isRtl ? 'הוסף תמונה' : 'Add Image'}
                      <input type="file" className="hidden" accept="image/*" onChange={handlePortfolioUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {formData.portfolio_urls && formData.portfolio_urls.length > 0 ? (
                    formData.portfolio_urls.map((url, i) => (
                      <div key={i} className="min-w-[240px] h-40 rounded-2xl border border-gray-100 relative group overflow-hidden shrink-0">
                        <img src={url} alt={`Portfolio ${i}`} className="w-full h-full object-cover" />
                        {isMyProfile && (
                          <button 
                            onClick={() => handleRemovePortfolioImage(url)}
                            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            title={isRtl ? 'הסר תמונה' : 'Remove Image'}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-8 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                      {isRtl ? 'אין תמונות בגלריה עדיין.' : 'No images in gallery yet.'}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {!isMyProfile && (
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-black">{isRtl ? 'כתוב ביקורת' : 'Write a Review'}</h2>
                    <button 
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="text-sm font-bold text-blue-600"
                    >
                      {showReviewForm ? (isRtl ? 'ביטול' : 'Cancel') : (isRtl ? 'הוסף ביקורת' : 'Add Review')}
                    </button>
                  </div>
                  
                  {showReviewForm && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(star => (
                          <button 
                            key={star}
                            onClick={() => setNewReview({...newReview, rating: star})}
                            className="transition-transform active:scale-90"
                          >
                            <Star 
                              size={24} 
                              className={star <= newReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} 
                            />
                          </button>
                        ))}
                      </div>
                      <textarea 
                        value={newReview.comment}
                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                        placeholder={isRtl ? 'איך הייתה החוויה שלך?' : 'How was your experience?'}
                        rows={3}
                        className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none resize-none"
                      />
                      <button 
                        onClick={handleAddReview}
                        disabled={saving || !newReview.comment}
                        className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm disabled:opacity-50"
                      >
                        {isRtl ? 'שלח ביקורת' : 'Submit Review'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {loadingReviews ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-gray-300" size={32} />
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-sm overflow-hidden">
                            {review.reviewer?.avatar_url ? (
                              <img src={review.reviewer.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              review.reviewer?.full_name?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-sm">{review.reviewer?.full_name}</p>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(star => (
                                <Star 
                                  key={star} 
                                  size={10} 
                                  className={star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-500 font-medium text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                      <Star className="text-gray-200" size={32} />
                    </div>
                    <p className="text-gray-400 font-medium">
                      {isRtl ? 'אין ביקורות עדיין.' : 'No reviews yet.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'saved' && (
            <div className="space-y-6">
              {loadingSaved ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : savedOpportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedOpportunities.map(opp => (
                    <div key={opp.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/app/opportunities/${opp.id}`)}>
                      <h3 className="font-black text-lg mb-2 line-clamp-2">{opp.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <MapPin size={14} />
                        <span>{opp.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {opp.profiles?.avatar_url ? (
                            <img src={opp.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-gray-500">{opp.profiles?.full_name?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <span className="text-sm font-bold">{opp.profiles?.full_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-100">
                  <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-black text-gray-900 mb-2">{isRtl ? 'אין הזדמנויות שמורות' : 'No saved opportunities'}</h3>
                  <p className="text-gray-500">{isRtl ? 'הזדמנויות שתשמור יופיעו כאן.' : 'Opportunities you save will appear here.'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-black text-white rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-black leading-tight">
                {isMentor ? (isRtl ? 'מוכן לחלוק את הידע שלך?' : 'Ready to share your skills?') : (isRtl ? 'מוכן להתחיל ללמוד?' : 'Ready to start learning?')}
              </h3>
              <p className="text-gray-400 font-medium">
                {isMentor 
                  ? (isRtl ? 'התחבר למתלמדים רציניים ועצב את דור העתיד.' : 'Connect with eager apprentices and shape the next generation.') 
                  : (isRtl ? 'מצא מנטור מומחה והתחל את הקריירה שלך.' : 'Find a master mentor and jumpstart your career in the trades.')}
              </p>
              <button 
                onClick={() => navigate(isMentor ? '/app/opportunities/new' : '/app/opportunities')}
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isMentor ? (isRtl ? 'פרסם התלמדות' : 'Post a Mentorship') : (isRtl ? 'מצא מנטור' : 'Find a Mentor')}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gray-50 rounded-full -z-10"></div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Info size={14} />
              {isRtl ? 'פרטי פרופיל' : 'Profile Details'}
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <MapPin size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isRtl ? 'מיקום' : 'Location'}</p>
                  {isMyProfile ? (
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      onBlur={() => handleSave('location', formData.location)}
                      className="text-sm font-bold text-black bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded-lg transition-all w-full border-b border-transparent focus:border-blue-200"
                      placeholder={isRtl ? 'הוסף מיקום...' : 'Add location...'}
                    />
                  ) : (
                    <p className="text-sm font-bold text-black">{profile.location || (isRtl ? 'לא צוין' : 'Not specified')}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Briefcase size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isRtl ? 'מקצוע' : 'Occupation'}</p>
                  {isMyProfile ? (
                    <input 
                      type="text" 
                      value={formData.occupation} 
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                      onBlur={() => handleSave('occupation', formData.occupation)}
                      className="text-sm font-bold text-black bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded-lg transition-all w-full border-b border-transparent focus:border-emerald-200"
                      placeholder={isRtl ? 'מה המקצוע שלך?' : 'What is your trade?'}
                    />
                  ) : (
                    <p className="text-sm font-bold text-black">{profile.occupation || (isRtl ? 'לא צוין' : 'Not specified')}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <Phone size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isRtl ? 'טלפון' : 'Phone'}</p>
                  {isMyProfile ? (
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      onBlur={() => handleSave('phone', formData.phone)}
                      className="text-sm font-bold text-black bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded-lg transition-all w-full border-b border-transparent focus:border-purple-200"
                      placeholder={isRtl ? 'הוסף טלפון...' : 'Add phone...'}
                    />
                  ) : (
                    <p className="text-sm font-bold text-black">{profile.phone || (isRtl ? 'לא צוין' : 'Not specified')}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                  <Clock size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isRtl ? 'זמינות' : 'Availability'}</p>
                  {isMyProfile ? (
                    <input 
                      type="text" 
                      value={formData.availability} 
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      onBlur={() => handleSave('availability', formData.availability)}
                      className="text-sm font-bold text-black bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded-lg transition-all w-full border-b border-transparent focus:border-orange-200"
                      placeholder={isRtl ? 'מתי אתה פנוי?' : 'When are you free?'}
                    />
                  ) : (
                    <p className="text-sm font-bold text-black">{profile.availability || profile.workload || (isRtl ? 'לא צוין' : 'Not specified')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
