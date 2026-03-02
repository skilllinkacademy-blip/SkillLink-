import React, { useState } from 'react';
import { User, Briefcase, MapPin, Mail, Lock, Camera, ChevronRight, Globe } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
  isRtl: boolean;
  toggleLang: () => void;
}

export default function Landing({ onLogin, isRtl, toggleLang }: LandingProps) {
  const [role, setRole] = useState<'mentor' | 'apprentice'>('apprentice');
  const [isRegister, setIsRegister] = useState(true);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-black">SkillLink</h1>
          <p className="text-gray-500 font-medium">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Role Toggle */}
        {isRegister && (
          <div className="flex p-1 bg-gray-100 rounded-2xl">
            <button
              onClick={() => setRole('apprentice')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                role === 'apprentice' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              <User size={18} />
              Apprentice
            </button>
            <button
              onClick={() => setRole('mentor')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                role === 'mentor' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              <Briefcase size={18} />
              Mentor
            </button>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          {isRegister && (
            <>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium"
                />
              </div>

              {role === 'apprentice' ? (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                  <input
                    type="number"
                    placeholder="Age"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium"
                  />
                </div>
              ) : (
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                  <input
                    type="number"
                    placeholder="Years of Experience"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium"
                  />
                </div>
              )}

              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Trade / Specialty"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium"
                />
              </div>

              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Location (City + Radius)"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium"
                />
              </div>

              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Availability (hours/week)"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium"
                />
              </div>

              <textarea
                placeholder="Bio"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium min-h-[100px]"
              />

              <textarea
                placeholder="Goals / Why choose me"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium min-h-[100px]"
              />

              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-4 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 font-bold">Profile Picture Upload</p>
                  </div>
                  <input type="file" className="hidden" />
                </label>
              </div>
            </>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white font-black py-4 rounded-2xl hover:bg-gray-800 transition-all active:scale-[0.98] shadow-xl uppercase tracking-widest text-sm"
          >
            {isRegister ? 'Create Account' : 'Log In'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center space-y-4">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            {isRegister ? 'Already have an account? Log in' : 'New to SkillLink? Join now'}
          </button>
          
          <div className="flex justify-center">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-xs font-bold hover:bg-gray-50 transition-all uppercase tracking-widest"
            >
              <Globe size={14} />
              {isRtl ? 'Switch to English' : 'עבור לעברית'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
