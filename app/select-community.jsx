import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Select from "../components/ui/Select";

// Mock data - In a real app, this would come from an API
const COMMUNITIES = [
  { label: "Sunset Gardens", value: "sunset_gardens" },
  { label: "Ocean View Apartments", value: "ocean_view" },
  { label: "Mountain Heights", value: "mountain_heights" },
  { label: "Riverside Residences", value: "riverside" },
];

const APARTMENTS = {
  sunset_gardens: [
    { label: "101", value: "101" },
    { label: "102", value: "102" },
    { label: "201", value: "201" },
    { label: "202", value: "202" },
  ],
  ocean_view: [
    { label: "A101", value: "A101" },
    { label: "A102", value: "A102" },
    { label: "B101", value: "B101" },
    { label: "B102", value: "B102" },
  ],
  mountain_heights: [
    { label: "1A", value: "1A" },
    { label: "1B", value: "1B" },
    { label: "2A", value: "2A" },
    { label: "2B", value: "2B" },
  ],
  riverside: [
    { label: "101", value: "101" },
    { label: "102", value: "102" },
    { label: "201", value: "201" },
    { label: "202", value: "202" },
  ],
};

export default function SelectCommunityScreen() {
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const windowHeight = Dimensions.get('window').height;

  const validateForm = () => {
    const newErrors = {};
    if (!selectedCommunity) {
      newErrors.community = "Please select a community";
    }
    if (!selectedApartment) {
      newErrors.apartment = "Please select an apartment";
    }
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (validateForm()) {
      try {
        // Save community selection and user information to storage
        await AsyncStorage.setItem("selectedCommunity", selectedCommunity);
        await AsyncStorage.setItem("selectedApartment", selectedApartment);
        await AsyncStorage.setItem("userName", name);
        await AsyncStorage.setItem("userEmail", email);

        // Navigate to role selection
        router.push("/role-select");
      } catch (error) {
        console.error("Error saving selection:", error);
      }
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

          <View style={styles.formContainer}>
            {/* Community Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Community</Text>
              <Select
                value={selectedCommunity}
                options={COMMUNITIES}
                onSelect={setSelectedCommunity}
                placeholder="Choose your community"
                error={errors.community}
                searchable
              />
            </View>

            {/* Apartment Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Apartment</Text>
              <Select
                value={selectedApartment}
                options={APARTMENTS[selectedCommunity] || []}
                onSelect={setSelectedApartment}
                placeholder="Choose your apartment"
                error={errors.apartment}
                disabled={!selectedCommunity}
              />
            </View>

            {/* Name Input */}
            <View style={[styles.inputGroup, styles.nameInputGroup]}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[styles.input, styles.nameInput, errors.name && styles.inputError]}
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
                style={[styles.input, styles.emailInput, errors.email && styles.inputError]}
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
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
