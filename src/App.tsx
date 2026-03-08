import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Messaging from './pages/Messaging';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import MentorVerify from './pages/MentorVerify';
import AdminDashboard from './pages/AdminDashboard';
import MyOpportunities from './pages/MyOpportunities';
import OpportunityNew from './pages/OpportunityNew';
import OpportunityDetails from './pages/OpportunityDetails';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Contact from './pages/legal/Contact';
import About from './pages/legal/About';

function AppRoutes({ isRtl, toggleLang }: { isRtl: boolean; toggleLang: () => void }) {
  const { user, loading, dbError, handleBypassDbCheck, handleForceSignOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (dbError === 'DATABASE_SETUP_REQUIRED' && !location.pathname.includes('/auth')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'נדרשת הגדרת בסיס נתונים' : 'Database Setup Required'}
            </h1>
            <p className="text-slate-500 font-medium">
              {isRtl 
                ? 'נראה שטבלאות המערכת נמחקו או לא הוגדרו כראוי. עליך להריץ את קובץ ה-schema.sql ב-SQL Editor של Supabase.' 
                : 'It seems the system tables were deleted or not configured correctly. You must run the schema.sql file in your Supabase SQL Editor.'}
            </p>
            <p className="text-sm text-red-600 font-bold bg-red-50 p-3 rounded-xl border border-red-100">
              {isRtl 
                ? 'שים לב: אם איפסת את בסיס הנתונים, עליך להירשם מחדש (Sign Up) כי המשתמש הישן נמחק.' 
                : 'Note: If you reset the database, you must Sign Up again because your old user was deleted.'}
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-start">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{isRtl ? 'הוראות:' : 'Instructions:'}</p>
            <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside font-medium">
              <li>{isRtl ? 'פתח את Supabase Dashboard' : 'Open Supabase Dashboard'}</li>
              <li>{isRtl ? 'עבור ל-SQL Editor' : 'Go to SQL Editor'}</li>
              <li>{isRtl ? 'העתק את התוכן של supabase/schema.sql' : 'Copy contents of supabase/schema.sql'}</li>
              <li>{isRtl ? 'הדבק והרץ (Run)' : 'Paste and Run'}</li>
              <li>{isRtl ? 'לחץ על הכפתור למטה' : 'Click the button below'}</li>
            </ol>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              {isRtl ? 'רענן דף עכשיו' : 'Refresh Page Now'}
            </button>
            <button 
              onClick={() => window.location.href = '/auth?mode=signup'}
              className="w-full py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              {isRtl ? 'דלג להרשמה (Sign Up)' : 'Skip to Sign Up'}
            </button>
            <button 
              onClick={handleBypassDbCheck}
              className="w-full py-2 text-slate-400 text-xs font-bold hover:text-slate-600 transition-all"
            >
              {isRtl ? 'כבר הרצתי את הקוד, אל תראה לי את זה שוב' : "I've already run the code, don't show this again"}
            </button>
            <button 
              onClick={handleForceSignOut}
              className="w-full py-2 text-red-400 text-xs font-bold hover:text-red-600 transition-all border-t border-slate-100 mt-2"
            >
              {isRtl ? 'התנתק ונקה זיכרון דפדפן (Force Sign Out)' : "Force Sign Out & Clear Browser Cache"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white text-black selection:bg-blue-600 selection:text-white font-sans`}>
      <Navbar isRtl={isRtl} toggleLang={toggleLang} />
      
      <main className={user ? 'max-w-6xl mx-auto px-4 py-8' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Landing isRtl={isRtl} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/auth" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Auth isRtl={isRtl} />
              </ProtectedRoute>
            } 
          />
          <Route path="/privacy" element={<Privacy isRtl={isRtl} />} />
          <Route path="/terms" element={<Terms isRtl={isRtl} />} />
          <Route path="/contact" element={<Contact isRtl={isRtl} />} />
          <Route path="/about" element={<About isRtl={isRtl} />} />
          
          {/* Protected App Routes */}
          <Route 
            path="/app/opportunities" 
            element={
              <ProtectedRoute>
                <Home isRtl={isRtl} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/search" 
            element={
              <ProtectedRoute>
                <Explore isRtl={isRtl} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/messages" 
            element={
              <ProtectedRoute>
                <Messaging isRtl={isRtl} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/notifications" 
            element={
              <ProtectedRoute>
                <Notifications isRtl={isRtl} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/profile" 
            element={
              <ProtectedRoute>
                <Profile isRtl={isRtl} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/u/:username" 
            element={
              <ProtectedRoute>
                <Profile isRtl={isRtl} isPublicView={true} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/verify" 
            element={
              <ProtectedRoute>
                <MentorVerify isRtl={isRtl} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard isRtl={isRtl} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/my-opportunities" 
            element={
              <ProtectedRoute>
                <MyOpportunities isRtl={isRtl} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/opportunities/new" 
            element={
              <ProtectedRoute>
                <OpportunityNew isRtl={isRtl} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/opportunities/:id/edit" 
            element={
              <ProtectedRoute>
                <OpportunityNew isRtl={isRtl} isEditing={true} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app/opportunities/:id" 
            element={
              <ProtectedRoute>
                <OpportunityDetails isRtl={isRtl} />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={user ? "/app/opportunities" : "/"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [isRtl, setIsRtl] = useState(() => {
    const saved = localStorage.getItem('app_lang_rtl');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = isRtl ? 'he' : 'en';
    localStorage.setItem('app_lang_rtl', isRtl.toString());
  }, [isRtl]);

  const toggleLang = () => setIsRtl(!isRtl);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes isRtl={isRtl} toggleLang={toggleLang} />
      </Router>
    </AuthProvider>
  );
}
