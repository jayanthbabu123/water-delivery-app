import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { sendOTP, verifyOTP } from "../src/services/auth";
import { AuthService } from "../src/services/authService";

// Utility function to extract user-friendly error messages
const getErrorMessage = (error, isResendError = false) => {
  const errorString = error.toString() || error.message || "";
  const errorCode = error.code;

  if (
    errorCode === "auth/invalid-verification-code" ||
    errorString.includes("auth/invalid-verification-code") ||
    errorString.includes("invalid-verification-code") ||
    errorString.includes("verification code") ||
    errorString.includes("invalid")
  ) {
    return "Invalid OTP. Please check and try again.";
  } else if (
    errorCode === "auth/code-expired" ||
    errorString.includes("auth/code-expired") ||
    errorString.includes("code-expired") ||
    errorString.includes("expired")
  ) {
    return "OTP has expired. Please request a new one.";
  } else if (
    errorCode === "auth/session-expired" ||
    errorString.includes("auth/session-expired") ||
    errorString.includes("session-expired") ||
    errorString.includes("Session expired")
  ) {
    return "Session expired. Please request a new OTP.";
  } else if (
    errorCode === "auth/too-many-requests" ||
    errorString.includes("auth/too-many-requests") ||
    errorString.includes("too-many-requests") ||
    errorString.includes("too many")
  ) {
    return isResendError
      ? "Too many requests. Please wait before trying again."
      : "Too many attempts. Please wait and try again.";
  } else if (
    errorCode === "auth/quota-exceeded" ||
    errorString.includes("quota-exceeded") ||
    errorString.includes("quota")
  ) {
    return "SMS limit reached. Please try again later.";
  } else if (
    errorCode === "auth/invalid-phone-number" ||
    errorString.includes("invalid-phone-number") ||
    errorString.includes("phone number")
  ) {
    return "Invalid phone number. Please check and try again.";
  } else if (
    errorCode === "auth/network-request-failed" ||
    errorString.includes("network") ||
    errorString.includes("connection")
  ) {
    return "Network error. Please check your connection and try again.";
  }

  return isResendError
    ? "Failed to send OTP. Please try again."
    : "Invalid OTP. Please try again.";
};

