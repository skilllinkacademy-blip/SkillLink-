import React, { useState, useEffect } from 'react';
// App Version: 1.0.2 (Force Update)
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
  const { user, loading, isSyncing, dbError, handleBypassDbCheck, handleForceSignOut } = useAuth();
  const location = useLocation();

  if (loading || isSyncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white text-black selection:bg-blue-600 selection:text-white font-sans`}>
      <Navbar isRtl={isRtl} toggleLang={toggleLang} />
      
      {dbError === 'DATABASE_SETUP_REQUIRED' && (
        <div className="bg-red-50 border-b border-red-200 p-4 sticky top-16 z-40">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-red-800">
              <div className="bg-red-100 p-2 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">{isRtl ? 'נדרשת הגדרת מסד נתונים' : 'Database Setup Required'}</p>
                <p className="text-sm opacity-90">
                  {isRtl 
                    ? 'נראה שטבלאות ה-Supabase עדיין לא הוגדרו. עליך להריץ את ה-SQL ב-Supabase Dashboard.' 
                    : 'It looks like Supabase tables are not set up yet. You need to run the SQL in your Supabase Dashboard.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleBypassDbCheck}
                className="px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 rounded-lg transition-colors"
              >
                {isRtl ? 'התעלם (לא מומלץ)' : 'Ignore (Not recommended)'}
              </button>
              <button 
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                {isRtl ? 'פתח Supabase' : 'Open Supabase'}
              </button>
            </div>
          </div>
        </div>
      )}

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
    const saved = localStorage.getItem('skilllink_v5_rtl');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    // Migration: If user has old v4 key, or no key at all, default to Hebrew (true)
    const oldSaved = localStorage.getItem('skilllink_v4_rtl');
    const currentSaved = localStorage.getItem('skilllink_v5_rtl');
    
    if (oldSaved !== null && currentSaved === null) {
      setIsRtl(true);
      localStorage.removeItem('skilllink_v4_rtl');
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = isRtl ? 'he' : 'en';
    localStorage.setItem('skilllink_v5_rtl', isRtl.toString());
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
