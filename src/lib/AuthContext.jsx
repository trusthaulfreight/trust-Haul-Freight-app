import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { Profiles } from '@/api/db';

const AuthContext = createContext();

function getPrimaryEmail(clerkUser) {
  return clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || '';
}

function getFullName(clerkUser) {
  return clerkUser?.fullName || [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ');
}

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const loadFullUser = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn || !clerkUser) {
      setUser(null);
      setAuthChecked(true);
      return;
    }

    const baseUser = {
      id: clerkUser.id,
      email: getPrimaryEmail(clerkUser),
      full_name: getFullName(clerkUser),
      account_type: null,
      onboarding_complete: false,
      profile_id: null,
    };

    try {
      const profile = await Profiles.me(clerkUser.id);
      setUser({
        ...baseUser,
        full_name: profile?.full_name || baseUser.full_name,
        account_type: profile?.account_type || null,
        onboarding_complete: profile?.onboarding_complete || false,
        profile_id: profile?.profile_id || null,
      });
    } catch {
      setUser(baseUser);
    } finally {
      setAuthChecked(true);
    }
  }, [clerkUser, isLoaded, isSignedIn]);

  useEffect(() => {
    loadFullUser();
  }, [loadFullUser]);

  const logout = async () => {
    await signOut({ redirectUrl: '/' });
    setUser(null);
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(isSignedIn),
      isLoadingAuth: !isLoaded,
      isLoadingPublicSettings: false,
      authError: null,
      authChecked,
      logout,
      navigateToLogin,
      refreshUser: loadFullUser,
      checkUserAuth: loadFullUser,
      checkAppState: loadFullUser,
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
