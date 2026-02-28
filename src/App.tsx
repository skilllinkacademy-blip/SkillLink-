import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Network from './pages/Network';
import Jobs from './pages/Jobs';
import Messaging from './pages/Messaging';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Landing from './pages/Landing';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { authService, messageService } from './services/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (localStorage.getItem('token')) {
        try {
          const response = await authService.me();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
          messageService.join(response.data.id);
        } catch (error) {
          handleLogout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (userData: any, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    messageService.join(userData.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <BrowserRouter>
            {!isAuthenticated ? (
              <Routes>
                <Route path="/" element={<Landing onLoginSuccess={handleLogin} />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            ) : (
              <Routes>
                <Route path="/" element={<Layout onLogout={handleLogout} user={user} />}>
                  <Route index element={<Home user={user} />} />
                  <Route path="network" element={<Network />} />
                  <Route path="jobs" element={<Jobs />} />
                  <Route path="messaging" element={<Messaging user={user} />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="profile/:id" element={<Profile user={user} />} />
                  <Route path="dashboard" element={<Dashboard user={user} />} />
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="terms" element={<Terms />} />
                  <Route path="privacy" element={<Privacy />} />
                  <Route path="settings" element={<Settings user={user} onUpdate={setUser} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            )}
          </BrowserRouter>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
