import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle, G } from "react-native-svg";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const handleSendOTP = () => {
    // In a production app, we would validate phone number and send OTP
    if (!phoneNumber.trim()) {
      alert("Please enter a valid phone number");
      return;
    }

    // Add animation before navigation
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate to OTP verification screen
      router.push("/otp-verification");
    });
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

          {/* Welcome Text */}

          {/* <Text style={styles.subtitleText}>
            Premium water delivery at your doorstep
          </Text>
          <Text style={styles.quoteText}>
            "Pure water, delivered with care, right when you need it."
          </Text> */}

          {/* Phone Input */}
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View
            style={[
              styles.phoneInputContainer,
              isFocused && styles.phoneInputContainerFocused,
            ]}
          >
            <View style={styles.countryCodeContainer}>
              <TextInput
                style={styles.countryCodeInput}
                value={countryCode}
                onChangeText={setCountryCode}
                keyboardType="phone-pad"
                maxLength={4}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              maxLength={10}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            style={[
              styles.sendOTPButton,
              !phoneNumber && styles.sendOTPButtonDisabled,
            ]}
            onPress={handleSendOTP}
            disabled={!phoneNumber.trim()}
          >
            <Text style={styles.sendOTPButtonText}>Continue</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
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
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  gradientBackground: {
    display: "none", // Hide the blue background
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
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 15,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
    letterSpacing: 1,
  },
  logoTextHighlight: {
    color: "#1976D2",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "500",
  },
  quoteText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#1976D2",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
    marginLeft: 4,
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#BBDEFB",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    height: 50,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  phoneInputContainerFocused: {
    borderColor: "#1976D2",
    backgroundColor: "#ffffff",
  },
  countryCodeContainer: {
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  countryCodeInput: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#333",
  },
  sendOTPButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sendOTPButtonDisabled: {
    backgroundColor: "rgba(25, 118, 210, 0.5)",
    elevation: 0,
    shadowOpacity: 0,
  },
  sendOTPButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  termsContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  termsText: {
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.6)",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#007AFF",
    fontWeight: "500",
  },
});
