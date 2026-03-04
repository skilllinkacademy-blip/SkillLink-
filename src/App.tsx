import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import SimplePage from './pages/SimplePage';

function AppRoutes({ isRtl, toggleLang }: { isRtl: boolean; toggleLang: () => void }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white text-black selection:bg-blue-600 selection:text-white ${isRtl ? 'font-serif' : 'font-sans'}`}>
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
          <Route 
            path="/privacy" 
            element={
              <SimplePage 
                isRtl={isRtl} 
                title={isRtl ? 'מדיניות פרטיות' : 'Privacy Policy'} 
                content={isRtl ? 'כאן תופיע מדיניות הפרטיות של הפלטפורמה.' : 'Privacy policy content will appear here.'} 
              />
            } 
          />
          <Route 
            path="/terms" 
            element={
              <SimplePage 
                isRtl={isRtl} 
                title={isRtl ? 'תנאי שימוש' : 'Terms of Service'} 
                content={isRtl ? 'כאן יופיעו תנאי השימוש של הפלטפורמה.' : 'Terms of service content will appear here.'} 
              />
            } 
          />
          <Route 
            path="/contact" 
            element={
              <SimplePage 
                isRtl={isRtl} 
                title={isRtl ? 'צור קשר' : 'Contact Us'} 
                content={isRtl ? 'ניתן ליצור קשר בכתובת support@skilllink.com' : 'You can contact us at support@skilllink.com'} 
              />
            } 
          />
          
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
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = isRtl ? 'he' : 'en';
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
