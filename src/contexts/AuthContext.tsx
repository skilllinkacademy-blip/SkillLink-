import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import api from '../lib/api';

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
  sqliteId: number | null;
  loading: boolean;
  isSyncing: boolean;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  setUnreadMessagesCount: React.Dispatch<React.SetStateAction<number>>;
  setUnreadNotificationsCount: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sqliteId, setSqliteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const fetchSqliteId = async () => {
    try {
      const response = await api.get('/auth/me');
      setSqliteId(response.data.id);
    } catch (err) {
      console.error('Error fetching sqliteId:', err);
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
    }
  };

  const ensureProfile = async (user: User) => {
    if (!isSupabaseConfigured) return;
    
    try {
      console.log('AuthContext: Ensuring profile for user:', user.id);
      // Check if profile exists
      const { data: existing, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('AuthContext: Error checking for existing profile:', fetchError);
        return;
      }

      if (!existing) {
        console.log('AuthContext: Profile not found, creating...');
        // Profile doesn't exist, create it
        const metadata = user.user_metadata || {};
        const generatedUsername = `user_${Math.random().toString(36).substring(2, 10)}`;
        
        const insertPayload: any = {
          id: user.id,
          username: generatedUsername,
          full_name: metadata.full_name || 'User',
          role: metadata.role || (metadata.isAdmin ? 'admin' : 'mentee'),
          location: metadata.location || 'פתח תקווה',
          occupation: metadata.occupation,
          years_experience: metadata.years_experience,
          updated_at: new Date().toISOString(),
        };

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(insertPayload)
          .select()
          .single();

        if (insertError) {
          console.error('AuthContext: Error inserting profile:', insertError);
        } else {
          console.log('AuthContext: Profile created successfully');
          setProfile(newProfile);
        }
      } else {
        console.log('AuthContext: Profile exists, fetching full data...');
        await fetchProfile(user.id);
      }
    } catch (err: any) {
      console.error('AuthContext: Unexpected error in ensureProfile:', err.message);
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
        
        if (currentUser && session?.access_token) {
          // Sync with local backend
          try {
            const response = await api.post('/auth/session', { access_token: session.access_token });
            if (response.data.token) {
              localStorage.setItem('skilllink_token', response.data.token);
              await fetchSqliteId();
            } else if (response.data.error === 'SUPABASE_NOT_CONFIGURED') {
              console.warn('Backend session sync skipped: Supabase not configured on server');
            }
            
            // Fire and forget, or handle in background
            ensureProfile(currentUser);
            fetchUnreadCount(currentUser.id);
          } catch (err) {
            console.error('Error syncing session with backend during init:', err);
            // If sync fails, we still want to try to load the profile from Supabase directly
            ensureProfile(currentUser);
          }
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
      } finally {
        // We set loading to false as soon as we have attempted the sync
        setLoading(false);
      }
    };

    initAuth();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      const newUser = session?.user ?? null;
      setUser(newUser);
      
      if (newUser && session?.access_token) {
        // Only sync if the token is different from what we have
        const currentToken = localStorage.getItem('skilllink_token');
        if (currentToken && event === 'INITIAL_SESSION') {
          // Skip redundant sync on initial session if we already have a token
          // (Actually, better to sync once to be sure, but let's avoid parallel calls)
          await fetchSqliteId();
          return;
        }

        // Sync with local backend
        setIsSyncing(true);
        try {
          const response = await api.post('/auth/session', { access_token: session.access_token });
          if (response.data.token) {
            localStorage.setItem('skilllink_token', response.data.token);
            await fetchSqliteId();
          } else if (response.data.error === 'SUPABASE_NOT_CONFIGURED') {
            console.warn('Backend session sync skipped: Supabase not configured on server');
          }
        } catch (err) {
          console.error('Error syncing session with backend during state change:', err);
        } finally {
          setIsSyncing(false);
          // Always ensure profile even if backend sync fails
          ensureProfile(newUser);
          fetchUnreadCount(newUser.id);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('skilllink_token');
        setProfile(null);
        setSqliteId(null);
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      sqliteId,
      loading, 
      isSyncing,
      unreadMessagesCount,
      unreadNotificationsCount,
      signOut, 
      refreshProfile,
      refreshUnreadCount,
      setUnreadMessagesCount,
      setUnreadNotificationsCount
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
