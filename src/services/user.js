import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

// User service for managing user authentication and profile data
export class UserService {
  // Check if user exists in Firestore
  static async checkUserExists(phoneNumber) {
    try {
      const usersRef = firestore().collection("users");
      const querySnapshot = await usersRef
        .where("phoneNumber", "==", phoneNumber)
        .get();

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Ensure profile structure exists
      if (!userData.profile) {
        userData.profile = {
          name: "",
          email: "",
          communityId: "",
          apartmentNumber: "",
          isProfileComplete: false,
        };
      }

      return {
        id: userDoc.id,
        ...userData,
      };
    } catch (error) {
      console.error("Error checking user existence:", error);
      throw new Error("Failed to check user existence");
    }
  }

  // Create new user with phone number
  static async createUser(phoneNumber, firebaseUser) {
    try {
      const userData = {
        userId: firebaseUser.uid,
        phoneNumber: phoneNumber,
        role: "customer",
        profile: {
          name: "",
          email: "",
          communityId: "",
          apartmentNumber: "",
          isProfileComplete: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await firestore().collection("users").doc(firebaseUser.uid).set(userData);

      return userData;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user account");
    }
  }

  // Update user profile with community details
  static async updateUserProfile(userId, profileData) {
    try {
      const updateData = {
        "profile.name": profileData.name,
        "profile.email": profileData.email,
        "profile.communityId": profileData.communityId,
        "profile.apartmentNumber": profileData.apartmentNumber,
        "profile.isProfileComplete": true,
        updatedAt: new Date().toISOString(),
      };

      await firestore().collection("users").doc(userId).update(updateData);

      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update profile");
    }
  }

  // Update last login time
  static async updateLastLogin(userId) {
    try {
      await firestore().collection("users").doc(userId).update({
        lastLoginAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating last login:", error);
      // Don't throw error for login time update failure
    }
  }

  // Get user by ID
  static async getUserById(userId) {
    try {
      const userDoc = await firestore().collection("users").doc(userId).get();

      if (!userDoc.exists) {
        return null;
      }

      const userData = userDoc.data();

      // Ensure profile structure exists
      if (!userData.profile) {
        userData.profile = {
          name: "",
          email: "",
          communityId: "",
          apartmentNumber: "",
          isProfileComplete: false,
        };
      }

      return {
        id: userDoc.id,
        ...userData,
      };
    } catch (error) {
      console.error("Error getting user:", error);
      throw new Error("Failed to get user data");
    }
  }

  // Complete authentication flow
  static async handleUserAuthFlow(phoneNumber, firebaseUser) {
    try {
      // Check if user exists
      let existingUser = await this.checkUserExists(phoneNumber);

      if (existingUser) {
        // User exists - update last login
        await this.updateLastLogin(existingUser.id);
        return {
          isNewUser: false,
          user: existingUser,
          needsProfileCompletion:
            !existingUser.profile || !existingUser.profile.isProfileComplete,
        };
      } else {
        // New user - create account
        const newUser = await this.createUser(phoneNumber, firebaseUser);
        return {
          isNewUser: true,
          user: newUser,
          needsProfileCompletion: true,
        };
      }
    } catch (error) {
      console.error("Error in auth flow:", error);
      throw error;
    }
  }

  // Get navigation route based on user state
  static getNavigationRoute(user, needsProfileCompletion) {
    if (needsProfileCompletion) {
      return "/select-community";
    }

    // Navigate based on role
    switch (user.role) {
      case "customer":
        return "/(customer)/(tabs)/home";
      case "admin":
        return "/(admin)/dashboard";
      case "delivery_partner":
        return "/(delivery)/dashboard";
      default:
        return "/(customer)/(tabs)/home";
    }
  }

  // Validate profile data
  static validateProfileData(profileData) {
    const errors = [];

    if (!profileData.name || profileData.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    if (!profileData.email || !this.isValidEmail(profileData.email)) {
      errors.push("Please enter a valid email address");
    }

    if (!profileData.communityId) {
      errors.push("Please select a community");
    }

    if (!profileData.apartmentNumber) {
      errors.push("Please select an apartment");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Email validation helper
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Sign out user
  static async signOut() {
    try {
      await auth().signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      throw new Error("Failed to sign out");
    }
  }

  // Get current authenticated user
  static getCurrentFirebaseUser() {
    return auth().currentUser;
  }
}

export default UserService;
