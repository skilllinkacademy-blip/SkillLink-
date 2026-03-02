import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Messaging from './pages/Messaging';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Landing from './pages/Landing';

export default function App() {
  const [isRtl, setIsRtl] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = isRtl ? 'he' : 'en';
  }, [isRtl]);

  const toggleLang = () => setIsRtl(!isRtl);

  return (
    <Router>
      <div className={`min-h-screen bg-white text-black selection:bg-black selection:text-white ${isRtl ? 'font-serif' : 'font-sans'}`}>
        {isAuthenticated && <Navbar isRtl={isRtl} toggleLang={toggleLang} />}
        
        <main className={isAuthenticated ? 'max-w-6xl mx-auto px-4 py-8' : ''}>
          <Routes>
            <Route 
              path="/landing" 
              element={
                <Landing 
                  onLogin={() => setIsAuthenticated(true)} 
                  isRtl={isRtl} 
                  toggleLang={toggleLang} 
                />
              } 
            />
            
            {isAuthenticated ? (
              <>
                <Route path="/" element={<Home isRtl={isRtl} />} />
                <Route path="/search" element={<Explore isRtl={isRtl} />} />
                <Route path="/messages" element={<Messaging isRtl={isRtl} />} />
                <Route path="/notifications" element={<Notifications isRtl={isRtl} />} />
                <Route path="/profile" element={<Profile isRtl={isRtl} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/landing" replace />} />
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}