export default function OTPVerificationScreen() {
  const params = useLocalSearchParams();
  const { phoneNumber, displayNumber } = params;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [confirmation, setConfirmation] = useState(null);

  const inputRefs = useRef([]);
  const windowHeight = Dimensions.get("window").height;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load stored confirmation on mount
    const loadStoredConfirmation = async () => {
      try {
        // Try to get the confirmation object from global storage
        if (global.currentConfirmation) {
          setConfirmation(global.currentConfirmation);
          // Clear the global confirmation to prevent reuse
          global.currentConfirmation = null;
        }
      } catch (error) {
        console.error("Error loading confirmation:", error);
      }
    };

    loadStoredConfirmation();

    let interval;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timer]);

  // Focus first input on mount
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);

    return () => clearTimeout(focusTimer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);

    // Reset opacity to 0 first, then animate to 1
    errorOpacity.setValue(0);

    // Animate error message to show (no auto-hide)
    Animated.timing(errorOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Shake animation
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Vibrate on error
    if (Platform.OS === "ios") {
      Vibration.vibrate([0, 100, 50, 100]);
    } else {
      Vibration.vibrate(100);
    }
  };

  const clearOTP = () => {
    setOtp(["", "", "", "", "", ""]);
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const handleOtpChange = (text, index) => {
    // Clear any existing error when user starts typing
    if (showError) {
      Animated.timing(errorOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowError(false);
        setErrorMessage("");
      });
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (text && index === 5 && newOtp.every((digit) => digit !== "")) {
      setTimeout(() => handleVerify(newOtp), 100);
    }
  };

  const handleKeyPress = (nativeEvent, index) => {
    if (nativeEvent.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async (otpArray = otp) => {
    const otpString = otpArray.join("");

    if (otpString.length !== 6) {
      showErrorMessage("Please enter complete 6-digit OTP");
      return;
    }

    const newAttempt = attempts + 1;
    setAttempts(newAttempt);

    try {
      setLoading(true);

      // Check if we have a stored confirmation
      const confirmationData = await AsyncStorage.getItem("confirmationId");
      if (!confirmationData) {
        showErrorMessage("Session expired. Please request a new OTP.");
        return;
      }

      // Check if we have a stored confirmation object in memory
      if (confirmation) {
        // Verify OTP with stored confirmation
        const firebaseUser = await verifyOTP(confirmation, otpString);

        // Complete authentication using enhanced AuthService
        const authResult = await AuthService.completeAuthentication(
          phoneNumber,
          firebaseUser,
        );

        // Clear temporary OTP data
        await AsyncStorage.removeItem("confirmationId");

        // Success feedback
        if (Platform.OS === "ios") {
          Vibration.vibrate([0, 100]);
        } else {
          Vibration.vibrate(50);
        }

        // Navigate to appropriate screen based on auth result
        router.replace(authResult.redirectTo);
        return;
      } else {
        // No confirmation in memory - need to request new OTP
        throw new Error(
          "Session expired. Please request a new OTP by clicking resend.",
        );
      }
    } catch (error) {
      // Clear OTP inputs on any error
      clearOTP();

      // Handle different error scenarios
      if (newAttempt >= 3) {
        showErrorMessage("Too many failed attempts. Please request a new OTP.");
        setTimer(0);
        setIsTimerActive(false);
      } else {
        const remainingAttempts = 3 - newAttempt;

        // Get user-friendly error message
        const errorMessage = getErrorMessage(error);
        const fullErrorMessage = `${errorMessage} (${remainingAttempts} attempts remaining)`;

        showErrorMessage(fullErrorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      setAttempts(0); // Reset attempts on resend

      // Send new OTP using Firebase
      const newConfirmation = await sendOTP(phoneNumber);

      // Store the confirmation object in memory
      setConfirmation(newConfirmation);

      // Store confirmation data for persistence
      await AsyncStorage.setItem(
        "confirmationId",
        JSON.stringify({
          verificationId: `verification_${Date.now()}`,
          phoneNumber: phoneNumber,
          timestamp: Date.now(),
        }),
      );

      // Reset timer and clear OTP
      setTimer(120);
      setIsTimerActive(true);
      clearOTP();

      // Clear any existing errors
      setShowError(false);
      setErrorMessage("");

      // Success feedback
      Alert.alert(
        "OTP Sent",
        "A new verification code has been sent to your phone.",
        [
          {
            text: "OK",
            onPress: () => {
              setTimeout(() => {
                inputRefs.current[0]?.focus();
              }, 100);
            },
          },
        ],
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error, true);
      Alert.alert("Error", errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleEditNumber = () => {
    Alert.alert(
      "Change Phone Number",
      "Do you want to go back and change your phone number?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Change Number",
          onPress: () => {
            AsyncStorage.removeItem("confirmationId");
            router.back();
          },
        },
      ],
    );
  };

  const isOTPComplete = otp.every((digit) => digit !== "");
  const isVerifyDisabled = !isOTPComplete || loading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubble-ellipses" size={40} color="#1976D2" />
            </View>
            <Text style={styles.title}>Verify Phone Number</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{"\n"}
              <Text style={styles.phoneNumber}>
                {displayNumber || phoneNumber}
              </Text>
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditNumber}
            >
              <Text style={styles.editButtonText}>Wrong number?</Text>
            </TouchableOpacity>
          </View>

          {/* OTP Input Section */}
          <Animated.View
            style={[
              styles.otpSection,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    showError && styles.otpInputError,
                  ]}
                  value={digit}
                  onChangeText={(text) => {
                    const cleanText = text.replace(/\D/g, "");
                    if (cleanText.length <= 1) {
                      handleOtpChange(cleanText, index);
                    }
                  }}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent, index)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                  editable={!loading}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {/* Error Message */}
            {showError && (
              <Animated.View
                style={[styles.errorContainer, { opacity: errorOpacity }]}
              >
                <View style={styles.errorIconContainer}>
                  <Ionicons name="alert-circle" size={18} color="#F44336" />
                </View>
                <View style={styles.errorContentContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              </Animated.View>
            )}
          </Animated.View>

          {/* Timer and Resend Section */}
          <View style={styles.timerSection}>
            {isTimerActive && timer > 0 ? (
              <View style={styles.timerContainer}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.timerText}>
                  Resend code in {formatTime(timer)}
                </Text>
              </View>
            ) : (
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendOTP}
                  disabled={resendLoading}
                >
                  <Text style={styles.resendButtonText}>
                    {resendLoading ? "Sending..." : "Resend OTP"}
                  </Text>
                  {!resendLoading && (
                    <Ionicons name="refresh" size={16} color="#1976D2" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              isVerifyDisabled && styles.verifyButtonDisabled,
            ]}
            onPress={() => handleVerify()}
            disabled={isVerifyDisabled}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Animated.View
                  style={[
                    styles.loadingSpinner,
                    {
                      transform: [
                        {
                          rotate: shakeAnimation.interpolate({
                            inputRange: [-10, 10],
                            outputRange: ["-10deg", "10deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons name="hourglass" size={20} color="#FFFFFF" />
                </Animated.View>
                <Text style={styles.verifyButtonText}>Verifying...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.verifyButtonText}>Verify</Text>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={16} color="#666" />
              <Text style={styles.helpText}>Need help?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  titleSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  phoneNumber: {
    fontWeight: "600",
    color: "#1976D2",
  },
  editButton: {
    marginTop: 8,
    padding: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: "#1976D2",
    textDecorationLine: "underline",
  },
  otpSection: {
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    backgroundColor: "#FAFAFA",
    textAlign: "center",
  },
  otpInputFilled: {
    borderColor: "#1976D2",
    backgroundColor: "#FFFFFF",
  },
  otpInputError: {
    borderColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 8,
    shadowColor: "#F44336",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorIconContainer: {
    marginRight: 12,
    marginTop: 1,
  },
  errorContentContainer: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    color: "#D32F2F",
    lineHeight: 20,
    fontWeight: "500",
  },
  timerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },
  timerText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 8,
    fontWeight: "500",
  },
  resendContainer: {
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 24,
  },
  resendButtonText: {
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "600",
    marginRight: 8,
  },
  verifyButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonDisabled: {
    backgroundColor: "#BDBDBD",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    marginRight: 8,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  helpSection: {
    alignItems: "center",
    paddingBottom: 20,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  helpText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 6,
  },
});
