import { 
  PhoneAuthProvider,
  signInWithCredential, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Sends OTP verification code to the provided phone number
 * @param {string} phoneNumber - The phone number to verify (format: +1234567890)
 * @returns {Promise<string>} - The verification ID needed for confirmation
 */
export const sendOTPVerificationCode = async (phoneNumber) => {
  try {
    const phoneProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneProvider.verifyPhoneNumber(
      phoneNumber,
      60 // Timeout duration in seconds
    );
    return verificationId;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

/**
 * Verifies the OTP code and signs in the user
 * @param {string} verificationId - The verification ID from sendOTPVerificationCode
 * @param {string} verificationCode - The OTP code entered by the user
 * @returns {Promise<UserCredential>} - The user credential after successful verification
 */
export const confirmOTPCode = async (verificationId, verificationCode) => {
  try {
    const credential = PhoneAuthProvider.credential(
      verificationId,
      verificationCode
    );
    return await signInWithCredential(auth, credential);
  } catch (error) {
    console.error('Error confirming verification code:', error);
    throw error;
  }
};

/**
 * Gets the current user from Firebase Auth
 * @returns {User|null} - The current user or null if not authenticated
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Checks if a user is currently authenticated
 * @returns {boolean} - True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

/**
 * Signs out the current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Set up auth state listener
export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(callback);
};