import auth from "@react-native-firebase/auth";

// Enhanced validation for Indian phone numbers
export const validateIndianPhoneNumber = (phoneNumber) => {
  // Remove any spaces, hyphens, or special characters
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, "");

  let finalNumber = "";

  // Handle different input formats
  if (cleanNumber.startsWith("91") && cleanNumber.length === 12) {
    // Format: 919876543210
    finalNumber = cleanNumber.substring(2);
  } else if (cleanNumber.startsWith("0") && cleanNumber.length === 11) {
    // Format: 09876543210
    finalNumber = cleanNumber.substring(1);
  } else if (cleanNumber.length === 10) {
    // Format: 9876543210
    finalNumber = cleanNumber;
  } else {
    throw new Error("Please enter a valid 10-digit Indian mobile number");
  }

  // Validate the 10-digit number
  // Indian mobile numbers start with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/;

  if (!indianMobileRegex.test(finalNumber)) {
    throw new Error(
      "Invalid Indian mobile number. It should start with 6, 7, 8, or 9 and be 10 digits long.",
    );
  }

  // Return the number with country code
  return `+91${finalNumber}`;
};

// Format phone number for display (e.g., +91 98765 43210)
export const formatPhoneNumber = (phoneNumber) => {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  if (cleanNumber.length >= 10) {
    const number = cleanNumber.slice(-10);
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  }
  return phoneNumber;
};

// Send OTP using React Native Firebase
export const sendOTP = async (phoneNumber) => {
  try {
    const formattedNumber = validateIndianPhoneNumber(phoneNumber);
    const confirmation = await auth().signInWithPhoneNumber(formattedNumber);
    return confirmation;
  } catch (error) {
    // Handle specific Firebase errors
    if (error.code === "auth/invalid-phone-number") {
      throw new Error("Invalid phone number format");
    } else if (error.code === "auth/missing-phone-number") {
      throw new Error("Phone number is required");
    } else if (error.code === "auth/quota-exceeded") {
      throw new Error("SMS quota exceeded. Please try again later.");
    } else if (error.code === "auth/user-disabled") {
      throw new Error("This phone number has been disabled");
    } else if (error.code === "auth/operation-not-allowed") {
      throw new Error(
        "Phone authentication is not enabled. Please contact support.",
      );
    } else if (error.code === "auth/captcha-check-failed") {
      throw new Error("reCAPTCHA verification failed. Please try again.");
    } else if (error.code === "auth/app-not-authorized") {
      throw new Error("App not authorized for Firebase Authentication");
    } else if (error.code === "auth/too-many-requests") {
      throw new Error("Too many requests. Please try again later.");
    }

    throw new Error(error.message || "Failed to send OTP. Please try again.");
  }
};

// Verify OTP using React Native Firebase
export const verifyOTP = async (confirmation, otp) => {
  try {
    // Validate OTP format
    const cleanOTP = otp.replace(/\D/g, "");
    if (cleanOTP.length !== 6) {
      throw new Error("Please enter a valid 6-digit OTP");
    }

    // Check if confirmation object is valid
    if (!confirmation || typeof confirmation.confirm !== "function") {
      throw new Error(
        "Invalid verification session. Please request a new OTP.",
      );
    }

    // Confirm the verification code
    const userCredential = await confirmation.confirm(cleanOTP);
    return userCredential.user;
  } catch (error) {
    // Handle specific Firebase errors
    if (error.code === "auth/invalid-verification-code") {
      throw new Error("Invalid OTP. Please check and try again.");
    } else if (error.code === "auth/code-expired") {
      throw new Error("OTP has expired. Please request a new one.");
    } else if (error.code === "auth/session-expired") {
      throw new Error("Verification session expired. Please try again.");
    } else if (error.code === "auth/too-many-requests") {
      throw new Error("Too many failed attempts. Please try again later.");
    }

    throw new Error(error.message || "Failed to verify OTP. Please try again.");
  }
};

// Resend OTP
export const resendOTP = async (phoneNumber) => {
  try {
    // Same as sendOTP - Firebase handles rate limiting
    return await sendOTP(phoneNumber);
  } catch (error) {
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    throw new Error("Failed to sign out. Please try again.");
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth().currentUser;
};

// Listen to authentication state changes
export const onAuthStateChanged = (callback) => {
  return auth().onAuthStateChanged(callback);
};

// Check if user is signed in
export const isUserSignedIn = () => {
  return auth().currentUser !== null;
};

// Get user's phone number
export const getUserPhoneNumber = () => {
  const user = auth().currentUser;
  return user ? user.phoneNumber : null;
};

// Update user profile
export const updateUserProfile = async (updates) => {
  try {
    const user = auth().currentUser;
    if (user) {
      await user.updateProfile(updates);
      return user;
    }
    throw new Error("No user signed in");
  } catch (error) {
    throw new Error("Failed to update profile. Please try again.");
  }
};

// Delete user account
export const deleteUserAccount = async () => {
  try {
    const user = auth().currentUser;
    if (user) {
      await user.delete();
    } else {
      throw new Error("No user signed in");
    }
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      throw new Error("Please sign in again before deleting your account");
    }
    throw new Error("Failed to delete account. Please try again.");
  }
};

// Link phone number to existing account
export const linkPhoneNumber = async (phoneNumber) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error("No user signed in");
    }

    const formattedNumber = validateIndianPhoneNumber(phoneNumber);
    const confirmation = await auth().signInWithPhoneNumber(formattedNumber);

    return confirmation;
  } catch (error) {
    throw error;
  }
};

// Unlink phone number from account
export const unlinkPhoneNumber = async () => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error("No user signed in");
    }

    await user.unlink(auth.PhoneAuthProvider.PROVIDER_ID);
  } catch (error) {
    throw new Error("Failed to unlink phone number. Please try again.");
  }
};
