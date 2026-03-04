import React, { useState, ChangeEvent, useEffect } from 'react';
import {
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  Hammer,
  ArrowRight,
  Camera,
  Pencil,
} from 'lucide-react';
import { supabase } from '../App';

interface ProfileProps {
  isRtl: boolean;
}

interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
}

export default function Profile({ isRtl }: ProfileProps) {
  const [viewRole, setViewRole] = useState<'mentor' | 'apprentice'>('mentor');
  const [verifying, setVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, cover_url')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile(data as ProfileData);
      }
    };

    loadProfile();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      alert('You must be logged in to change cover image.');
      return;
    }

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/cover.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('profile_covers') // תוודא שיש bucket בשם הזה
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      alert(`Cover upload error: ${uploadError.message}`);
      return;
    }

    const { data } = supabase.storage
      .from('profile_covers')
      .getPublicUrl(filePath);

    const coverUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ cover_url: coverUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error(updateError);
      alert(`Cover update error: ${updateError.message}`);
      return;
    }

    setProfile((prev) => (prev ? { ...prev, cover_url: coverUrl } : prev));
  };

  const handleVerifyClick = async () => {
    try {
      if (!selectedFile) {
        alert('Please upload an ID image/document first.');
        return;
      }

      setVerifying(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        alert('You must be logged in to request verification.');
        setVerifying(false);
        return;
      }

      const path = `${user.id}/${Date.now()}-${selectedFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from('mentor_verifications')
        .upload(path, selectedFile);

      if (uploadError) {
        console.error('Error uploading verification document:', uploadError);
        alert(`Upload error: ${uploadError.message}`);
        setVerifying(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('mentor_verifications')
        .getPublicUrl(path);

      const documentUrl = urlData.publicUrl;

      const { error: insertError } = await supabase
        .from('mentor_verifications')
        .insert({
          user_id: user.id,
          document_url: documentUrl,
          status: 'pending',
        });

      if (insertError) {
        console.error('Error inserting mentor_verification:', insertError);
        alert(`Verification error: ${insertError.message}`);
        setVerifying(false);
        return;
      }

      alert('Verification request sent successfully.');
      setVerifying(false);
    } catch (e) {
      console.error('Unexpected error in handleVerifyClick:', e);
      alert('Unexpected error during verification.');
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* View Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setViewRole('mentor')}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
              viewRole === 'mentor'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Mentor View
          </button>
          <button
            onClick={() => setViewRole('apprentice')}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
              viewRole === 'apprentice'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Apprentice View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div
              className="h-48 relative bg-gray-50 bg-cover bg-center"
              style={
                profile?.cover_url
                  ? { backgroundImage: `url(${profile.cover_url})` }
                  : undefined
              }
            >
              <label className="absolute bottom-4 right-4 p-3 bg-black/50 text-white rounded-full hover:bg-black transition-all backdrop-blur-sm cursor-pointer">
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </label>
            </div>
            <div className="px-8 pb-8 -mt-16 relative">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-black border-8 border-white flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                    ME
                  </div>
                  <button className="absolute bottom-2 right-2 p-2 bg-white text-black rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100">
                    <Camera size={16} />
                  </button>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-black text-black">
                      {profile?.full_name || 'My Name'}
                    </h1>
                    {/* כאן בעתיד תראה is_verified אמיתי מה־DB */}
                    {viewRole === 'mentor' && (
                      <ShieldCheck className="text-emerald-500" size={24} />
                    )}
                  </div>
                  <p className="text-lg font-bold text-gray-500 flex items-center gap-2">
                    {viewRole === 'mentor'
                      ? 'Master Electrician'
                      : 'Aspiring Electrician'}
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    {viewRole === 'mentor' ? '12 Years Exp' : 'Age 22'}
                  </p>
                </div>
                <button className="px-6 py-3 bg-gray-50 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all flex items-center gap-2 border border-gray-100">
                  <Pencil size={16} />
                  Edit Profile
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {viewRole === 'mentor' ? (
                  <>
                    <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <div className="flex justify-center mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={14}
                            className="text-black fill-current"
                          />
                        ))}
                      </div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Self-Rating
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <div className="text-lg font-black text-black">12</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Years Exp
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <div className="text-lg font-black text-black">
                        Tel Aviv
                      </div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Area Served
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <div className="text-lg font-black text-black">
                        40h/w
                      </div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Availability
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <div className="text-lg font-black text-black">22</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Age
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <div className="text-lg font-black text-black">
                        Beginner
                      </div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Skill Level
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <div className="text-lg font-black text-black">
                        Jerusalem
                      </div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Location
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl text-center">
                      <div className="text-lg font-black text-black">
                        20h/w
                      </div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Availability
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
            <h2 className="text-2xl font-black text-black">Bio</h2>
            <p className="text-gray-500 font-medium leading-relaxed text-lg">
              No bio added yet. Tell the SkillLink community about your journey
              in the trades.
            </p>

            <div className="pt-8 border-t border-gray-50">
              <h3 className="text-xl font-black text-black mb-4">
                {viewRole === 'mentor'
                  ? 'Why Choose Me?'
                  : 'Why I want to learn'}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                No goals or reasons added yet.
              </p>
            </div>
          </div>

          {/* Gallery */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-black">
                Gallery of Work
              </h2>
              <button className="text-sm font-bold text-gray-400 hover:text-black transition-colors">
                View All
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="min-w-[240px] h-40 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-200"
                >
                  <Camera size={32} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action Card – Upload + Verify */}
          <div className="bg-black text-white rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-black leading-tight">
                {viewRole === 'mentor'
                  ? 'Verify your mentor profile'
                  : 'Ready to start learning?'}
              </h3>
              <p className="text-gray-400 font-medium">
                {viewRole === 'mentor'
                  ? 'Upload an ID or certification so we can verify you as a trusted mentor.'
                  : 'Find a master mentor and jumpstart your career in the trades.'}
              </p>

              {viewRole === 'mentor' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Upload ID / Certification
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="w-full text-xs text-gray-200 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-white file:text-black hover:file:bg-gray-100 cursor-pointer"
                  />
                </div>
              )}

              <button
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                onClick={
                  viewRole === 'mentor' ? handleVerifyClick : undefined
                }
                disabled={viewRole === 'mentor' && verifying}
              >
                {viewRole === 'mentor'
                  ? verifying
                    ? 'Sending Verification...'
                    : 'Submit Verification'
                  : 'Find a Mentor'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
              Profile Details
            </h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Location
                  </p>
                  <p className="text-sm font-bold text-black">Not specified</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Availability
                  </p>
                  <p className="text-sm font-bold text-black">Not specified</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <Hammer size={20} className="text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Trade
                  </p>
                  <p className="text-sm font-bold text-black">Not specified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
