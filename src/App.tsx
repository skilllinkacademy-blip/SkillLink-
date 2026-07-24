import React, { useState, useEffect, lazy, Suspense } from 'react';
// App Version: 1.0.2 (Force Update)
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
// Entry screens stay eager so first paint has no loading flash.
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
// Everything behind auth (and legal pages) is code-split per route.
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Inbox = lazy(() => import('./pages/Inbox'));
const Profile = lazy(() => import('./pages/Profile'));
const ReviewsPage = lazy(() => import('./pages/Reviews'));
const MentorVerify = lazy(() => import('./pages/MentorVerify'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MyOpportunities = lazy(() => import('./pages/MyOpportunities'));
const OpportunityNew = lazy(() => import('./pages/OpportunityNew'));
const OpportunityDetails = lazy(() => import('./pages/OpportunityDetails'));
const Saved = lazy(() => import('./pages/Saved'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const Contact = lazy(() => import('./pages/legal/Contact'));
const About = lazy(() => import('./pages/legal/About'));

import ErrorBoundary from './components/ErrorBoundary';

function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function AppRoutes({ isRtl, toggleLang }: { isRtl: boolean; toggleLang: () => void }) {
  const { user, loading, isSyncing } = useAuth();
  const location = useLocation();

  // Reset scroll to the top of the page on every route change, so pages like
  // About/Contact/Privacy/Terms always open at the top (not wherever the
  // previous page — e.g. the landing footer — was scrolled to).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-white text-black selection:bg-blue-600 selection:text-white font-sans`}>
        <Navbar isRtl={isRtl} toggleLang={toggleLang} />
        
        <main className={user ? 'max-w-6xl mx-auto px-4 py-6 pb-20 md:pb-8' : ''}>
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* ... rest of routes stay same ... */}
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
          {/* Email-confirmation / magic-link redirect target. Not wrapped in
              ProtectedRoute so it can establish the session from the URL and
              handle its own navigation regardless of current auth state. */}
          <Route path="/auth/callback" element={<AuthCallback isRtl={isRtl} />} />
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
            path="/app/opportunities/:id"
            element={
              <ProtectedRoute>
                <OpportunityDetails isRtl={isRtl} />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/app/explore"
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
                <Inbox isRtl={isRtl} />
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
            path="/app/u/:username/reviews" 
            element={
              <ProtectedRoute>
                <ReviewsPage isRtl={isRtl} />
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
            path="/app/saved" 
            element={
              <ProtectedRoute>
                <Saved isRtl={isRtl} />
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

          <Route path="*" element={<Navigate to={user ? "/app/opportunities" : "/"} replace />} />
        </Routes>
          </Suspense>
      </main>
    </div>
    </ErrorBoundary>
  );
}

export default function App() {
  const [isRtl, setIsRtl] = useState(() => {
    try {
      const saved = localStorage.getItem('skilllink_v5_rtl');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true; // Default to Hebrew if localStorage fails
    }
  });

  useEffect(() => {
    try {
      // Migration: If user has old v4 key, or no key at all, default to Hebrew (true)
      const oldSaved = localStorage.getItem('skilllink_v4_rtl');
      const currentSaved = localStorage.getItem('skilllink_v5_rtl');
      
      if (oldSaved !== null && currentSaved === null) {
        setIsRtl(true);
        localStorage.removeItem('skilllink_v4_rtl');
      }
    } catch (e) {
      console.warn('LocalStorage migration failed:', e);
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = isRtl ? 'he' : 'en';
      localStorage.setItem('skilllink_v5_rtl', isRtl.toString());
    } catch (e) {
      console.warn('Failed to save RTL state:', e);
    }
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
