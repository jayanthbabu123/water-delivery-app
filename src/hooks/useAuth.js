import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/authService';
import { router } from 'expo-router';

/**
 * Custom hook for authentication state management
 * Provides authentication status, user data, and auth actions
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize authentication state
   */
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentAuthState = await AuthService.initializeAuth();
      setAuthState(currentAuthState);

      // Auto-refresh user data if authenticated
      if (currentAuthState.isAuthenticated) {
        AuthService.autoRefreshUserData().catch(console.error);
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      setError(err.message);
      setAuthState({
        isAuthenticated: false,
        authState: AuthService.AUTH_STATES.UNAUTHENTICATED,
        userData: null,
        redirectTo: '/login',
        error: err.message,
        initialized: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh authentication state
   */
  const refreshAuth = useCallback(async () => {
    try {
      setError(null);
      const currentAuthState = await AuthService.getAuthState();
      setAuthState(currentAuthState);
      return currentAuthState;
    } catch (err) {
      console.error('Error refreshing auth:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Validate current session
   */
  const validateSession = useCallback(async () => {
    try {
      const validation = await AuthService.validateSession();

      if (!validation.isValid) {
        console.log('Session invalid:', validation.reason);
        await signOut();
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error validating session:', err);
      await signOut();
      return false;
    }
  }, []);

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      setError(null);
      await AuthService.signOut();

      // Update local state
      setAuthState({
        isAuthenticated: false,
        authState: AuthService.AUTH_STATES.UNAUTHENTICATED,
        userData: null,
        redirectTo: '/login',
      });

      // Navigate to login
      router.replace('/login');

      return true;
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err.message);

      // Force navigation to login even if signout failed
      router.replace('/login');
      throw err;
    }
  }, []);

  /**
   * Update user role
   */
  const updateUserRole = useCallback(async (role) => {
    try {
      setError(null);
      await AuthService.updateUserRole(role);

      // Refresh auth state after role update
      const updatedAuthState = await AuthService.getAuthState();
      setAuthState(updatedAuthState);

      return updatedAuthState;
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Update community selection
   */
  const updateCommunitySelection = useCallback(async (communityId) => {
    try {
      setError(null);
      await AuthService.updateCommunitySelection(communityId);

      // Refresh auth state after community update
      const updatedAuthState = await AuthService.getAuthState();
      setAuthState(updatedAuthState);

      return updatedAuthState;
    } catch (err) {
      console.error('Error updating community selection:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Update profile completion
   */
  const updateProfileCompletion = useCallback(async (profileData) => {
    try {
      setError(null);
      await AuthService.updateProfileCompletion(profileData);

      // Refresh auth state after profile update
      const updatedAuthState = await AuthService.getAuthState();
      setAuthState(updatedAuthState);

      return updatedAuthState;
    } catch (err) {
      console.error('Error updating profile completion:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Get current user data
   */
  const getCurrentUser = useCallback(async () => {
    try {
      return await AuthService.getCurrentUser();
    } catch (err) {
      console.error('Error getting current user:', err);
      return null;
    }
  }, []);

  /**
   * Refresh user data from server
   */
  const refreshUserData = useCallback(async () => {
    try {
      setError(null);
      const userData = await AuthService.refreshUserData();

      // Refresh auth state after data refresh
      const updatedAuthState = await AuthService.getAuthState();
      setAuthState(updatedAuthState);

      return userData;
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Complete authentication after OTP verification
   */
  const completeAuthentication = useCallback(async (phoneNumber, firebaseUser) => {
    try {
      setError(null);
      const authResult = await AuthService.completeAuthentication(phoneNumber, firebaseUser);

      // Update local auth state
      const updatedAuthState = await AuthService.getAuthState();
      setAuthState(updatedAuthState);

      return authResult;
    } catch (err) {
      console.error('Error completing authentication:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Periodic session validation (every 10 minutes)
  useEffect(() => {
    if (!authState?.isAuthenticated) return;

    const interval = setInterval(() => {
      validateSession().catch(console.error);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [authState?.isAuthenticated, validateSession]);

  return {
    // State
    authState,
    isLoading,
    error,

    // Derived state
    isAuthenticated: authState?.isAuthenticated || false,
    userData: authState?.userData || null,
    userRole: authState?.userRole || null,
    needsCommunitySelection: authState?.authState === AuthService.AUTH_STATES.NEEDS_COMMUNITY_SELECTION,
    needsRoleSelection: authState?.authState === AuthService.AUTH_STATES.NEEDS_ROLE_SELECTION,
    profileIncomplete: authState?.authState === AuthService.AUTH_STATES.PROFILE_INCOMPLETE,
    redirectTo: authState?.redirectTo || '/login',

    // Actions
    initializeAuth,
    refreshAuth,
    validateSession,
    signOut,
    updateUserRole,
    updateCommunitySelection,
    updateProfileCompletion,
    getCurrentUser,
    refreshUserData,
    completeAuthentication,

    // Utilities
    clearError: () => setError(null),
  };
};

/**
 * Hook for checking if user is authenticated
 * Simpler version for components that only need to know auth status
 */
export const useIsAuthenticated = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
};

/**
 * Hook for getting current user data
 * Returns null if not authenticated
 */
export const useCurrentUser = () => {
  const { userData, isAuthenticated, isLoading } = useAuth();
  return {
    user: isAuthenticated ? userData : null,
    isLoading
  };
};

/**
 * Hook for auth actions only
 * For components that need to perform auth actions but not state
 */
export const useAuthActions = () => {
  const {
    signOut,
    updateUserRole,
    updateCommunitySelection,
    updateProfileCompletion,
    refreshUserData,
    completeAuthentication,
  } = useAuth();

  return {
    signOut,
    updateUserRole,
    updateCommunitySelection,
    updateProfileCompletion,
    refreshUserData,
    completeAuthentication,
  };
};

export default useAuth;
