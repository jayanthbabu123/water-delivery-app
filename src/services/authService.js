import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import { UserService } from "./user";

// Enhanced Authentication Service with persistent login functionality
export class AuthService {
  // Storage keys for different authentication data
  static STORAGE_KEYS = {
    USER_TOKEN: "userToken",
    USER_DATA: "userData",
    USER_PHONE: "userPhone",
    USER_ROLE: "userRole",
    SELECTED_COMMUNITY: "selectedCommunity",
    AUTH_STATE: "authState",
    LOGIN_TIMESTAMP: "loginTimestamp",
  };

  // Authentication states
  static AUTH_STATES = {
    AUTHENTICATED: "authenticated",
    UNAUTHENTICATED: "unauthenticated",
    NEEDS_COMMUNITY_SELECTION: "needsCommunitySelection",
    NEEDS_ROLE_SELECTION: "needsRoleSelection",
    PROFILE_INCOMPLETE: "profileIncomplete",
  };

  /**
   * Store complete authentication data after successful login
   */
  static async storeAuthData(userData, firebaseUser) {
    try {
      if (!userData || !firebaseUser) {
        throw new Error("Invalid user data or Firebase user");
      }

      const authData = {
        userId: firebaseUser.uid,
        phoneNumber: userData.phoneNumber || "",
        role: userData.role || "customer",
        profile: userData.profile || {},
        lastLoginAt: new Date().toISOString(),
      };

      // Store individual pieces of data
      await Promise.all([
        AsyncStorage.setItem(this.STORAGE_KEYS.USER_TOKEN, firebaseUser.uid),
        AsyncStorage.setItem(
          this.STORAGE_KEYS.USER_DATA,
          JSON.stringify(authData),
        ),
        AsyncStorage.setItem(
          this.STORAGE_KEYS.USER_PHONE,
          userData.phoneNumber,
        ),
        AsyncStorage.setItem(
          this.STORAGE_KEYS.USER_ROLE,
          userData.role || "customer",
        ),
        AsyncStorage.setItem(
          this.STORAGE_KEYS.LOGIN_TIMESTAMP,
          Date.now().toString(),
        ),
        AsyncStorage.setItem(
          this.STORAGE_KEYS.AUTH_STATE,
          this.getAuthState(userData),
        ),
      ]);

      // Store community selection if available
      if (userData.profile && userData.profile.communityId) {
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.SELECTED_COMMUNITY,
          userData.profile.communityId,
        );
      }

      return true;
    } catch (error) {
      console.error("Error storing auth data:", error);
      throw new Error("Failed to store authentication data");
    }
  }

  /**
   * Get current authentication state
   */
  static async getAuthState() {
    try {
      const [token, userData, role, community] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.USER_TOKEN),
        AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(this.STORAGE_KEYS.USER_ROLE),
        AsyncStorage.getItem(this.STORAGE_KEYS.SELECTED_COMMUNITY),
      ]);

      console.log("AuthService.getAuthState - Raw data:", {
        token: !!token,
        userData: !!userData,
        role,
        community,
      });

      if (!token) {
        console.log("No token found, returning unauthenticated state");
        return {
          isAuthenticated: false,
          authState: this.AUTH_STATES.UNAUTHENTICATED,
          userData: null,
          redirectTo: "/login",
        };
      }

      let parsedUserData = null;
      try {
        parsedUserData = userData ? JSON.parse(userData) : null;
        console.log("Parsed user data:", !!parsedUserData);
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
        // Clear corrupted data and force re-authentication
        await this.clearAuthData();
        return {
          isAuthenticated: false,
          authState: this.AUTH_STATES.UNAUTHENTICATED,
          userData: null,
          redirectTo: "/login",
        };
      }

      // Check if authentication is still valid (24 hours expiry)
      const loginTimestamp = await AsyncStorage.getItem(
        this.STORAGE_KEYS.LOGIN_TIMESTAMP,
      );
      if (loginTimestamp) {
        const loginTime = parseInt(loginTimestamp);
        const currentTime = Date.now();
        const timeDifference = currentTime - loginTime;
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // If login is older than 24 hours, require re-authentication
        if (timeDifference > twentyFourHours) {
          console.log("Session expired (24 hours), clearing auth data");
          await this.clearAuthData();
          return {
            isAuthenticated: false,
            authState: this.AUTH_STATES.UNAUTHENTICATED,
            userData: null,
            redirectTo: "/login",
          };
        }
      }

      // Determine the appropriate state and redirect
      const redirectTo = this.getRedirectPath(parsedUserData, role, community);
      const currentAuthState = this.determineAuthState(
        parsedUserData,
        role,
        community,
      );

      const finalState = {
        isAuthenticated: true,
        authState: currentAuthState,
        userData: parsedUserData,
        userRole: role,
        redirectTo: redirectTo || "/login", // Fallback to login if redirectTo is undefined
      };

      console.log("Final auth state:", {
        isAuthenticated: finalState.isAuthenticated,
        authState: finalState.authState,
        redirectTo: finalState.redirectTo,
      });

      return finalState;
    } catch (error) {
      console.error("Error getting auth state:", error);
      // Return safe default state
      return {
        isAuthenticated: false,
        authState: this.AUTH_STATES.UNAUTHENTICATED,
        userData: null,
        redirectTo: "/login",
        error: error.message,
      };
    }
  }

  /**
   * Determine authentication state based on user data
   */
  static determineAuthState(userData, role, community) {
    if (!userData) {
      return this.AUTH_STATES.UNAUTHENTICATED;
    }

    // Check if community is selected
    if (!community && (!userData.profile || !userData.profile.communityId)) {
      return this.AUTH_STATES.NEEDS_COMMUNITY_SELECTION;
    }

    // Check if role is selected
    if (!role || role === "undefined") {
      return this.AUTH_STATES.NEEDS_ROLE_SELECTION;
    }

    // Check if profile is complete
    if (!userData.profile || !userData.profile.isProfileComplete) {
      return this.AUTH_STATES.PROFILE_INCOMPLETE;
    }

    return this.AUTH_STATES.AUTHENTICATED;
  }

  /**
   * Get redirect path based on user state
   */
  static getRedirectPath(userData, role, community) {
    console.log("getRedirectPath called with:", {
      userData: !!userData,
      role,
      community,
    });

    // Safety check - ensure we always return a valid path
    try {
      if (!userData) {
        console.log("No userData, redirecting to login");
        return "/login";
      }

      // Ensure userData has proper structure
      if (typeof userData !== "object") {
        console.log("Invalid userData type, redirecting to login");
        return "/login";
      }

      // Check if community is selected
      if (!community && (!userData.profile || !userData.profile.communityId)) {
        console.log("No community selected, redirecting to select-community");
        return "/select-community";
      }

      // Check if role is selected
      if (!role || role === "undefined" || role === "null") {
        console.log("No role selected, redirecting to role-select");
        return "/role-select";
      }

      // Check if profile is complete
      if (!userData.profile || !userData.profile.isProfileComplete) {
        console.log("Profile incomplete, redirecting to select-community");
        return "/select-community";
      }

      // Navigate based on role
      let redirectPath;
      switch (role) {
        case "customer":
          redirectPath = "/(customer)/(tabs)/home";
          break;
        case "admin":
          redirectPath = "/(admin)/(tabs)/dashboard";
          break;
        case "delivery":
        case "delivery_partner":
          redirectPath = "/(delivery)/(tabs)/assigned";
          break;
        default:
          console.log("Unknown role, defaulting to customer home");
          redirectPath = "/(customer)/(tabs)/home";
      }

      console.log("Final redirect path:", redirectPath);
      return redirectPath;
    } catch (error) {
      console.error("Error in getRedirectPath:", error);
      return "/login";
    }
  }

  /**
   * Get auth state string based on user data
   */
  static getAuthState(userData) {
    if (!userData) {
      return this.AUTH_STATES.UNAUTHENTICATED;
    }
    if (!userData.profile || !userData.profile.communityId) {
      return this.AUTH_STATES.NEEDS_COMMUNITY_SELECTION;
    }
    if (!userData.role) {
      return this.AUTH_STATES.NEEDS_ROLE_SELECTION;
    }
    if (!userData.profile || !userData.profile.isProfileComplete) {
      return this.AUTH_STATES.PROFILE_INCOMPLETE;
    }
    return this.AUTH_STATES.AUTHENTICATED;
  }

  /**
   * Update user role in storage
   */
  static async updateUserRole(role) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER_ROLE, role);

      // Update user data as well
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (userData) {
        const parsedData = JSON.parse(userData);
        parsedData.role = role;
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.USER_DATA,
          JSON.stringify(parsedData),
        );
      }

      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error("Failed to update user role");
    }
  }

  /**
   * Update community selection in storage
   */
  static async updateCommunitySelection(communityId) {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SELECTED_COMMUNITY,
        communityId,
      );

      // Update user data as well
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (userData) {
        const parsedData = JSON.parse(userData);
        if (!parsedData.profile) {
          parsedData.profile = {};
        }
        parsedData.profile.communityId = communityId;
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.USER_DATA,
          JSON.stringify(parsedData),
        );
      }

      return true;
    } catch (error) {
      console.error("Error updating community selection:", error);
      throw new Error("Failed to update community selection");
    }
  }

  /**
   * Update profile completion status
   */
  static async updateProfileCompletion(profileData) {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (userData) {
        const parsedData = JSON.parse(userData);
        parsedData.profile = {
          ...parsedData.profile,
          ...profileData,
          isProfileComplete: true,
        };
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.USER_DATA,
          JSON.stringify(parsedData),
        );
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.AUTH_STATE,
          this.AUTH_STATES.AUTHENTICATED,
        );
      }

      return true;
    } catch (error) {
      console.error("Error updating profile completion:", error);
      throw new Error("Failed to update profile completion");
    }
  }

  /**
   * Check if user is authenticated (simple check)
   */
  static async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_TOKEN);
      return !!token;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }

  /**
   * Get current user data
   */
  static async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Sync local user data with Firebase auth state
   */
  static async syncWithFirebaseAuth() {
    try {
      const firebaseUser = auth().currentUser;
      const localToken = await AsyncStorage.getItem(
        this.STORAGE_KEYS.USER_TOKEN,
      );

      // If Firebase user exists but no local token, or tokens don't match
      if (firebaseUser && (!localToken || localToken !== firebaseUser.uid)) {
        console.log("Syncing local auth with Firebase auth state");

        // Try to get user data from Firestore
        const userData = await UserService.getUserById(firebaseUser.uid);
        if (userData) {
          await this.storeAuthData(userData, firebaseUser);
          return { synced: true, userData };
        }
      }

      // If local token exists but no Firebase user, clear local data
      if (localToken && !firebaseUser) {
        console.log("Firebase session expired, clearing local auth");
        await this.clearAuthData();
        return { synced: false, cleared: true };
      }

      return { synced: true, noActionNeeded: true };
    } catch (error) {
      console.error("Error syncing with Firebase auth:", error);
      return { synced: false, error: error.message };
    }
  }

  /**
   * Get current user token
   */
  static async getCurrentUserToken() {
    try {
      return await AsyncStorage.getItem(this.STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error("Error getting user token:", error);
      return null;
    }
  }

  /**
   * Get current user phone
   */
  static async getCurrentUserPhone() {
    try {
      return await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PHONE);
    } catch (error) {
      console.error("Error getting user phone:", error);
      return null;
    }
  }

  /**
   * Refresh user data from Firestore
   */
  static async refreshUserData() {
    try {
      const token = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Get fresh user data from Firestore
      const userData = await UserService.getUserById(token);
      if (!userData) {
        throw new Error("User not found");
      }

      // Update stored user data
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData),
      );
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.USER_ROLE,
        userData.role || "customer",
      );

      if (userData.profile && userData.profile.communityId) {
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.SELECTED_COMMUNITY,
          userData.profile.communityId,
        );
      }

      return userData;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      throw error;
    }
  }

  /**
   * Sign out user and clear all authentication data
   */
  static async signOut() {
    try {
      // Sign out from Firebase
      await auth().signOut();

      // Clear all authentication data
      await this.clearAuthData();

      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if Firebase signout fails, clear local data
      await this.clearAuthData();
      throw new Error("Failed to sign out completely");
    }
  }

  /**
   * Clear all authentication data from storage
   */
  static async clearAuthData() {
    try {
      const keys = Object.values(this.STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);

      // Also clear any temporary OTP data
      await AsyncStorage.removeItem("confirmationId");

      // Clear global confirmation if exists
      if (global.currentConfirmation) {
        global.currentConfirmation = null;
      }

      return true;
    } catch (error) {
      console.error("Error clearing auth data:", error);
      throw new Error("Failed to clear authentication data");
    }
  }

  /**
   * Complete authentication flow after OTP verification
   */
  static async completeAuthentication(phoneNumber, firebaseUser) {
    try {
      // Handle complete user authentication flow
      const authResult = await UserService.handleUserAuthFlow(
        phoneNumber,
        firebaseUser,
      );

      // Store authentication data
      await this.storeAuthData(authResult.user, firebaseUser);

      // Update last login in Firestore
      await UserService.updateLastLogin(firebaseUser.uid);

      return {
        success: true,
        authResult,
        redirectTo: this.getRedirectPath(
          authResult.user,
          authResult.user.role,
          authResult.user.profile ? authResult.user.profile.communityId : null,
        ),
      };
    } catch (error) {
      console.error("Error completing authentication:", error);
      throw error;
    }
  }

  /**
   * Validate current session
   */
  static async validateSession() {
    try {
      const authState = await this.getAuthState();

      // If not authenticated, return false
      if (!authState.isAuthenticated) {
        return { isValid: false, reason: "Not authenticated" };
      }

      // Check if Firebase user is still valid
      const currentUser = auth().currentUser;
      if (!currentUser) {
        await this.clearAuthData();
        return { isValid: false, reason: "Firebase session expired" };
      }

      // Session is valid
      return {
        isValid: true,
        authState,
        firebaseUser: currentUser,
      };
    } catch (error) {
      console.error("Error validating session:", error);
      return { isValid: false, reason: "Session validation failed" };
    }
  }

  /**
   * Get debug information about current auth state
   */
  static async getDebugInfo() {
    try {
      const keys = Object.values(this.STORAGE_KEYS);
      const values = await AsyncStorage.multiGet(keys);
      const debugInfo = {};

      values.forEach(([key, value]) => {
        const storageKey = Object.keys(this.STORAGE_KEYS).find(
          (k) => this.STORAGE_KEYS[k] === key,
        );
        debugInfo[storageKey || key] = value;
      });

      debugInfo.FIREBASE_USER = auth().currentUser ? "Present" : "Null";
      debugInfo.GLOBAL_CONFIRMATION = global.currentConfirmation
        ? "Present"
        : "Null";

      return debugInfo;
    } catch (error) {
      console.error("Error getting debug info:", error);
      return { error: error.message };
    }
  }

  /**
   * Initialize authentication state on app start
   */
  static async initializeAuth() {
    try {
      // First sync with Firebase auth state
      const syncResult = await this.syncWithFirebaseAuth();

      // Then get current auth state
      const authState = await this.getAuthState();

      return {
        ...authState,
        syncResult,
        initialized: true,
      };
    } catch (error) {
      console.error("Error initializing auth:", error);
      return {
        isAuthenticated: false,
        authState: this.AUTH_STATES.UNAUTHENTICATED,
        userData: null,
        redirectTo: "/login",
        error: error.message,
        initialized: true,
      };
    }
  }

  /**
   * Auto-refresh user data periodically
   */
  static async autoRefreshUserData() {
    try {
      const isAuth = await this.isAuthenticated();
      if (!isAuth) return;

      const lastRefresh = await AsyncStorage.getItem("lastUserDataRefresh");
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

      // Refresh if no previous refresh or if it's been more than an hour
      if (!lastRefresh || now - parseInt(lastRefresh) > oneHour) {
        await this.refreshUserData();
        await AsyncStorage.setItem("lastUserDataRefresh", now.toString());
        console.log("User data auto-refreshed");
      }
    } catch (error) {
      console.error("Error in auto-refresh:", error);
      // Don't throw error for auto-refresh failures
    }
  }
}

export default AuthService;
