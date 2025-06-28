import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import {
  sendOTP,
  validateIndianPhoneNumber,
  formatPhoneNumber,
} from "../src/services/auth";
import { AuthService } from "../src/services/authService";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  // Check for existing authentication on mount
  React.useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const authState = await AuthService.getAuthState();
        if (authState.isAuthenticated) {
          console.log(
            "User already authenticated, redirecting to:",
            authState.redirectTo,
          );
          router.replace(authState.redirectTo);
          return;
        }
      } catch (error) {
        console.error("Error checking existing auth:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, []);

  const handleSendOTP = async () => {
    try {
      setLoading(true);

      // Check if user is already authenticated (auto-login check)
      const authState = await AuthService.getAuthState();
      if (authState.isAuthenticated) {
        console.log("User already authenticated, redirecting...");
        router.replace(authState.redirectTo);
        return;
      }

      // Validate phone number input
      if (!phoneNumber.trim()) {
        Alert.alert("Error", "Please enter your phone number");
        setLoading(false);
        return;
      }

      // Validate and format phone number for Indian numbers
      let formattedNumber;
      try {
        formattedNumber = validateIndianPhoneNumber(phoneNumber);
      } catch (validationError) {
        Alert.alert("Invalid Phone Number", validationError.message);
        setLoading(false);
        return;
      }

      // Send OTP
      const confirmation = await sendOTP(phoneNumber);

      // Store confirmation data (we can't store the actual confirmation object)
      const confirmationData = {
        verificationId: `verification_${Date.now()}`,
        phoneNumber: formattedNumber,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        "confirmationId",
        JSON.stringify(confirmationData),
      );

      // Store the actual confirmation object in a temporary key for the next screen
      global.currentConfirmation = confirmation;

      // Navigate to OTP verification screen
      router.push(
        `/otp-verification?phoneNumber=${encodeURIComponent(formattedNumber)}&displayNumber=${encodeURIComponent(formatPhoneNumber(formattedNumber))}`,
      );
    } catch (error) {
      let errorMessage = "Failed to send OTP. Please try again.";

      if (error.message.includes("too-many-requests")) {
        errorMessage = "Too many requests. Please wait before trying again.";
      } else if (error.message.includes("quota-exceeded")) {
        errorMessage = "SMS limit reached. Please try again later.";
      } else if (error.message.includes("invalid-phone-number")) {
        errorMessage = "Invalid phone number. Please check and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Subtle water wave animation on mount
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Animation values
  const scaleAnimation = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.05, 1],
  });

  const opacityAnimation = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.8, 1],
  });

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="dark" />
        <View style={styles.loadingContent}>
          <View style={styles.logoCircle}>
            <Ionicons name="water" size={60} color="#1976D2" />
          </View>
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Background Gradient and Wave Patterns */}
      <View style={styles.backgroundContainer}>
        <View style={styles.gradientBackground} />
        <Animated.View
          style={[
            styles.wavesContainer,
            {
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 10],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg height="200" width={Dimensions.get("window").width}>
            <Path
              d="M0,40 C120,100 180,0 300,40 C420,80 480,0 600,40 L600,200 L0,200 Z"
              fill="#007AFF"
              opacity="0.2"
            />
            <Path
              d="M0,80 C100,40 200,120 300,80 C400,40 500,120 600,80 L600,200 L0,200 Z"
              fill="#007AFF"
              opacity="0.3"
            />
          </Svg>
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: scaleAnimation }],
                opacity: opacityAnimation,
              },
            ]}
          >
            <View style={styles.logoCircle}>
              <Ionicons name="water" size={60} color="#1976D2" />
            </View>
            <Text style={styles.logoText}>
              AQUA<Text style={styles.logoTextHighlight}>FLOW</Text>
            </Text>
          </Animated.View>

          {/* Phone Input */}
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View
            style={[
              styles.phoneInputContainer,
              isFocused && styles.phoneInputContainerFocused,
            ]}
          >
            <View style={styles.countryCodeContainer}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={(text) => {
                // Allow only digits and limit to 10 characters
                const cleaned = text.replace(/\D/g, "").slice(0, 10);
                setPhoneNumber(cleaned);
              }}
              placeholder="Enter your 10-digit number"
              keyboardType="phone-pad"
              maxLength={10}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoCompleteType="tel"
              textContentType="telephoneNumber"
            />
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            style={[
              styles.sendOTPButton,
              (!phoneNumber || phoneNumber.length < 10 || loading) &&
                styles.sendOTPButtonDisabled,
            ]}
            onPress={handleSendOTP}
            disabled={!phoneNumber.trim() || phoneNumber.length < 10 || loading}
          >
            <Text style={styles.sendOTPButtonText}>
              {loading ? "Sending OTP..." : "Continue"}
            </Text>
            {!loading && (
              <Ionicons
                name="arrow-forward"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
            )}
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 16,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  gradientBackground: {
    display: "none",
  },
  wavesContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
  },
  logoTextHighlight: {
    color: "#1976D2",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: "#F5F5F5",
  },
  phoneInputContainerFocused: {
    borderColor: "#1976D2",
    backgroundColor: "#FFFFFF",
  },
  countryCodeContainer: {
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "600",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333333",
    backgroundColor: "#FFFFFF",
  },
  sendOTPButton: {
    backgroundColor: "#1976D2",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  sendOTPButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  sendOTPButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  termsContainer: {
    alignItems: "center",
  },
  termsText: {
    textAlign: "center",
    color: "#757575",
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: "#1976D2",
    textDecorationLine: "underline",
  },
});
