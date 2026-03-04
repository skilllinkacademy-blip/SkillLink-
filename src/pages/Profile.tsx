import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, ShieldCheck, Clock, Camera, Pencil, Briefcase, Info, Save, X, Loader2, User as UserIcon, Globe, ExternalLink, Hammer, Users, ArrowRight, Heart, Trash2, Upload, Phone } from 'lucide-react';
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
    cover_url: ''
  });

  const [activeTab, setActiveTab] = useState<'about' | 'saved'>('about');
  const [savedOpportunities, setSavedOpportunities] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

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
            cover_url: data.cover_url || ''
          });
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
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
                {isMentor && <ShieldCheck className="text-blue-600" size={24} />}
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
            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="text-lg font-black text-black">100%</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'אמינות' : 'Reliability'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Bio & Info */}
        <div className="lg:col-span-8 space-y-8">
          {isMyProfile && (
            <div className="flex gap-4 border-b border-gray-200 pb-4">
              <button 
                onClick={() => setActiveTab('about')}
                className={`text-lg font-black transition-colors ${activeTab === 'about' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {isRtl ? 'אודות' : 'About'}
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`text-lg font-black transition-colors ${activeTab === 'saved' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {isRtl ? 'מועדפים' : 'Saved'}
              </button>
            </div>
          )}

          {activeTab === 'about' ? (
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
          ) : (
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
                  ? (isRtl ? 'התחבר לחניכים רציניים ועצב את דור העתיד.' : 'Connect with eager mentees and shape the next generation.') 
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

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{isRtl ? 'פרטי פרופיל' : 'Profile Details'}</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isRtl ? 'מיקום' : 'Location'}</p>
                  {isMyProfile ? (
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      onBlur={() => handleSave('location', formData.location)}
                      className="text-sm font-bold text-black bg-transparent border-none outline-none focus:bg-gray-50 px-1 rounded transition-all w-full"
                    />
                  ) : (
                    <p className="text-sm font-bold text-black">{profile.location || (isRtl ? 'לא צוין' : 'Not specified')}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isRtl ? 'זמינות' : 'Availability'}</p>
                  {isMyProfile ? (
                    <input 
                      type="text" 
                      value={formData.availability} 
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      onBlur={() => handleSave('availability', formData.availability)}
                      className="text-sm font-bold text-black bg-transparent border-none outline-none focus:bg-gray-50 px-1 rounded transition-all w-full"
                    />
                  ) : (
                    <p className="text-sm font-bold text-black">{profile.availability || profile.workload || (isRtl ? 'לא צוין' : 'Not specified')}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <Hammer size={20} className="text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isRtl ? 'מקצוע' : 'Trade'}</p>
                  {isMyProfile ? (
                    <input 
                      type="text" 
                      value={formData.occupation} 
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                      onBlur={() => handleSave('occupation', formData.occupation)}
                      className="text-sm font-bold text-black bg-transparent border-none outline-none focus:bg-gray-50 px-1 rounded transition-all w-full"
                    />
                  ) : (
                    <p className="text-sm font-bold text-black">{profile.occupation || (isRtl ? 'לא צוין' : 'Not specified')}</p>
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
