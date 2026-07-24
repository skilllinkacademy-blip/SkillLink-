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

  return (
    <div className={`max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 ${hasPageBg ? 'p-3 sm:p-5 rounded-3xl shadow-sm profile-glass' : ''}`} style={{ ['--pa' as any]: accent, background: pageBackground }}>

      {/* ===== Design panel (own profile) ===== */}
      {isMyProfile && showDesignPanel && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDesignPanel(false)} />
          <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">{isRtl ? 'עיצוב הדף שלך' : 'Design your page'}</h3>
              <button onClick={() => setShowDesignPanel(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? 'תבנית' : 'Template'}</div>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { const nd = { ...design, template: t.id }; setDesign(nd); handleSave('page_design', nd); }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all ${design.template === t.id ? 'border-slate-900' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <div className="h-10 rounded-lg mb-2" style={{ background: t.id === 'dark' ? 'linear-gradient(135deg,#1e293b,#020617)' : t.id === 'warm' ? 'linear-gradient(135deg,#b45309,#431407)' : `linear-gradient(135deg, ${accent}, #0f172a)` }} />
                    <div className="text-[11px] font-black text-slate-700">{isRtl ? t.labelHe : t.labelEn}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? 'צבע הבאנר' : 'Banner color'}</div>
              <div className="flex flex-wrap gap-3 items-center">
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { const nd = { ...design, bannerColor: c }; setDesign(nd); handleSave('page_design', nd); }}
                    className={`w-9 h-9 rounded-full transition-all ${design.bannerColor === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
                <button onClick={() => { const nd = { ...design, bannerColor: '' }; setDesign(nd); handleSave('page_design', nd); }} className="text-[11px] font-bold text-slate-500 underline">{isRtl ? 'לפי תבנית' : 'By template'}</button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? 'רקע העמוד' : 'Page background'}</div>
              <div className="flex flex-wrap gap-3 items-center">
                {PAGE_BG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { const nd = { ...design, pageBgColor: c, pageBgImage: '' }; setDesign(nd); handleSave('page_design', nd); }}
                    className={`w-9 h-9 rounded-full border border-slate-200 transition-all ${design.pageBgColor === c && !design.pageBgImage ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
                <button onClick={() => { const nd = { ...design, pageBgColor: '', pageBgImage: '' }; setDesign(nd); handleSave('page_design', nd); }} className="text-[11px] font-bold text-slate-500 underline">{isRtl ? 'ללא' : 'None'}</button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer text-xs font-bold text-slate-700">
                  <Upload size={14} />
                  {isRtl ? 'העלה תמונת רקע' : 'Upload background image'}
                  <input type="file" className="hidden" accept="image/*" onChange={handlePageBgUpload} disabled={uploading} />
                </label>
                {design.pageBgImage && (
                  <button onClick={() => { const nd = { ...design, pageBgImage: '' }; setDesign(nd); handleSave('page_design', nd); }} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={14} /></button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">{isRtl ? 'צבע ראשי' : 'Accent color'}</div>
              <div className="flex flex-wrap gap-3">
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { const nd = { ...design, accent: c }; setDesign(nd); handleSave('page_design', nd); }}
                    className={`w-9 h-9 rounded-full transition-all ${design.accent === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{isRtl ? 'מה להציג בדף' : 'Sections'}</div>
              {[
                { key: 'tags', labelHe: 'תגיות מקצועיות', labelEn: 'Professional tags' },
                { key: 'gallery', labelHe: isMentor ? 'גלריית עבודות' : 'תיק עבודות', labelEn: isMentor ? 'Work gallery' : 'Portfolio' },
                { key: 'reviews', labelHe: 'ביקורות', labelEn: 'Reviews' },
              ].map((s) => {
                const on = (design.sections as any)[s.key];
                return (
                  <div key={s.key} className="flex items-center justify-between py-2">
                    <span className="text-sm font-bold text-slate-700">{isRtl ? s.labelHe : s.labelEn}</span>
                    <button
                      onClick={() => { const nd = { ...design, sections: { ...design.sections, [s.key]: !on } }; setDesign(nd); handleSave('page_design', nd); }}
                      className={`w-11 h-6 rounded-full transition-all relative ${on ? '' : 'bg-slate-200'}`}
                      style={on ? { backgroundColor: accent } : undefined}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? (isRtl ? 'left-0.5' : 'right-0.5') : (isRtl ? 'right-0.5' : 'left-0.5')}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            <button onClick={() => setShowDesignPanel(false)} className="w-full py-3 rounded-2xl font-black text-white" style={{ backgroundColor: accent }}>
              {isRtl ? 'סיימתי' : 'Done'}
            </button>
          </div>
        </div>
      )}

      {/* Profile Completion Bar — own profile + incomplete */}
      {isMyProfile && completionPercentage < 100 && (
        <div className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold text-slate-900">
              {isRtl ? 'השלם את הפרופיל שלך' : 'Complete your profile'}
            </span>
            <span className="text-sm font-black text-amber-600">{completionPercentage}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-semibold">
            {isRtl
              ? 'ככל שתמלא יותר — ההתאמות שלך יהיו מדויקות יותר.'
              : 'The more you fill in, the more accurate your matches become.'}
          </p>
          {missingLabels.length > 0 && (
            <p className="text-[11px] text-slate-400 mt-1">
              {isRtl ? 'עוד חסר: ' : 'Still missing: '}
              {missingLabels.join(' · ')}
            </p>
          )}
        </div>
      )}
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* ===== Landing-page hero: identity overlaid on the cover ===== */}
        <div className="relative h-64 sm:h-80 bg-slate-900 group/cover">
          {formData.cover_url ? (
            <img src={formData.cover_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: heroBg }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 pointer-events-none" />

          {isMyProfile && (
            <label className="absolute top-4 right-4 p-2.5 bg-black/40 text-white rounded-xl hover:bg-black/70 transition-all backdrop-blur-md cursor-pointer z-30 border border-white/20 flex items-center gap-2 text-[11px] font-bold">
              <Camera size={16} />
              <span className="hidden sm:inline">{isRtl ? 'החלף תמונת רקע' : 'Change cover'}</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploading} />
            </label>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-40">
              <Loader2 className="animate-spin text-white" size={32} />
            </div>
          )}

          {profile.role === 'mentor' && (
            <div className="absolute top-4 left-4 z-20">
              {(profile.is_verified || profile.verification_status === 'approved') ? (
                <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
                  <ShieldCheck size={14} fill="currentColor" />
                  {isRtl ? 'מנטור מאומת' : 'Verified Mentor'}
                </span>
              ) : (
                <span className="px-3 py-1 bg-black/40 text-white/90 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 border border-white/20 backdrop-blur-md">
                  {isRtl ? 'מנטור בבדיקה' : 'Pending Mentor'}
                </span>
              )}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 z-20">
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-slate-600 to-slate-800 border-4 border-white flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-2xl overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={resolveAsset(profile.avatar_url) || ''} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    profile.full_name?.charAt(0) || 'U'
                  )}
                </div>
                {isMyProfile && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1 z-10">
                    <label className="p-2 bg-white text-black rounded-lg shadow-lg border border-white hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center">
                      <Camera size={14} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                    </label>
                    {profile.avatar_url && (
                      <button
                        onClick={handleRemoveAvatar}
                        disabled={uploading}
                        className="p-2 bg-white text-red-600 rounded-lg shadow-lg border border-white hover:bg-red-50 transition-all cursor-pointer flex items-center justify-center"
                        title={isRtl ? 'הסר תמונה' : 'Remove Image'}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pb-1">
                {isMyProfile ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    onBlur={() => handleSave('full_name', formData.full_name)}
                    placeholder={isRtl ? 'השם שלך' : 'Your name'}
                    className="text-2xl sm:text-3xl font-black text-white bg-white/10 focus:bg-white/20 border border-white/25 outline-none px-3 py-1 rounded-xl w-full max-w-sm transition-all placeholder:text-white/50"
                  />
                ) : (
                  <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">{profile.full_name}</h1>
                )}

                {isMyProfile ? (
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({...formData, headline: e.target.value})}
                    onBlur={() => handleSave('headline', formData.headline)}
                    placeholder={placeholders.headline}
                    className="mt-1.5 text-sm font-semibold text-white bg-white/10 focus:bg-white/20 border border-white/25 outline-none px-3 py-1 rounded-lg w-full max-w-md transition-all placeholder:text-white/50"
                  />
                ) : (
                  <p className="mt-1 text-sm sm:text-lg font-semibold text-white/90 drop-shadow">{profile.headline || profile.occupation || (isRtl ? 'משתמש SkillLink' : 'SkillLink User')}</p>
                )}

                <div className="mt-2 flex items-center gap-1.5 text-white/75 text-xs sm:text-sm font-medium">
                  <MapPin size={14} />
                  <span>{profile.city || (isRtl ? 'מיקום לא צוין' : 'Location not set')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-400 min-w-0 truncate">
            {isMyProfile
              ? (saving ? (isRtl ? 'שומר...' : 'Saving...') : (isRtl ? 'זה הפרופיל הציבורי שלך — ככה אחרים רואים אותך' : 'This is your public page — how others see you'))
              : (isMentor ? (isRtl ? 'מנטור · פתוח לחניכים' : 'Mentor · open to apprentices') : (isRtl ? 'מתלמד · מחפש ללמוד' : 'Apprentice · looking to learn'))}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {!isMyProfile && (
              <button
                onClick={() => navigate('/app/messages', { state: { recipientId: profile.id, recipientName: profile.full_name } })}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
              >
                <MessageSquare size={16} />
                {isRtl ? 'שלח הודעה' : 'Message'}
              </button>
            )}
            {isMyProfile && (
              <button
                onClick={() => setShowDesignPanel(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white rounded-lg transition-all active:scale-95 shadow-sm"
                style={{ backgroundColor: accent }}
              >
                <Pencil size={13} />
                {isRtl ? 'עצב את הדף' : 'Design'}
              </button>
            )}
            {isMyProfile && (
              <button
                onClick={async () => { await signOut(); navigate('/'); }}
                className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-lg transition-colors"
              >
                <LogOut size={13} />
                {isRtl ? 'יציאה' : 'Logout'}
              </button>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-8 pb-5 sm:pb-8 pt-6 relative">

          <div className="mt-5 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="text-lg font-black text-black">
                {isMentor ? (
                  isMyProfile ? (
                    <div className="space-y-1 flex flex-col items-center">
                      <input 
                        type="number" 
                        value={formData.years_experience} 
                        onChange={(e) => setFormData({...formData, years_experience: parseInt(e.target.value) || 0})}
                        onBlur={() => handleSave('years_experience', formData.years_experience)}
                        className="w-16 bg-transparent text-center outline-none focus:bg-white rounded-lg transition-all"
                      />
                      {renderProfileHelper(isRtl ? 'ניסיון' : 'Experience')}
                    </div>
                  ) : (profile.years_experience || 0)
                ) : (isRtl ? 'מתחיל' : 'Beginner')}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                {isMentor ? (isRtl ? 'שנות ניסיון' : 'Years Exp') : (isRtl ? 'רמה' : 'Level')}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="text-lg font-black text-black">
                {isMyProfile ? (
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      onBlur={() => handleSave('city', formData.city)}
                      placeholder={isRtl ? 'עיר' : 'City'}
                      className="w-full bg-transparent text-center outline-none focus:bg-white rounded-lg transition-all px-2"
                    />
                    {renderProfileHelper(isRtl ? 'מיקום' : 'Location')}
                  </div>
                ) : (profile.city || '---')}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{isRtl ? 'עיר' : 'City'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="text-lg font-black text-black">
                {isMyProfile ? (
                  <div className="space-y-1">
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      onBlur={() => handleSave('phone', formData.phone)}
                      placeholder="05x-xxxxxxx"
                      className="w-full bg-transparent text-center outline-none focus:bg-white rounded-lg transition-all px-2"
                    />
                    {renderProfileHelper(isRtl ? 'טלפון' : 'Phone')}
                  </div>
                ) : (profile.phone || '---')}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{isRtl ? 'טלפון' : 'Phone'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <div className="text-lg font-black text-black">
                {isMyProfile ? (
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      value={formData.availability} 
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      onBlur={() => handleSave('availability', formData.availability)}
                      placeholder={placeholders.availability}
                      className="w-full bg-transparent text-center outline-none focus:bg-white rounded-lg transition-all px-2"
                    />
                    {renderProfileHelper(isRtl ? 'זמינות' : 'Availability')}
                  </div>
                ) : (profile.availability || profile.workload || '---')}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{isRtl ? 'זמינות' : 'Availability'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl text-center relative overflow-hidden group">
              <div className="text-lg font-black text-black">
                {trustScore}%
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{isRtl ? 'מדד אמינות' : 'Trust Score'}</div>
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
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{isRtl ? 'סטטוס' : 'Status'}</div>
            </div>
          </div>
        </div>
      </div>
      <div className={`${hasPageBg ? '' : 'profile-editorial '}grid grid-cols-1 lg:grid-cols-12 gap-8`}>
        {/* Left Column: Bio & Info */}
        <div className="lg:col-span-8 space-y-8">
          <div id="profile-tabs" className="flex gap-4 border-b border-gray-200 pb-4 overflow-x-auto no-scrollbar scroll-smooth">
            <button 
              onClick={() => setActiveTab('about')}
              className={`text-base sm:text-lg font-black transition-colors whitespace-nowrap ${activeTab === 'about' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {isRtl ? 'אודות' : 'About'}
            </button>
            {isMyProfile && (
              <button 
                onClick={() => setActiveTab('saved')}
                className={`text-base sm:text-lg font-black transition-colors whitespace-nowrap ${activeTab === 'saved' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {isRtl ? 'מועדפים' : 'Saved'} ({savedOpportunities.length})
              </button>
            )}
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`text-base sm:text-lg font-black transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {isRtl ? 'ביקורות' : 'Reviews'} ({reviews.length})
            </button>
          </div>

          {activeTab === 'about' && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-black">{isRtl ? 'קצת עלי' : 'Bio'}</h2>
                  {isMyProfile && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isRtl ? 'פרופיל עסקי' : 'Business Mode'}
                      </span>
                      <button 
                        onClick={() => {
                          const newVal = !formData.isBusiness;
                          setFormData({...formData, isBusiness: newVal});
                          handleSave('isBusiness', newVal);
                        }}
                        className={`w-10 h-5 rounded-full transition-all relative ${formData.isBusiness ? 'bg-blue-600' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isRtl ? (formData.isBusiness ? 'left-0.5' : 'right-0.5') : (formData.isBusiness ? 'right-0.5' : 'left-0.5')}`} />
                      </button>
                    </div>
                  )}
                </div>

                {isMyProfile ? (
                  <div className="space-y-2">
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      onBlur={() => handleSave('bio', formData.bio)}
                      rows={4}
                      placeholder={placeholders.bio}
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black transition-all font-medium outline-none resize-none"
                    />
                    {renderProfileHelper(isRtl ? 'ספר על עצמך, הערכים שלך ומה הביא אותך לתחום.' : 'Tell about yourself, your values and what brought you to the field.')}
                  </div>
                ) : (
                  <p className="text-gray-500 font-medium leading-relaxed text-lg">
                    {profile.bio || (isRtl ? 'עדיין לא נוסף תיאור אישי.' : 'No bio added yet.')}
                  </p>
                )}

                {/* Business Information Section */}
                {(formData.isBusiness || profile.isBusiness) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-6 border-t border-gray-50 space-y-6"
                  >
                    <div className="flex items-center gap-3">
                       <Briefcase size={24} className="text-blue-600" />
                       <h3 className="text-xl font-black text-black">{isRtl ? 'פרטי העסק' : 'Business Details'}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'תיאור העסק' : 'Business Description'}</label>
                        {isMyProfile ? (
                          <div className="space-y-2">
                            <textarea 
                              value={formData.businessDescription}
                              onChange={(e) => setFormData({...formData, businessDescription: e.target.value})}
                              onBlur={() => handleSave('businessDescription', formData.businessDescription)}
                              rows={3}
                              placeholder={isMentor ? placeholders.bio : (isRtl ? 'ספר על השירותים שאתה מציע כחלק מהעסק שלך...' : 'Tell about the services you offer as part of your business...')}
                              className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-2xl focus:bg-white focus:border-blue-600 transition-all font-medium outline-none resize-none"
                            />
                            {renderProfileHelper(isRtl ? 'תיאור המקצועיות של העסק שלך.' : 'Professional description of your business.')}
                          </div>
                        ) : (
                          <p className="text-gray-600 font-medium">{profile.businessDescription || (isRtl ? 'אין תיאור עסק עדיין.' : 'No business description.')}</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'לוגו העסק' : 'Business Logo'}</label>
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                              {formData.businessLogo ? (
                                <img src={formData.businessLogo} alt="Logo" className="w-full h-full object-cover" />
                              ) : (
                                <Briefcase className="text-slate-300" size={24} />
                              )}
                           </div>
                           {isMyProfile && (
                             <label className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all">
                                {isRtl ? 'העלה לוגו' : 'Upload Logo'}
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*" 
                                  onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                      const file = e.target.files[0];
                                      const reader = new FileReader();
                                      reader.onload = async () => {
                                        const base64 = reader.result as string;
                                        setFormData({...formData, businessLogo: base64});
                                        handleSave('businessLogo', base64);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }} 
                                />
                             </label>
                           )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'אתר אינטרנט' : 'Website'}</label>
                        {isMyProfile ? (
                          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl focus-within:border-blue-600 transition-all">
                            <Globe size={16} className="text-slate-400" />
                            <input 
                              type="url" 
                              value={formData.businessWebsite}
                              onChange={(e) => setFormData({...formData, businessWebsite: e.target.value})}
                              onBlur={() => handleSave('businessWebsite', formData.businessWebsite)}
                              placeholder={isRtl ? 'כתובת האתר...' : 'Enter website URL...'}
                              className="bg-transparent border-none outline-none text-sm font-bold w-full"
                            />
                          </div>
                        ) : profile.businessWebsite && (
                          <a href={profile.businessWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
                            <Globe size={16} />
                            {profile.businessWebsite.replace(/^https?:\/\//, '')}
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>

                      {/* Social Links */}
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'קישורים חברתיים' : 'Social Links'}</label>
                         <div className="flex gap-4">
                            {['facebook', 'instagram', 'linkedin'].map((platform) => {
                              const typedPlatform = platform as 'facebook' | 'instagram' | 'linkedin';
                              return isMyProfile ? (
                                <div key={platform} className="relative group">
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-600 group-focus-within:border-blue-600 cursor-pointer">
                                    <Globe size={18} className="text-slate-400 group-hover:text-blue-600" />
                                  </div>
                                  {/* Minimal popup for input */}
                                  <input 
                                    className="hidden group-focus-within:block absolute top-full left-0 mt-2 p-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 text-xs font-bold outline-none min-w-[150px]"
                                    placeholder={`${platform} link`}
                                    value={formData.businessSocialLinks[typedPlatform]}
                                    onChange={(e) => {
                                      const newLinks = { ...formData.businessSocialLinks, [typedPlatform]: e.target.value };
                                      setFormData({ ...formData, businessSocialLinks: newLinks });
                                    }}
                                    onBlur={() => handleSave('businessSocialLinks', formData.businessSocialLinks)}
                                  />
                                </div>
                              ) : profile.businessSocialLinks && JSON.parse(profile.businessSocialLinks)[typedPlatform] && (
                                <a key={platform} href={JSON.parse(profile.businessSocialLinks)[typedPlatform]} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-600">
                                  <Globe size={18} />
                                </a>
                              );
                            })}
                         </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div className="pt-6 mt-2 border-t border-gray-50">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 p-5 sm:p-6">
                    <div className="flex items-start gap-3 mb-1">
                      <div className="w-11 h-11 rounded-xl text-white flex items-center justify-center shrink-0 shadow-lg" style={{ backgroundColor: accent }}>
                        {isMentor ? <Users size={22} /> : <Hammer size={22} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-black text-slate-900">
                            {isMentor ? (isRtl ? 'את מי אני רוצה ללמד?' : 'Who I want to teach?') : (isRtl ? 'מה אני רוצה ללמוד?' : 'What I want to learn?')}
                          </h3>
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-100">
                            {isRtl ? 'משפיע על ההתאמה' : 'Powers matching'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-0.5">
                          {isMentor
                            ? (isRtl ? 'תאר את החניך האידיאלי ואת התחום שתלמד — לפי זה נחליט למי להציג אותך.' : 'Describe your ideal apprentice and the field you teach — this decides who sees you.')
                            : (isRtl ? 'תאר בדיוק מה אתה רוצה ללמוד ומאיזה תחום — לפי זה נמצא לך את ההתאמות הטובות ביותר.' : 'Describe exactly what you want to learn and in which field — we find your best matches by this.')}
                        </p>
                      </div>
                    </div>
                    {isMyProfile ? (
                      <textarea
                        value={isMentor ? formData.who_i_want_to_teach : formData.what_i_want_to_learn}
                        onChange={(e) => setFormData({...formData, [isMentor ? 'who_i_want_to_teach' : 'what_i_want_to_learn']: e.target.value})}
                        onBlur={() => handleSave(isMentor ? 'who_i_want_to_teach' : 'what_i_want_to_learn', isMentor ? formData.who_i_want_to_teach : formData.what_i_want_to_learn)}
                        rows={3}
                        placeholder={isMentor
                          ? (isRtl ? 'למשל: מחפש מתלמד רציני לתחום החשמל, בלי ניסיון קודם, שרוצה ללמוד עבודה בשטח.' : 'e.g. Looking for a serious apprentice in electrical work, no experience needed, wants hands-on field work.')
                          : (isRtl ? 'למשל: רוצה ללמוד ספרות גברים — תספורות, פייד ועיצוב זקן — אצל ספר מנוסה בפתח תקווה.' : 'e.g. I want to learn men\'s barbering — cuts, fades and beard styling — with an experienced barber in my area.')}
                        className="mt-3 w-full p-4 bg-white border border-blue-100 rounded-xl focus:border-blue-500 transition-all font-medium outline-none resize-none"
                      />
                    ) : (
                      <p className="mt-3 text-slate-700 font-semibold leading-relaxed text-base sm:text-lg">
                        {(isMentor ? profile.who_i_want_to_teach : profile.what_i_want_to_learn) || (isRtl ? 'עדיין לא נוסף מידע.' : 'No information added yet.')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional DNA / Quick Tags */}
              {design.sections.tags && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-sm space-y-6">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-[0.2em]">
                      Professional DNA
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
                      <Zap size={32} className="text-blue-600" />
                      {isRtl ? 'תגיות מקצועיות' : 'Professional Tags'}
                    </h2>
                    <p className="text-slate-500 font-medium max-w-md text-sm sm:text-base">
                      {isRtl ? 'תגיות מהירות המעידות על היכולות והזמינות שלך בשטח.' : 'Quick tags representing your field capabilities and availability.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {quickTags.map((tag) => {
                    const isSelected = formData.skills?.some((s: any) => s.name === tag.id);
                    return (
                      <button
                        key={tag.id}
                        disabled={!isMyProfile}
                        onClick={() => {
                          let newSkills = [...(formData.skills || [])];
                          if (isSelected) {
                            newSkills = newSkills.filter((s: any) => s.name !== tag.id);
                          } else {
                            newSkills.push({ name: tag.id, level: tag.label, verified: false });
                          }
                          setFormData({ ...formData, skills: newSkills });
                          handleSave('skills', newSkills);
                        }}
                        style={isSelected ? { backgroundColor: accent, borderColor: accent } : undefined}
                        className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all border ${
                          isSelected
                            ? 'text-white shadow-sm'
                            : 'bg-white/70 border-slate-200 text-slate-500 hover:border-slate-300'
                        } ${!isMyProfile && 'cursor-default'}`}
                      >
                        <tag.icon size={16} />
                        {tag.label}
                      </button>
                    );
                  })}
                  
                  {isMyProfile && (
                    <div className="flex items-center gap-2">
                      {showTagForm ? (
                        <div className="flex items-center gap-2 animate-in slide-in-from-left-4">
                          <input
                            type="text"
                            autoFocus
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder={isRtl ? 'תגית מותאמת...' : 'Custom tag...'}
                            className="px-4 py-3 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none focus:border-slate-400"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); }
                            }}
                          />
                          <button onClick={addCustomTag} disabled={!newTag.trim()} className="p-3 rounded-full text-white disabled:opacity-40" style={{ backgroundColor: accent }} title={isRtl ? 'הוסף' : 'Add'}>
                            <CheckCircle2 size={16} />
                          </button>
                          <button onClick={() => { setShowTagForm(false); setNewTag(''); }} className="p-3 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowTagForm(true)}
                          className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all border-2 border-dashed border-slate-200"
                        >
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Gallery */}
              {design.sections.gallery && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-black text-black">
                    {isMentor
                      ? (isRtl ? 'גלריית עבודות' : 'Gallery of Work')
                      : (isRtl ? 'תיק עבודות / דוגמאות' : 'Portfolio / Samples')}
                  </h2>
                  {isMyProfile && (
                    <label className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer flex items-center gap-1">
                      <Upload size={16} />
                      {isRtl ? 'הוסף תמונה' : 'Add Image'}
                      <input type="file" className="hidden" accept="image/*" onChange={handlePortfolioUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {formData.portfolio_urls && formData.portfolio_urls.length > 0 ? (
                    formData.portfolio_urls.map((url, i) => (
                      <div key={i} className="min-w-[200px] sm:min-w-[240px] h-32 sm:h-40 rounded-2xl border border-gray-100 relative group overflow-hidden shrink-0">
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
                      {isMentor
                        ? (isRtl ? 'אין תמונות בגלריה עדיין.' : 'No images in gallery yet.')
                        : (isRtl ? 'הוסף דוגמאות עבודה או תיק עבודות שיראו מנטורים.' : 'Add work samples or a portfolio for mentors to see.')}
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Social proof — reviews preview */}
              {design.sections.reviews && reviews.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl sm:text-2xl font-black text-black flex items-center gap-2">
                      <Star size={22} className="text-yellow-500 fill-yellow-500" />
                      {isRtl ? 'מה אומרים עליי' : 'What people say'}
                    </h2>
                    <button onClick={() => setActiveTab('reviews')} className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap">
                      {isRtl ? `כל הביקורות (${reviews.length})` : `All reviews (${reviews.length})`}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {reviews.slice(0, 2).map((review: any) => (
                      <div key={review.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-2">
                        <div className="flex gap-0.5 text-yellow-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={14} fill={s <= (review.rating || 0) ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">"{review.comment}"</p>
                        <div className="text-xs font-black text-slate-400">— {review.fromName || (isRtl ? 'משתמש' : 'User')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* Stats Summary */}
              {reviewsStats && reviewsStats.stats && reviewsStats.stats.total > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                   <div className="flex flex-col items-center justify-center text-center space-y-2 border-b md:border-b-0 md:border-e border-gray-100 pb-6 md:pb-0">
                      <div className="text-6xl font-black text-black">
                        {reviewsStats.stats.overallAvg ? reviewsStats.stats.overallAvg.toFixed(1) : '0.0'}
                      </div>
                      <div className="flex gap-1 text-yellow-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={20} fill={s <= Math.round(reviewsStats.stats.overallAvg || 0) ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest italic">
                        {isRtl ? `${reviewsStats.stats.total} ביקורות` : `${reviewsStats.stats.total} Reviews`}
                      </div>
                   </div>

                   <div className="space-y-4 px-4 border-b md:border-b-0 md:border-e border-gray-100 pb-6 md:pb-0">
                      {[
                        { label: isRtl ? 'מקצועיות' : 'Professionalism', val: reviewsStats.stats.avgProfessional },
                        { label: isRtl ? 'איכות הוראה' : 'Teaching Quality', val: reviewsStats.stats.avgTeaching },
                        { label: isRtl ? 'מוסר עבודה' : 'Work Ethic', val: reviewsStats.stats.avgWorkEthic }
                      ].map(cat => (
                        <div key={cat.label} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <span>{cat.label}</span>
                             <span>{cat.val ? cat.val.toFixed(1) : '---'}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(cat.val || 0) * 20}%` }} />
                          </div>
                        </div>
                      ))}
                   </div>

                   <div className="space-y-2 pt-4 md:pt-0">
                      {[5,4,3,2,1].map(stars => {
                         const dist = reviewsStats.distribution?.find((d: any) => d.stars === stars);
                         const percentage = reviewsStats.stats.total ? Math.round(((dist?.count || 0) / reviewsStats.stats.total) * 100) : 0;
                         return (
                           <div key={stars} className="flex items-center gap-3 text-xs font-bold text-gray-400">
                              <span className="w-3">{stars}</span>
                              <Star size={12} fill="currentColor" className="text-yellow-400" />
                              <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden">
                                 <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
                              </div>
                              <span className="w-6 text-[10px]">{dist?.count || 0}</span>
                           </div>
                         );
                      })}
                   </div>
                </div>
              )}

              {!isMyProfile && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform" />
                  
                  <div className="flex justify-between items-center relative z-10">
                    <h2 className="text-2xl font-black text-black">{isRtl ? 'דרג את החוויה שלך' : 'Review Experience'}</h2>
                    <button 
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        showReviewForm ? 'bg-red-50 text-red-600' : 'bg-blue-600 text-white shadow-lg'
                      }`}
                    >
                      {showReviewForm ? (isRtl ? 'ביטול' : 'Cancel') : (isRtl ? 'כתוב ביקורת' : 'Write Review')}
                    </button>
                  </div>
                  
                  {showReviewForm && (
                     <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8 relative z-10"
                     >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {/* Main Rating */}
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'דירוג כללי' : 'Overall Rating'}</label>
                              <div className="flex gap-2">
                                {[1,2,3,4,5].map(star => (
                                  <button 
                                    key={star}
                                    onClick={() => setNewReview({...newReview, rating: star})}
                                    className="transition-transform active:scale-90 hover:scale-110"
                                  >
                                    <Star 
                                      size={32} 
                                      className={star <= newReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} 
                                    />
                                  </button>
                                ))}
                              </div>
                           </div>

                           {/* Categories */}
                           <div className="space-y-4">
                              {[
                                { id: 'professional', label: isRtl ? 'מקצועיות' : 'Professionalism' },
                                { id: 'teaching', label: isRtl ? 'איכות הוראה' : 'Teaching Quality' },
                                { id: 'workEthic', label: isRtl ? 'מוסר עבודה' : 'Work Ethic' },
                                { id: 'reliability', label: isRtl ? 'אמינות' : 'Reliability' }
                              ].map(cat => (
                                <div key={cat.id} className="flex items-center justify-between gap-4">
                                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cat.label}</span>
                                   <div className="flex gap-1">
                                      {[1,2,3,4,5].map(star => (
                                        <button 
                                          key={star}
                                          onClick={() => setNewReview({...newReview, [cat.id]: star})}
                                          className="transition-all"
                                        >
                                          <Star 
                                            size={14} 
                                            className={star <= (newReview as any)[cat.id] ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} 
                                          />
                                        </button>
                                      ))}
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                              <span>{isRtl ? 'פירוט הביקורת' : 'Detailed Review'}</span>
                              <span>{newReview.comment.length} / 500</span>
                           </div>
                           <textarea 
                             value={newReview.comment}
                             onChange={(e) => setNewReview({...newReview, comment: e.target.value.substring(0, 500)})}
                             placeholder={isRtl ? 'ספר על הליך הלמידה, המקצועיות והזמינות...' : 'Tell about the learning process, professionalism and availability...'}
                             rows={4}
                             className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600 transition-all font-medium outline-none resize-none"
                           />
                        </div>

                        <button 
                          onClick={handleAddReview}
                          disabled={saving || !newReview.comment.trim()}
                          className="w-full py-5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-sm disabled:opacity-50 shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
                        >
                          {saving ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} className="fill-current" />}
                          {isRtl ? 'שלח ביקורת מאומתת' : 'Submit Verified Review'}
                        </button>
                     </motion.div>
                  )}
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-xl font-black">{isRtl ? 'ביקורות אחרונות' : 'Recent Reviews'}</h3>
                   <Link to={`/app/u/${profile.username}/reviews`} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                      {isRtl ? 'הצג את כל הביקורות' : 'View All Reviews'}
                   </Link>
                </div>

                {loadingReviews ? (
                  <div className="grid gap-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="grid gap-6">
                    {reviews.slice(0, 3).map((review) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={review.id} 
                        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg overflow-hidden border border-slate-100">
                              {review.fromAvatar ? (
                                <img src={review.fromAvatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                review.fromName?.charAt(0) || 'U'
                              )}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 flex items-center gap-2">
                                {review.fromName}
                                {review.fromVerified === 1 && <ShieldCheck size={14} className="text-blue-500" />}
                              </p>
                              <div className="flex gap-0.5 text-yellow-500">
                                {[1,2,3,4,5].map(star => (
                                  <Star 
                                    key={star} 
                                    size={12} 
                                    fill={star <= ((review.professional + review.teaching + review.workEthic + review.reliability) / 4) ? "currentColor" : "none"} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            {new Date(review.createdAt).toLocaleDateString(isRtl ? 'he-IL' : 'en-US')}
                          </span>
                        </div>
                        <p className="text-gray-600 font-medium leading-relaxed italic">
                          "{review.comment}"
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-10 sm:p-16 text-center space-y-6">
                    <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
                      <Star className="text-gray-200" size={40} />
                    </div>
                    <p className="text-gray-400 font-black uppercase tracking-widest">
                      {isRtl ? 'אין ביקורות עדיין.' : 'No reviews yet.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'saved' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900">{isRtl ? 'הזדמנויות שמורות' : 'Saved Opportunities'}</h2>
                  <p className="text-slate-500 text-sm font-medium">{isRtl ? 'הצעות ששמרת לעיון מאוחר' : 'Opportunities you saved for later'}</p>
                </div>
              </div>
              
              {loadingSaved ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2].map(i => (
                    <div key={i} className="h-96 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                  ))}
                </div>
              ) : savedOpportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {savedOpportunities.map(opp => (
                    <div key={opp.id}>
                      <OpportunityCard 
                        opportunity={opp} 
                        isRtl={isRtl} 
                        currentUserId={user?.id}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="industrial-card p-24 text-center space-y-8">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <Heart className="text-slate-200" size={48} />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{isRtl ? 'אין הזדמנויות שמורות' : 'No saved opportunities'}</h2>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                      {isRtl ? 'הזדמנויות שתשמור בפיד יופיעו כאן לצפייה מהירה.' : 'Opportunities you save in the feed will appear here for quick access.'}
                    </p>
                  </div>
                  <Link 
                    to="/app/opportunities"
                    className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-slate-800 transition-all inline-flex"
                  >
                    {isRtl ? 'חפש הזדמנויות' : 'Browse Opportunities'}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-8 shadow-xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl sm:text-2xl font-black leading-tight">
                {isMentor ? (isRtl ? 'מוכן לחלוק את הידע שלך?' : 'Ready to share your skills?') : (isRtl ? 'מוכן להתחיל ללמוד?' : 'Ready to start learning?')}
              </h3>
              <p className="text-gray-400 font-medium text-sm sm:text-base">
                {isMentor 
                  ? (isRtl ? 'התחבר למתלמדים רציניים ועצב את דור העתיד.' : 'Connect with eager apprentices and shape the next generation.') 
                  : (isRtl ? 'מצא מנטור מומחה והתחל את הקריירה שלך.' : 'Find a master mentor and jumpstart your career in the trades.')}
              </p>
              <button 
                onClick={() => navigate(isMentor ? '/app/opportunities/new' : '/app/opportunities')}
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isMentor ? (isRtl ? 'פרסם התלמדות' : 'Post a Mentorship') : (isRtl ? 'מצא מנטור' : 'Find a Mentor')}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {!isMyProfile && (
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to={`/app/u/${profile.username}/reviews`}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all gap-2"
              >
                <Star className="text-yellow-500" size={24} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{isRtl ? 'ביקורות' : 'Reviews'}</span>
              </Link>
              <button 
                onClick={() => {
                  setActiveTab('reviews');
                  setShowReviewForm(true);
                  // Scroll to reviews section
                  const el = document.getElementById('profile-tabs');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all gap-2"
              >
                <Pencil className="text-blue-600" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{isRtl ? 'דרג' : 'Rate'}</span>
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gray-50 rounded-full -z-10"></div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Info size={14} />
              {isRtl ? 'פרטי פרופיל' : 'Profile Details'}
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <MapPin size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isRtl ? 'מיקום' : 'Location'}</p>
                  {isMyProfile ? (
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      onBlur={() => handleSave('city', formData.city)}
                      className="text-sm font-bold text-black bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded-lg transition-all w-full border-b border-transparent focus:border-blue-200"
                      placeholder={isRtl ? 'הוסף מיקום...' : 'Add location...'}
                    />
                  ) : (
                    <p className="text-sm font-bold text-black">{profile.city || (isRtl ? 'לא צוין' : 'Not specified')}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Briefcase size={20} />
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
                      placeholder={isRtl ? 'למשל: בקרים בלבד, גמיש, או זמין למשרה מלאה' : 'e.g. Mornings only, flexible, or available full-time'}
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

      {/* Logout — shown only on own profile */}
      {isMyProfile && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={async () => { await signOut(); navigate('/'); }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-xl transition-all"
          >
            <LogOut size={15} />
            {isRtl ? 'התנתקות מהחשבון' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
