import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, MapPin, ShieldCheck, Clock, Camera, Pencil, Briefcase, Info, Save, X, Loader2, User as UserIcon, Globe, ExternalLink, Hammer, Users, ArrowRight, Heart, Trash2, Upload, Phone, Plus, Zap, MessageSquare, CheckCircle2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

import OpportunityCard from '../components/OpportunityCard';
import { resolveAsset } from '../lib/assets';
import { markConversationCompleted } from '../lib/connectionTracking';

interface ProfileProps {
  isRtl: boolean;
  isPublicView?: boolean;
}

export default function Profile({ isRtl, isPublicView = false }: ProfileProps) {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const { user, profile: myProfile, refreshProfile, signOut } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const currentProfileId = React.useRef<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    headline: '',
    bio: '',
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
    skills: [] as { name: string; level: string; verified: boolean; verified_by?: string }[],
    isBusiness: false,
    businessDescription: '',
    businessLogo: '',
    businessWebsite: '',
    businessSocialLinks: { facebook: '', instagram: '', linkedin: '' }
  });

  const [activeTab, setActiveTab] = useState<'about' | 'saved' | 'reviews'>('about');
  const [savedOpportunities, setSavedOpportunities] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsStats, setReviewsStats] = useState<any>(null);
  const [showTagForm, setShowTagForm] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    professional: 5,
    teaching: 5,
    workEthic: 5,
    reliability: 5
  });

  // ===== Page design (Option A: templates + accent + section toggles) =====
  const ACCENTS = ['#2563eb', '#10b981', '#d97706', '#e11d48', '#7c3aed', '#0f172a'];
  const TEMPLATES = [
    { id: 'classic', labelHe: 'נקי ובהיר', labelEn: 'Clean & Light' },
    { id: 'dark', labelHe: 'מקצועי כהה', labelEn: 'Bold Dark' },
    { id: 'warm', labelHe: 'חם ואומנותי', labelEn: 'Warm Craft' },
  ];
  const PAGE_BG_COLORS = ['#ffffff', '#f8fafc', '#0f172a', '#faf5ff', '#ecfeff', '#fef2f2'];
  const [design, setDesign] = useState<{ template: string; accent: string; bannerColor?: string; pageBgColor?: string; pageBgImage?: string; sections: { gallery: boolean; reviews: boolean; tags: boolean } }>({
    template: 'classic',
    accent: '#2563eb',
    bannerColor: '',
    pageBgColor: '',
    pageBgImage: '',
    sections: { gallery: true, reviews: true, tags: true },
  });
  const [showDesignPanel, setShowDesignPanel] = useState(false);

  const addCustomTag = () => {
    const t = newTag.trim();
    if (!t) return;
    const newSkills = [...(formData.skills || []), { name: t, level: t, verified: false }];
    setFormData({ ...formData, skills: newSkills });
    handleSave('skills', newSkills);
    setNewTag('');
    setShowTagForm(false);
  };

  const handlePageBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { alert(isRtl ? 'הקובץ גדול מדי (עד 5MB)' : 'File too large (max 5MB)'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/pagebg.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      const nd = { ...design, pageBgImage: `${publicUrl}?t=${Date.now()}`, pageBgColor: '' };
      setDesign(nd);
      await handleSave('page_design', nd);
    } catch (err: any) {
      alert(isRtl ? 'שגיאה בהעלאת רקע: ' + err.message : 'Error uploading background: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const quickTags = [
    { id: 'tools', label: isRtl ? 'בעל כלי עבודה' : 'Owns Tools', icon: Hammer },
    { id: 'vehicle', label: isRtl ? 'בעל רכב' : 'Has Vehicle', icon: Globe },
    { id: 'weekends', label: isRtl ? 'זמין בסופ"ש' : 'Available Weekends', icon: Clock },
    { id: 'fast', label: isRtl ? 'למידה מהירה' : 'Fast Learner', icon: Zap },
    { id: 'safety', label: isRtl ? 'הסמכת בטיחות' : 'Safety Certified', icon: ShieldCheck },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (isPublicView && username) {
          // Try fetching by username first
          const { data: publicProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .maybeSingle();
          
          if (fetchError) throw fetchError;
          
          if (!publicProfile) {
            // Check if username is a valid UUID before trying to fetch by ID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
            
            if (isUuid) {
              // Fallback: Try fetching by ID in case the "username" is actually an ID (legacy links)
              const { data: fallbackProfile, error: fallbackError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', username)
                .maybeSingle();
              
              if (fallbackError) throw fallbackError;
              if (!fallbackProfile) throw new Error(isRtl ? 'משתמש לא נמצא' : 'User not found');
              data = fallbackProfile;
            } else {
              throw new Error(isRtl ? 'משתמש לא נמצא' : 'User not found');
            }
          } else {
            data = publicProfile;
          }
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
                  city: metadata.city || metadata.location || 'Unknown',
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
          setDesign({
            template: data.page_design?.template || 'classic',
            accent: data.page_design?.accent || '#2563eb',
            bannerColor: data.page_design?.bannerColor || '',
            pageBgColor: data.page_design?.pageBgColor || '',
            pageBgImage: data.page_design?.pageBgImage || '',
            sections: {
              gallery: data.page_design?.sections?.gallery !== false,
              reviews: data.page_design?.sections?.reviews !== false,
              tags: data.page_design?.sections?.tags !== false,
            },
          });
          
          // Only initialize form data on first load or when switching profiles
          if (!isInitialized || data.id !== currentProfileId.current) {
            setFormData({
              full_name: data.full_name || '',
              username: data.username || '',
              headline: data.headline || '',
              bio: data.bio || '',
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
              skills: data.skills || [],
              isBusiness: data.isBusiness === 1 || data.isBusiness === true,
              businessDescription: data.businessDescription || '',
              businessLogo: data.businessLogo || '',
              businessWebsite: data.businessWebsite || '',
              businessSocialLinks: data.businessSocialLinks ? JSON.parse(data.businessSocialLinks) : { facebook: '', instagram: '', linkedin: '' }
            });
            setIsInitialized(true);
            currentProfileId.current = data.id;
          }
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
      const { data } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles!reviewer_id(full_name, avatar_url, username, is_verified)')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      const reviewList = (data || []).map((r: any) => ({
        id: r.id,
        professional: r.professional ?? 0,
        teaching: r.teaching ?? 0,
        workEthic: r.work_ethic ?? 0,
        reliability: r.reliability ?? 0,
        rating: r.rating || 0,
        comment: r.comment || '',
        createdAt: r.created_at,
        fromName: r.reviewer?.full_name || 'Anonymous',
        fromAvatar: r.reviewer?.avatar_url || null,
        fromVerified: r.reviewer?.is_verified ? 1 : 0,
      }));
      setReviews(reviewList);
      if (reviewList.length > 0) {
        const avg = reviewList.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviewList.length;
        setReviewsStats({ averageRating: avg.toFixed(1), totalReviews: reviewList.length, reviews: reviewList });
      } else {
        setReviewsStats({ averageRating: 0, totalReviews: 0, reviews: [] });
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
      const rating = Math.round((newReview.professional + newReview.teaching + newReview.workEthic + newReview.reliability) / 4);
      const { error: insertError } = await supabase.from('reviews').insert({
        profile_id: profile.id,
        reviewer_id: user.id,
        professional: newReview.professional,
        teaching: newReview.teaching,
        work_ethic: newReview.workEthic,
        reliability: newReview.reliability,
        rating,
        comment: newReview.comment,
      });
      if (insertError) throw insertError;

      // Mark the conversation between reviewer and reviewee as completed (fire-and-forget)
      markConversationCompleted(supabase, user.id, profile.id);

      setNewReview({
        rating: 5,
        comment: '',
        professional: 5,
        teaching: 5,
        workEthic: 5,
        reliability: 5
      });
      setShowReviewForm(false);
      fetchReviews(profile.id);
      alert(isRtl ? 'הביקורת נוספה בהצלחה!' : 'Review added successfully!');
    } catch (err: any) {
      console.error('Error adding review:', err.message);
      alert(isRtl ? 'שגיאה בשליחת הביקורת. אנא נסה שוב.' : 'Error submitting review. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved' && user?.id === profile?.id) {
      const fetchSaved = async () => {
        setLoadingSaved(true);
        try {
          const { data } = await supabase
            .from('saved_opportunities')
            .select('opportunity_id, opportunities(*, profiles!opportunities_owner_id_fkey(full_name, avatar_url, occupation, username, is_verified, role))')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          setSavedOpportunities((data || []).map((r: any) => r.opportunities).filter(Boolean));
        } catch (err) {
          console.error('Error fetching saved opportunities:', err);
        } finally {
          setLoadingSaved(false);
        }
      };
      fetchSaved();
    }
  }, [activeTab, profile?.id, user?.id]);

  const handleSave = async (field?: string, value?: any) => {
    if (!user) return;
    
    // Skip if value hasn't changed to avoid redundant updates and race conditions
    if (field && profile && profile[field] === value) {
      return;
    }
    
    setSaving(true);
    try {
      let updatePayload: any = field ? { [field]: value } : { ...formData };
      
      // Handle social links special case
      if (field === 'businessSocialLinks' || (!field && formData.businessSocialLinks)) {
        const links = field === 'businessSocialLinks' ? value : formData.businessSocialLinks;
        updatePayload.businessSocialLinks = JSON.stringify(links);
      }

      // Remove portfolio_urls from the update payload if it's a full save
      if (!field) {
        delete updatePayload.portfolio_urls;
      }

      // Update Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updatePayload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        // If a column is missing in the schema cache, try to remove it and retry
        if (error.message.includes('column') && error.message.includes('cache')) {
          const missingColumn = error.message.match(/'([^']+)' column/)?.[1];
          if (missingColumn && updatePayload[missingColumn] !== undefined) {
            console.warn(`Column '${missingColumn}' missing in Supabase, retrying without it...`);
            const { [missingColumn]: _, ...newPayload } = updatePayload;
            const { error: retryError } = await supabase
              .from('profiles')
              .update({
                ...newPayload,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);
            if (retryError) throw retryError;
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
      // Keep this page's local profile in sync with what was just saved, so
      // edits (tags, "what I want to learn", etc.) persist visually without a
      // reload and don't revert when the display reads from `profile`.
      setProfile((prev: any) => (prev ? { ...prev, ...updatePayload } : prev));
      await refreshProfile();
    } catch (err: any) {
      console.error('Error updating profile:', err.message);
      // Surface every save failure (including single-field saves like tags),
      // otherwise a blocked/failed save looks like "nothing happened".
      alert(isRtl ? 'שגיאה בשמירת הפרופיל: ' + err.message : 'Error saving profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert(isRtl ? 'סוג קובץ לא נתמך. השתמש ב-JPG, PNG או WebP בלבד.' : 'Unsupported file type. Use JPG, PNG or WebP only.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(isRtl ? 'הקובץ גדול מדי. גודל מקסימלי: 5MB.' : 'File too large. Maximum size: 5MB.');
      return;
    }
    setUploading(true);
    try {
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
    const file = e.target.files[0];
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert(isRtl ? 'סוג קובץ לא נתמך. השתמש ב-JPG, PNG או WebP בלבד.' : 'Unsupported file type. Use JPG, PNG or WebP only.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(isRtl ? 'הקובץ גדול מדי. גודל מקסימלי: 5MB.' : 'File too large. Maximum size: 5MB.');
      return;
    }
    setUploading(true);
    try {
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
    const file = e.target.files[0];
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert(isRtl ? 'סוג קובץ לא נתמך. השתמש ב-JPG, PNG או WebP בלבד.' : 'Unsupported file type. Use JPG, PNG or WebP only.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(isRtl ? 'הקובץ גדול מדי. גודל מקסימלי: 5MB.' : 'File too large. Maximum size: 5MB.');
      return;
    }
    setUploading(true);
    try {
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
  const profession = (formData.occupation || '').toLowerCase();

  const getProfilePlaceholder = (fieldName: string) => {
    const isM = isMentor;
    if (profession.includes('ספר') || profession.includes('barber')) {
      return {
        headline: isM ? 'ספר מומחה לגברים - עיצוב זקן ודירוגים' : 'מתלמד סטאז\'ר לספרות - מחפש להשתלב במספרה',
        bio: isM ? 'ניסיון של 10 שנים, מתמחה בדירוגים מורכבים ועיצוב זקן קלאסי. מאמין בעבודה מדויקת ושירות ללא פשרות.' : 'בוגר קורס ספרות, מחפש מקום ללמוד בו את העבודה המעשית ולצבור שעות מספריים.',
        availability: 'זמין בבקרים ושישי, גמיש לשעות נוספות',
        requirements: isM ? 'מחפש חניך רציני, שרוצה ללמוד את המקצוע באמת ולא מפחד לעבוד קשה' : 'רוצה ללמוד דירוגים גבוהים ושימוש נכון בתער'
      };
    }
    if (profession.includes('חשמל') || profession.includes('electrician')) {
      return {
        headline: isM ? 'חשמלאי מוסמך מעל 15 שנה - מומחה ללוחות ותשתיות' : 'סטודנט לחשמל - מחפש לצאת לשטח וללמוד התקנות',
        bio: isM ? 'מבצע את כל עבודות החשמל לבית ולעסק. הקפדה יתרה על בטיחות ותקני חברת החשמל.' : 'בעל ידע תיאורטי חזק, מחפש ליישם אותו בעבודות השחלה, התקנת נקודות ולוחות.',
        availability: 'ימים א\'-ה\', 07:00 עד 17:00, זמין לקריאות חירום',
        requirements: isM ? 'מישהו עם "ראש על הכתפיים", זהירות מקסימלית ויכולת למידה מהירה' : 'מעוניין ללמוד איתור תקלות ותכנון מערכות חשמל חכמות'
      };
    }
    if (profession.includes('נגר') || profession.includes('carpentry')) {
      return {
        headline: isM ? 'נגר אומן - מטבחים ורהיטים בהתאמה אישית' : 'חניך נגרות - אוהב עבודה עם עץ ומחפש מנטור',
        bio: isM ? 'חי ונושם עץ. מתמחה בחיבורים מסורתיים ועיצובים מודרניים. הסדנה שלי בפתח תקווה פתוחה ללמידה.' : 'ידיים טובות, רקע בסיסי בכלי עבודה, רוצה ללמוד נגרות קלאסית ומודרנית.',
        availability: 'זמין למשרה מלאה בנגרייה',
        requirements: isM ? 'דיוק, סבלנות ואהבה לחומר. לא מתאים למי שמחפש "קיצורי דרך"' : 'רוצה לדעת להוציא רהיט מושלם מהתכנון ועד הגימור'
      };
    }
    // Default
    return {
      headline: isM ? 'מומחה בתחום ה... עם ניסיון עשיר' : 'מעוניין ללמוד ולהתמקצע בתחום ה...',
      bio: isM ? 'ספר קצת על הניסיון שלך, הפרויקטים שעשית והאני מאמין המקצועי שלך.' : 'ספר למה בחרת במקצוע הזה ומה המטרות שלך לחודשים הקרובים.',
      availability: 'למשל: בקרים בלבד, גמיש, או זמין למשרה מלאה',
      requirements: isM ? 'תכונות שאתה מחפש במתלמד שלך' : 'מיומנויות ספציפיות שחשוב לך ללמוד'
    };
  };

  const placeholders = getProfilePlaceholder(profession);

  // Design-derived styles (accent + template)
  const accent = design.accent || '#2563eb';
  const heroBg =
    design.bannerColor
      ? `linear-gradient(135deg, ${design.bannerColor} 0%, #0f172a 90%)`
      : design.template === 'dark'
      ? 'linear-gradient(135deg,#1e293b,#020617)'
      : design.template === 'warm'
      ? 'linear-gradient(135deg,#b45309 0%,#7c2d12 45%,#431407 100%)'
      : `linear-gradient(135deg, ${accent} 0%, #0f172a 85%)`;
  const hasPageBg = !!(design.pageBgImage || design.pageBgColor);
  const pageBackground = design.pageBgImage
    ? `url("${design.pageBgImage}") center / cover no-repeat`
    : (design.pageBgColor || undefined);

  const renderProfileHelper = (text: string) => (
    <p className="mt-1 text-[10px] font-bold text-slate-400 px-1 animate-in fade-in">
      {text}
    </p>
  );

  // Calculate profile completion — role-aware, and including the field that
  // most drives matching (what I want to learn / who I want to teach).
  const learnTeachValue = isMentor ? formData.who_i_want_to_teach : formData.what_i_want_to_learn;
  const completionItems = [
    { label: isRtl ? 'שם' : 'name', done: !!formData.full_name },
    { label: isRtl ? 'כותרת' : 'headline', done: !!formData.headline },
    { label: isRtl ? 'מקצוע' : 'occupation', done: !!formData.occupation },
    { label: isRtl ? 'מיקום' : 'location', done: !!formData.city },
    { label: isRtl ? 'תמונה' : 'photo', done: !!profile.avatar_url },
    { label: isRtl ? 'קצת עליי' : 'bio', done: !!formData.bio },
    {
      label: isMentor ? (isRtl ? 'את מי ללמד' : 'who to teach') : (isRtl ? 'מה ללמוד' : 'what to learn'),
      done: !!learnTeachValue,
    },
  ];
  const completedCount = completionItems.filter((i) => i.done).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);
  const missingLabels = completionItems.filter((i) => !i.done).map((i) => i.label);

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

  const verified = profile.role === 'mentor' && (profile.is_verified || profile.verification_status === 'approved');
  const works = (formData.portfolio_urls && formData.portfolio_urls.length) || 0;
  const ratingText = reviews.length > 0 ? averageRating.toFixed(1) : '—';
  const category = profile.headline || profile.occupation || (isMentor ? (isRtl ? 'מנטור' : 'Mentor') : (isRtl ? 'מתלמד' : 'Apprentice'));

  return (
    <div className="max-w-xl mx-auto" style={{ ['--pa' as any]: accent }}>

      {/* ===== Design panel ===== */}
      {isMyProfile && showDesignPanel && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDesignPanel(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">{isRtl ? 'עיצוב הדף שלך' : 'Design your page'}</h3>
              <button onClick={() => setShowDesignPanel(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? 'צבע ראשי' : 'Accent color'}</div>
              <div className="flex flex-wrap gap-3">
                {ACCENTS.map((c) => (
                  <button key={c} onClick={() => { const nd = { ...design, accent: c }; setDesign(nd); handleSave('page_design', nd); }} className={`w-9 h-9 rounded-full transition-all ${design.accent === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''}`} style={{ backgroundColor: c }} aria-label={c} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? 'רקע העמוד' : 'Page background'}</div>
              <div className="flex flex-wrap gap-3 items-center">
                {PAGE_BG_COLORS.map((c) => (
                  <button key={c} onClick={() => { const nd = { ...design, pageBgColor: c, pageBgImage: '' }; setDesign(nd); handleSave('page_design', nd); }} className={`w-9 h-9 rounded-full border border-slate-200 transition-all ${design.pageBgColor === c && !design.pageBgImage ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''}`} style={{ backgroundColor: c }} aria-label={c} />
                ))}
                <button onClick={() => { const nd = { ...design, pageBgColor: '', pageBgImage: '' }; setDesign(nd); handleSave('page_design', nd); }} className="text-[11px] font-bold text-slate-500 underline">{isRtl ? 'ללא' : 'None'}</button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer text-xs font-bold text-slate-700">
                  <Upload size={14} />
                  {isRtl ? 'העלה תמונת רקע' : 'Upload background'}
                  <input type="file" className="hidden" accept="image/*" onChange={handlePageBgUpload} disabled={uploading} />
                </label>
                {design.pageBgImage && (
                  <button onClick={() => { const nd = { ...design, pageBgImage: '' }; setDesign(nd); handleSave('page_design', nd); }} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
            <button onClick={() => setShowDesignPanel(false)} className="w-full py-3 rounded-2xl font-black text-white" style={{ backgroundColor: accent }}>{isRtl ? 'סיימתי' : 'Done'}</button>
          </div>
        </div>
      )}

      <div className={hasPageBg ? 'p-2 sm:p-4 rounded-3xl' : ''} style={{ background: pageBackground }}>
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5 font-black text-slate-900 min-w-0">
              <span className="truncate">@{profile.username || 'user'}</span>
              {verified && (
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] shrink-0" style={{ backgroundColor: accent }} title={isRtl ? 'מאומת' : 'Verified'}>✓</span>
              )}
            </div>
            {isMyProfile && (
              <button onClick={() => setShowDesignPanel(true)} className="flex items-center gap-1.5 text-xs font-black text-white px-3 py-1.5 rounded-lg active:scale-95 transition-transform" style={{ backgroundColor: accent }}>
                <Pencil size={13} /> {isRtl ? 'עצב' : 'Design'}
              </button>
            )}
          </div>

          {/* Header: avatar + stats */}
          <div className="px-4 pt-5">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div className="p-[3px] rounded-full" style={{ background: accent }}>
                  <div className="w-[74px] h-[74px] rounded-full overflow-hidden bg-slate-800 border-2 border-white flex items-center justify-center text-white font-black text-2xl">
                    {profile.avatar_url ? (
                      <img src={resolveAsset(profile.avatar_url) || ''} alt={profile.full_name} className="w-full h-full object-cover" />
                    ) : (profile.full_name?.charAt(0) || 'U')}
                  </div>
                </div>
                {isMyProfile && (
                  <label className="absolute -bottom-1 -left-1 p-1.5 bg-white rounded-full shadow border border-gray-100 cursor-pointer" title={isRtl ? 'החלף תמונה' : 'Change photo'}>
                    <Camera size={13} className="text-slate-700" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                  </label>
                )}
              </div>
              <div className="flex-1 grid grid-cols-3 text-center">
                <div><div className="text-lg font-black text-slate-900">{works}</div><div className="text-xs text-slate-400 font-semibold">{isMentor ? (isRtl ? 'עבודות' : 'Works') : (isRtl ? 'דוגמאות' : 'Samples')}</div></div>
                <div><div className="text-lg font-black text-slate-900">{ratingText}</div><div className="text-xs text-slate-400 font-semibold">{isRtl ? 'דירוג' : 'Rating'}</div></div>
                <div><div className="text-lg font-black text-slate-900">{reviews.length}</div><div className="text-xs text-slate-400 font-semibold">{isRtl ? 'ביקורות' : 'Reviews'}</div></div>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="px-4 pt-4 space-y-1.5">
            <div className="flex items-center gap-1.5">
              {isMyProfile ? (
                <input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} onBlur={() => handleSave('full_name', formData.full_name)} placeholder={isRtl ? 'השם שלך' : 'Your name'} className="font-black text-slate-900 text-base bg-transparent outline-none focus:bg-gray-50 rounded px-1 -mx-1 w-full max-w-[240px]" />
              ) : (
                <span className="font-black text-slate-900 text-base">{profile.full_name}</span>
              )}
            </div>
            {isMyProfile ? (
              <input value={formData.headline} onChange={(e) => setFormData({ ...formData, headline: e.target.value })} onBlur={() => handleSave('headline', formData.headline)} placeholder={isRtl ? 'מקצוע / כותרת' : 'Profession / headline'} className="text-sm text-slate-500 font-medium bg-transparent outline-none focus:bg-gray-50 rounded px-1 -mx-1 w-full" />
            ) : (
              <div className="text-sm text-slate-500 font-medium">{category}</div>
            )}
            {isMyProfile ? (
              <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} onBlur={() => handleSave('bio', formData.bio)} rows={2} placeholder={isRtl ? 'ספר על עצמך בכמה מילים...' : 'A few words about you...'} className="text-sm text-slate-700 leading-relaxed bg-transparent outline-none focus:bg-gray-50 rounded px-1 -mx-1 w-full resize-none" />
            ) : (profile.bio && <p className="text-sm text-slate-700 leading-relaxed">{profile.bio}</p>)}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium pt-0.5">
              <MapPin size={13} />
              {isMyProfile ? (
                <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} onBlur={() => handleSave('city', formData.city)} placeholder={isRtl ? 'מיקום' : 'Location'} className="bg-transparent outline-none focus:bg-gray-50 rounded px-1 w-full max-w-[200px]" />
              ) : (<span>{profile.city || (isRtl ? 'לא צוין' : 'Not set')}</span>)}
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 pt-4 flex gap-2">
            {!isMyProfile ? (
              <>
                <button onClick={() => navigate('/app/messages', { state: { recipientId: profile.id, recipientName: profile.full_name } })} className="flex-1 py-2.5 rounded-xl font-black text-sm text-white active:scale-95 transition-transform" style={{ backgroundColor: accent }}>
                  {isMentor ? (isRtl ? 'התחל ללמוד' : 'Start learning') : (isRtl ? 'צור קשר' : 'Get in touch')}
                </button>
                <button onClick={() => navigate('/app/messages', { state: { recipientId: profile.id, recipientName: profile.full_name } })} className="flex-1 py-2.5 rounded-xl font-black text-sm bg-slate-100 text-slate-800 active:scale-95 transition-transform">
                  {isRtl ? 'הודעה' : 'Message'}
                </button>
              </>
            ) : (
              <button onClick={() => setShowDesignPanel(true)} className="flex-1 py-2.5 rounded-xl font-black text-sm bg-slate-100 text-slate-800 active:scale-95 transition-transform flex items-center justify-center gap-2">
                <Pencil size={15} /> {isRtl ? 'ערוך ועצב את הפרופיל' : 'Edit & design profile'}
              </button>
            )}
          </div>

          {/* What I teach / want to learn */}
          <div className="px-4 pt-4">
            <div className="text-[11px] font-black uppercase tracking-widest mb-1.5" style={{ color: accent }}>
              {isMentor ? (isRtl ? 'מה אני מלמד' : 'What I teach') : (isRtl ? 'מה אני רוצה ללמוד' : 'What I want to learn')}
            </div>
            {isMyProfile ? (
              <textarea value={isMentor ? formData.who_i_want_to_teach : formData.what_i_want_to_learn} onChange={(e) => setFormData({ ...formData, [isMentor ? 'who_i_want_to_teach' : 'what_i_want_to_learn']: e.target.value })} onBlur={() => handleSave(isMentor ? 'who_i_want_to_teach' : 'what_i_want_to_learn', isMentor ? formData.who_i_want_to_teach : formData.what_i_want_to_learn)} rows={2} placeholder={isMentor ? (isRtl ? 'למשל: מלמד ספרות גברים מהיסוד — פייד, מספריים, זקן.' : 'e.g. I teach men\'s barbering from scratch.') : (isRtl ? 'למשל: רוצה ללמוד ספרות גברים אצל ספר מנוסה.' : 'e.g. I want to learn barbering from a pro.')} className="w-full text-sm text-slate-700 bg-slate-50 rounded-xl p-3 outline-none focus:bg-white focus:ring-1 resize-none" style={{ ['--tw-ring-color' as any]: accent }} />
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">{(isMentor ? profile.who_i_want_to_teach : profile.what_i_want_to_learn) || (isRtl ? 'עדיין לא נוסף מידע.' : 'No information yet.')}</p>
            )}
          </div>

          {/* Tags */}
          <div className="px-4 pt-4">
            <div className="flex flex-wrap gap-2">
              {quickTags.map((tag) => {
                const isSelected = formData.skills?.some((s: any) => s.name === tag.id);
                return (
                  <button key={tag.id} disabled={!isMyProfile} onClick={() => { let ns = [...(formData.skills || [])]; ns = isSelected ? ns.filter((s: any) => s.name !== tag.id) : [...ns, { name: tag.id, level: tag.label, verified: false }]; setFormData({ ...formData, skills: ns }); handleSave('skills', ns); }} style={isSelected ? { backgroundColor: accent, borderColor: accent } : undefined} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isSelected ? 'text-white' : 'bg-white border-slate-200 text-slate-500'} ${!isMyProfile && 'cursor-default'}`}>
                    <tag.icon size={13} /> {tag.label}
                  </button>
                );
              })}
              {formData.skills?.filter((s: any) => !quickTags.some(q => q.id === s.name)).map((s: any, i: number) => (
                <button key={'c' + i} disabled={!isMyProfile} onClick={() => { const ns = formData.skills.filter((x: any) => x.name !== s.name); setFormData({ ...formData, skills: ns }); handleSave('skills', ns); }} style={{ backgroundColor: accent, borderColor: accent }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white border">
                  {s.name}{isMyProfile && <X size={12} />}
                </button>
              ))}
              {isMyProfile && (showTagForm ? (
                <span className="flex items-center gap-1.5">
                  <input autoFocus value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }} placeholder={isRtl ? 'תגית...' : 'Tag...'} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none w-28" />
                  <button onClick={addCustomTag} disabled={!newTag.trim()} className="p-1.5 rounded-full text-white disabled:opacity-40" style={{ backgroundColor: accent }}><CheckCircle2 size={14} /></button>
                  <button onClick={() => { setShowTagForm(false); setNewTag(''); }} className="p-1.5 rounded-full bg-slate-100 text-slate-500"><X size={14} /></button>
                </span>
              ) : (
                <button onClick={() => setShowTagForm(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-dashed border-slate-300 text-slate-400"><Plus size={13} /> {isRtl ? 'תגית' : 'Tag'}</button>
              ))}
            </div>
          </div>

          {/* Grid tab label */}
          <div className="mt-5 border-t border-gray-100 flex items-center justify-center gap-2 py-2.5 text-slate-800 font-black text-xs uppercase tracking-widest">
            <Hammer size={15} /> {isMentor ? (isRtl ? 'עבודות' : 'Work') : (isRtl ? 'תיק עבודות' : 'Portfolio')}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 gap-0.5">
            {(formData.portfolio_urls || []).map((url: string, i: number) => (
              <div key={i} className="relative aspect-square group overflow-hidden bg-slate-100">
                <img src={url} alt={`work ${i}`} className="w-full h-full object-cover" />
                {isMyProfile && (
                  <button onClick={() => handleRemovePortfolioImage(url)} className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={13} /></button>
                )}
              </div>
            ))}
            {isMyProfile && (
              <label className="aspect-square bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 cursor-pointer hover:bg-slate-100">
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <><Upload size={20} /><span className="text-[10px] font-bold">{isRtl ? 'הוסף' : 'Add'}</span></>}
                <input type="file" className="hidden" accept="image/*" onChange={handlePortfolioUpload} disabled={uploading} />
              </label>
            )}
            {!isMyProfile && (!formData.portfolio_urls || formData.portfolio_urls.length === 0) && (
              <div className="col-span-3 py-12 text-center text-slate-400 text-sm font-medium">{isRtl ? 'אין עבודות עדיין.' : 'No work yet.'}</div>
            )}
          </div>

          {/* Reviews */}
          <div className="px-4 py-5 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-slate-900 flex items-center gap-1.5"><Star size={17} className="text-yellow-500 fill-yellow-500" /> {isRtl ? 'ביקורות' : 'Reviews'} ({reviews.length})</h2>
              {!isMyProfile && (
                <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-xs font-black" style={{ color: accent }}>{isRtl ? 'כתוב ביקורת' : 'Write a review'}</button>
              )}
            </div>

            {showReviewForm && !isMyProfile && (
              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setNewReview({ ...newReview, rating: s, professional: s, teaching: s, workEthic: s, reliability: s })}>
                      <Star size={22} className={s <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
                    </button>
                  ))}
                </div>
                <textarea value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} rows={2} placeholder={isRtl ? 'איך הייתה החוויה?' : 'How was it?'} className="w-full text-sm bg-white rounded-lg p-2.5 outline-none border border-slate-200 resize-none" />
                <button onClick={handleAddReview} disabled={saving} className="px-4 py-2 rounded-lg text-white text-sm font-black disabled:opacity-50" style={{ backgroundColor: accent }}>{saving ? '...' : (isRtl ? 'שלח ביקורת' : 'Submit')}</button>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium">{isRtl ? 'אין ביקורות עדיין.' : 'No reviews yet.'}</p>
            ) : (
              reviews.slice(0, 6).map((review: any) => (
                <div key={review.id} className="flex gap-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-black overflow-hidden shrink-0">
                    {review.fromAvatar ? <img src={review.fromAvatar} alt="" className="w-full h-full object-cover" /> : (review.fromName?.charAt(0) || 'U')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{review.fromName}</span>
                      <span className="flex gap-0.5">{[1, 2, 3, 4, 5].map((s) => (<Star key={s} size={11} className={s <= (review.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-200'} />))}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Own-profile footer */}
          {isMyProfile && (
            <div className="px-4 py-4 border-t border-gray-100 flex justify-center">
              <button onClick={async () => { await signOut(); navigate('/'); }} className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-red-500">
                <LogOut size={15} /> {isRtl ? 'התנתקות' : 'Sign out'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
