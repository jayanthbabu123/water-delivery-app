import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Select from "../components/ui/Select";
import { AuthService } from "../src/services/authService";
import CommunityService from "../src/services/community";
import UserService from "../src/services/user";

export default function SelectCommunityScreen() {
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const windowHeight = Dimensions.get("window").height;

  // Load communities on component mount
  React.useEffect(() => {
    loadCommunities();
  }, []);

  // Load apartments when community is selected
  React.useEffect(() => {
    if (selectedCommunity) {
      loadApartments(selectedCommunity);
      setSelectedApartment(""); // Reset apartment selection
    }
  }, [selectedCommunity]);

  const loadCommunities = async () => {
    try {
      setLoadingData(true);
      let communitiesData = await CommunityService.getCommunities();

      // If no communities exist, create initial communities
      if (communitiesData.length === 0) {
        console.log("No communities found, creating initial data...");
        await CommunityService.createInitialCommunities();
        communitiesData = await CommunityService.getCommunities();
        console.log("Initial communities created and loaded");
      }

      const formattedCommunities =
        CommunityService.formatCommunitiesForSelect(communitiesData);
      setCommunities(formattedCommunities);
    } catch (error) {
      Alert.alert("Error", "Failed to load communities. Please try again.");
      console.error("Error loading communities:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadApartments = async (communityId) => {
    try {
      const apartmentsData = await CommunityService.getApartments(communityId);
      const formattedApartments =
        CommunityService.formatApartmentsForSelect(apartmentsData);
      setApartments(formattedApartments);
    } catch (error) {
      Alert.alert("Error", "Failed to load apartments. Please try again.");
      console.error("Error loading apartments:", error);
    }
  };

  const handleContinue = async () => {
    try {
      setLoading(true);

      // Validate profile data
      const profileData = {
        name: name.trim(),
        email: email.trim(),
        communityId: selectedCommunity,
        apartmentNumber: selectedApartment,
      };

      const validation = UserService.validateProfileData(profileData);
      if (!validation.isValid) {
        Alert.alert("Validation Error", validation.errors.join("\n"));
        setLoading(false);
        return;
      }

      // Get current user ID from AuthService
      const userToken = await AuthService.getCurrentUserToken();
      if (!userToken) {
        Alert.alert("Error", "User session not found. Please login again.");
        router.replace("/login");
        return;
      }

      // Update user profile in Firestore
      await UserService.updateUserProfile(userToken, profileData);

      // Update community selection in AuthService
      await AuthService.updateCommunitySelection(selectedCommunity);

      // Update profile completion status in AuthService
      await AuthService.updateProfileCompletion(profileData);

      // Get updated auth state to determine redirect
      const authState = await AuthService.getAuthState();
      console.log("authState", authState);

      // Always redirect to customer home if unauthenticated or redirect path is missing
      if (authState && typeof authState.redirectTo === "string") {
        router.replace(authState.redirectTo);
      } else {
        // Fallback: treat as customer and go to home
        router.replace("/(customer)/(tabs)/home");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save profile. Please try again.");
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location</Text>
        <View style={styles.placeholderView} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Please provide your details to help us serve you better
          </Text>

          {loadingData && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                Setting up communities data...
              </Text>
            </View>
          )}

          <View style={styles.formContainer}>
            {/* Community Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Community</Text>
              <Select
                value={selectedCommunity}
                options={communities}
                onSelect={setSelectedCommunity}
                placeholder={
                  loadingData
                    ? "Loading communities..."
                    : "Choose your community"
                }
                error={errors.community}
                searchable
                disabled={loadingData}
              />
            </View>

            {/* Apartment Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Apartment</Text>
              <Select
                value={selectedApartment}
                options={apartments}
                onSelect={setSelectedApartment}
                placeholder={
                  !selectedCommunity
                    ? "Select community first"
                    : "Choose your apartment"
                }
                error={errors.apartment}
                disabled={!selectedCommunity || loadingData}
              />
            </View>

            {/* Name Input */}
            <View style={[styles.inputGroup, styles.nameInputGroup]}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.nameInput,
                  errors.name && styles.inputError,
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Email Input */}
            <View style={[styles.inputGroup, styles.emailInputGroup]}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.emailInput,
                  errors.email && styles.inputError,
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                (loading || loadingData) && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={loading || loadingData}
            >
              <Text style={styles.continueButtonText}>
                {loading ? "Saving..." : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    textAlign: "center",
  },
  placeholderView: {
    width: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 0,
  },
  nameInputGroup: {
    marginTop: 16,
    marginBottom: 16,
  },
  emailInputGroup: {
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  nameInput: {
    marginBottom: 0,
  },
  emailInput: {
    marginBottom: 0,
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 2,
    marginLeft: 4,
  },
  buttonContainer: {
    marginTop: 12,
    marginBottom: Platform.OS === "ios" ? 16 : 0,
  },
  continueButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  continueButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  loadingText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
  },
});
