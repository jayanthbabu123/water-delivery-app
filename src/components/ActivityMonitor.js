import { useEffect, useRef } from "react";
import { AppState, PanResponder, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthService } from "../services/authService";
import { router } from "expo-router";

/**
 * Activity Monitor Component
 * Monitors user activity and automatically logs out inactive users
 * Also handles app state changes and session validation
 */
export const ActivityMonitor = ({
  children,
  inactivityTimeout = 30 * 60 * 1000,
}) => {
  const lastActivityRef = useRef(Date.now());
  const timeoutRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const isAuthenticatedRef = useRef(false);

  // Update last activity time
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    resetInactivityTimer();
  };

  // Reset the inactivity timer
  const resetInactivityTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isAuthenticatedRef.current) {
      timeoutRef.current = setTimeout(() => {
        handleInactivityLogout();
      }, inactivityTimeout);
    }
  };

  // Handle automatic logout due to inactivity
  const handleInactivityLogout = async () => {
    try {
      console.log("Auto-logout due to inactivity");

      // Store reason for logout
      await AsyncStorage.setItem("logoutReason", "inactivity");

      // Sign out user
      await AuthService.signOut();

      // Navigate to login with message
      router.replace("/login?reason=inactivity");
    } catch (error) {
      console.error("Error during auto-logout:", error);
      // Force navigation even if logout fails
      router.replace("/login");
    }
  };

  // Handle app state changes (background/foreground)
  const handleAppStateChange = async (nextAppState) => {
    const previousAppState = appStateRef.current;
    appStateRef.current = nextAppState;

    if (previousAppState === "background" && nextAppState === "active") {
      // App came to foreground
      await handleAppResume();
    } else if (nextAppState === "background") {
      // App went to background
      await handleAppBackground();
    }
  };

  // Handle app resume from background
  const handleAppResume = async () => {
    try {
      // Check if user is still authenticated
      const isAuth = await AuthService.isAuthenticated();

      if (isAuth) {
        // Validate session
        const validation = await AuthService.validateSession();

        if (!validation.isValid) {
          console.log("Session expired while app was in background");
          await AuthService.signOut();
          router.replace("/login?reason=sessionExpired");
          return;
        }

        // Check for extended inactivity
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;

        if (timeSinceLastActivity > inactivityTimeout) {
          console.log("Auto-logout due to extended inactivity");
          await handleInactivityLogout();
          return;
        }

        // Refresh user data if app was in background for more than 5 minutes
        if (timeSinceLastActivity > 5 * 60 * 1000) {
          try {
            await AuthService.autoRefreshUserData();
          } catch (error) {
            console.error("Error refreshing user data on resume:", error);
          }
        }

        // Update activity and reset timer
        updateActivity();
      }
    } catch (error) {
      console.error("Error handling app resume:", error);
    }
  };

  // Handle app going to background
  const handleAppBackground = async () => {
    try {
      // Store current timestamp for resume validation
      await AsyncStorage.setItem("lastBackgroundTime", Date.now().toString());

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } catch (error) {
      console.error("Error handling app background:", error);
    }
  };

  // Pan responder to detect user interactions
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        updateActivity();
        return false; // Don't consume the touch event
      },
      onMoveShouldSetPanResponder: () => {
        updateActivity();
        return false;
      },
      onPanResponderGrant: () => {
        updateActivity();
      },
      onPanResponderMove: () => {
        updateActivity();
      },
    }),
  ).current;

  // Monitor authentication state
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const authState = await AuthService.getAuthState();
        isAuthenticatedRef.current = authState.isAuthenticated;

        if (authState.isAuthenticated) {
          updateActivity();
        } else {
          // Clear timer if not authenticated
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      } catch (error) {
        console.error("Error checking auth state in ActivityMonitor:", error);
        isAuthenticatedRef.current = false;
      }
    };

    checkAuthState();

    // Check auth state periodically
    const authCheckInterval = setInterval(checkAuthState, 2 * 60 * 1000); // Every 2 minutes

    return () => clearInterval(authCheckInterval);
  }, []);

  // Setup app state listener
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => subscription?.remove();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <View {...panResponder.panHandlers} style={{ flex: 1 }}>
      {children}
    </View>
  );
};

/**
 * Hook version of ActivityMonitor for functional components
 */
export const useActivityMonitor = (inactivityTimeout = 30 * 60 * 1000) => {
  const lastActivityRef = useRef(Date.now());
  const timeoutRef = useRef(null);
  const isAuthenticatedRef = useRef(false);

  const updateActivity = () => {
    lastActivityRef.current = Date.now();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isAuthenticatedRef.current) {
      timeoutRef.current = setTimeout(async () => {
        try {
          console.log("Auto-logout due to inactivity (hook)");
          await AsyncStorage.setItem("logoutReason", "inactivity");
          await AuthService.signOut();
          router.replace("/login?reason=inactivity");
        } catch (error) {
          console.error("Error during auto-logout:", error);
          router.replace("/login");
        }
      }, inactivityTimeout);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const authState = await AuthService.getAuthState();
      isAuthenticatedRef.current = authState.isAuthenticated;

      if (authState.isAuthenticated) {
        updateActivity();
      }
    };

    checkAuth();
  }, []);

  return {
    updateActivity,
    lastActivity: lastActivityRef.current,
  };
};

export default ActivityMonitor;
