import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Profiles } from '@/api/db';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);          // combined auth + profile data
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Merge Supabase auth user with our profiles table
  const loadFullUser = async (authUser) => {
    if (!authUser) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    try {
      const profile = await Profiles.me(authUser.id);
      setUser({
        id: authUser.id,
        email: authUser.email,
        full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
        account_type: profile?.account_type || null,
        onboarding_complete: profile?.onboarding_complete || false,
        profile_id: profile?.profile_id || null,
      });
      setIsAuthenticated(true);
    } catch {
      // Profile row may not exist yet (first login), use auth data only
      setUser({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || '',
        account_type: null,
        onboarding_complete: false,
        profile_id: null,
      });
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadFullUser(session?.user ?? null).finally(() => {
        setIsLoadingAuth(false);
        setAuthChecked(true);
      });
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadFullUser(session?.user ?? null).finally(() => {
        setIsLoadingAuth(false);
        setAuthChecked(true);
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    await loadFullUser(authUser);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  // Keep navigateToLogin for compatibility with ProtectedRoute
  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,  // no longer needed, kept for compatibility
      authError: null,
      authChecked,
      logout,
      navigateToLogin,
      refreshUser,
      checkUserAuth: refreshUser,      // alias for ProtectedRoute compatibility
      checkAppState: refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
