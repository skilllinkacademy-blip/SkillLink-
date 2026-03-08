import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  role: 'mentor' | 'mentee' | 'admin';
  location?: string;
  occupation?: string;
  years_experience?: number;
  workload?: string;
  avatar_url?: string;
  verification_status?: 'pending' | 'approved' | 'rejected' | 'none';
  portfolio_urls?: string[];
  is_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  dbError: string | null;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  setUnreadMessagesCount: React.Dispatch<React.SetStateAction<number>>;
  setUnreadNotificationsCount: React.Dispatch<React.SetStateAction<number>>;
  handleBypassDbCheck: () => void;
  handleForceSignOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [bypassDbCheck, setBypassDbCheck] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('bypass_db_check') === 'true';
  });
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const checkDatabaseSetup = async () => {
    if (!isSupabaseConfigured || bypassDbCheck) {
      setDbError(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('schema_migrations')
        .select('id')
        .eq('id', 'initial_setup')
        .maybeSingle();
      
      if (error) {
        console.error('AuthContext: Database check error:', error);
        setDbError('DATABASE_SETUP_REQUIRED');
      } else if (!data) {
        console.warn('AuthContext: initial_setup record missing in schema_migrations');
        setDbError('DATABASE_SETUP_REQUIRED');
      } else {
        setDbError(null);
      }
    } catch (err) {
      console.error('AuthContext: Unexpected error during DB check:', err);
      setDbError('DATABASE_SETUP_REQUIRED');
    }
  };

  const fetchUnreadCount = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      // Fetch unread messages
      const { count: msgCount, error: msgError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);
      
      if (!msgError && msgCount !== null) {
        setUnreadMessagesCount(msgCount);
      }

      // Fetch unread notifications
      const { count: notifCount, error: notifError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (!notifError && notifCount !== null) {
        setUnreadNotificationsCount(notifCount);
      }
    } catch (err) {
      console.error('Error fetching unread counts:', err);
    }
  };

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          mentor_verifications(status)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setProfile(null);
        } else if (error.message.includes('profiles') && error.message.includes('cache')) {
          setDbError('DATABASE_SETUP_REQUIRED');
        } else {
          console.error('Error fetching profile:', error);
        }
      } else {
        const profileData = {
          ...data,
          is_verified: data.is_verified || false,
          verification_status: data.mentor_verifications?.[0]?.status || 'none'
        };
        setProfile(profileData);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching profile:', err);
      if (err.message?.includes('profiles')) {
        setDbError('DATABASE_SETUP_REQUIRED');
      }
    }
  };

  const ensureProfile = async (user: User) => {
    if (!isSupabaseConfigured) return;
    
    try {
      console.log('AuthContext: Ensuring profile for user:', user.id);
      // Check if profile exists
      const { data: existing, error: fetchError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('AuthContext: Error fetching profile:', fetchError);
        if (fetchError.message.includes('profiles')) {
          setDbError('DATABASE_SETUP_REQUIRED');
        }
        return;
      }

      if (!existing) {
        console.log('AuthContext: Profile not found, creating...');
        // Profile doesn't exist, create it
        const metadata = user.user_metadata || {};
        const generatedUsername = `user_${Math.random().toString(36).substring(2, 10)}`;
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: generatedUsername,
            full_name: metadata.full_name || 'User',
            role: metadata.role || (metadata.isAdmin ? 'admin' : 'mentee'),
            location: metadata.location || 'פתח תקווה',
            phone: metadata.phone || '',
            occupation: metadata.occupation,
            years_experience: metadata.years_experience,
            workload: metadata.workload,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error('AuthContext: Error inserting profile:', insertError);
          if (insertError.message.includes('profiles')) {
            setDbError('DATABASE_SETUP_REQUIRED');
          }
          throw insertError;
        }
        console.log('AuthContext: Profile created successfully');
        setProfile(newProfile);
      } else {
        console.log('AuthContext: Profile exists, fetching full data...');
        await fetchProfile(user.id);
      }
    } catch (err: any) {
      console.error('AuthContext: Error in ensureProfile:', err.message);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Initial session check
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        checkDatabaseSetup();
        
        if (currentUser) {
          // Fire and forget, or handle in background
          ensureProfile(currentUser);
          fetchUnreadCount(currentUser.id);
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
      } finally {
        // We set loading to false as soon as we have the session
        setLoading(false);
      }
    };

    initAuth();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      const newUser = session?.user ?? null;
      setUser(newUser);
      
      if (newUser) {
        // We don't set loading to true here to avoid flickering, 
        // but we ensure profile data is refreshed
        ensureProfile(newUser);
        fetchUnreadCount(newUser.id);
      } else {
        setProfile(null);
        setUnreadMessagesCount(0);
        setUnreadNotificationsCount(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Separate effect for real-time subscriptions that depend on user.id
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;

    // Profile updates listener
    const profileSubscription = supabase
      .channel(`profile-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => {
          fetchProfile(user.id);
        }
      )
      .subscribe();

    const messageSubscription = supabase
      .channel(`unread-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMsg = payload.new as any;
          const oldMsg = payload.old as any;
          if (newMsg?.recipient_id === user.id || oldMsg?.recipient_id === user.id) {
            fetchUnreadCount(user.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotif = payload.new as any;
          const oldNotif = payload.old as any;
          if (newNotif?.user_id === user.id || oldNotif?.user_id === user.id) {
            fetchUnreadCount(user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
      supabase.removeChannel(messageSubscription);
    };
  }, [user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const refreshUnreadCount = async () => {
    if (user) await fetchUnreadCount(user.id);
  };

  const handleBypassDbCheck = () => {
    localStorage.setItem('bypass_db_check', 'true');
    setBypassDbCheck(true);
    setDbError(null);
  };

  const handleForceSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = '/auth?mode=signup';
    } catch (err) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      dbError: bypassDbCheck ? null : dbError, 
      unreadMessagesCount,
      unreadNotificationsCount,
      signOut, 
      refreshProfile,
      refreshUnreadCount,
      setUnreadMessagesCount,
      setUnreadNotificationsCount,
      handleBypassDbCheck,
      handleForceSignOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
