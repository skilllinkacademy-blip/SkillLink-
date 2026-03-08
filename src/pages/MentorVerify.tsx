import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, CheckCircle, Clock, AlertCircle, ArrowLeft, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MentorVerifyProps {
  isRtl: boolean;
}

export default function MentorVerify({ isRtl }: MentorVerifyProps) {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Upload Document to 'mentor_id_docs' bucket
      // Path pattern: ${user.id}/${filename}
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('mentor_id_docs')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get document URL
      const { data: { publicUrl } } = supabase.storage
        .from('mentor_id_docs')
        .getPublicUrl(filePath);

      // 2. Insert or Update mentor_verifications
      // Check if exists first to avoid RLS issues with upsert
      const { data: existing } = await supabase
        .from('mentor_verifications')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from('mentor_verifications')
          .update({
            document_url: filePath,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('mentor_verifications')
          .insert({
            user_id: user.id,
            document_url: filePath,
            status: 'pending'
          });
        
        if (insertError) throw insertError;
      }

      await refreshProfile();
      setSuccess(true);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || (isRtl ? 'אירעה שגיאה בתהליך האימות' : 'An error occurred during verification'));
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== 'mentor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-2xl font-black">{isRtl ? 'גישה מוגבלת' : 'Access Restricted'}</h2>
        <p className="text-gray-500">{isRtl ? 'דף זה מיועד למנטורים בלבד.' : 'This page is for mentors only.'}</p>
        <button onClick={() => navigate('/app/opportunities')} className="text-blue-600 font-bold hover:underline">
          {isRtl ? 'חזרה להזדמנויות' : 'Back to Opportunities'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={18} className="rtl:rotate-180" />
        {isRtl ? 'חזרה' : 'Back'}
      </button>

      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-200">
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          {isRtl ? 'אימות זהות מנטור' : 'Mentor Identity Verification'}
        </h1>
        <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
          {isRtl 
            ? 'כדי להבטיח את בטיחות הקהילה שלנו, מנטורים נדרשים לאמת את זהותם לפני פרסום הזדמנויות.' 
            : 'To ensure our community safety, mentors are required to verify their identity before posting opportunities.'}
        </p>
      </div>

      {success ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-12 text-center space-y-6 shadow-xl animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">{isRtl ? 'המסמכים התקבלו!' : 'Documents Received!'}</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              {isRtl 
                ? 'הצוות שלנו יבדוק את המסמכים שלך תוך 24-48 שעות. תקבל עדכון ברגע שהחשבון שלך יאושר.' 
                : 'Our team will review your documents within 24-48 hours. You will be notified once your account is approved.'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/app/opportunities')}
            className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-gray-800 transition-all active:scale-95"
          >
            {isRtl ? 'חזרה לפיד' : 'Back to Feed'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-xl space-y-8">
          {profile.verification_status === 'pending' && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex gap-4 items-start">
              <Clock className="text-orange-600 shrink-0" size={24} />
              <div className="space-y-1">
                <p className="font-black text-orange-900 text-sm uppercase tracking-widest">{isRtl ? 'בבדיקה' : 'Under Review'}</p>
                <p className="text-orange-700 text-sm font-medium">
                  {isRtl ? 'כבר העלית מסמכים. הצוות שלנו בודק אותם כעת.' : 'You have already uploaded documents. Our team is reviewing them.'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900">{isRtl ? 'העלאת תעודה מזהה' : 'Upload ID Document'}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {isRtl 
                  ? 'אנא העלה צילום ברור של תעודת זהות, רישיון נהיגה או דרכון. המידע יישמר בצורה מאובטחת וישמש לאימות בלבד.' 
                  : 'Please upload a clear photo of your ID, Driver License, or Passport. Information will be stored securely and used for verification only.'}
              </p>
            </div>

            <label className="relative group cursor-pointer block">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,.pdf"
                onChange={handleFileChange}
                required
              />
              <div className={`w-full py-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all ${
                file ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 bg-gray-50 group-hover:border-gray-300 group-hover:bg-gray-100'
              }`}>
                {file ? (
                  <>
                    <FileText size={48} className="text-blue-600" />
                    <div className="text-center">
                      <p className="font-black text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-gray-900">{isRtl ? 'לחץ להעלאה או גרור קובץ' : 'Click to upload or drag and drop'}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">JPG, PNG, PDF (Max 5MB)</p>
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || !file}
            className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
            ) : (
              <>
                <ShieldCheck size={20} />
                {isRtl ? 'שלח לאימות' : 'Submit for Verification'}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
