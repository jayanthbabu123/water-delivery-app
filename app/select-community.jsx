import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
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
import AsyncStorage from "@react-native-async-storage/async-storage";

import Button from "../components/ui/Button";
import Select from "../components/ui/Select";

// Mock data - In a real app, this would come from an API
const COMMUNITIES = [
  { value: "1", label: "Sunset Gardens" },
  { value: "2", label: "Ocean View Apartments" },
  { value: "3", label: "Mountain Heights" },
  { value: "4", label: "Riverside Residences" },
  { value: "5", label: "Green Valley Complex" },
];

const APARTMENTS = {
  1: [
    { value: "101", label: "Unit 101" },
    { value: "102", label: "Unit 102" },
    { value: "201", label: "Unit 201" },
    { value: "202", label: "Unit 202" },
  ],
  2: [
    { value: "301", label: "Unit 301" },
    { value: "302", label: "Unit 302" },
    { value: "401", label: "Unit 401" },
    { value: "402", label: "Unit 402" },
  ],
  // Add more apartments for other communities
};

export default function SelectCommunityScreen() {
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  const handleContinue = async () => {
    const newErrors = {};
    if (!selectedCommunity) {
      newErrors.community = "Please select a community";
    }
    if (!selectedApartment) {
      newErrors.apartment = "Please select an apartment";
    }
    if (!name.trim()) {
      newErrors.name = "Please enter your name";
    }
    if (!email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Save community selection to storage (in a real app)
      // await AsyncStorage.setItem('selectedCommunity', selectedCommunity);
      // await AsyncStorage.setItem('selectedApartment', selectedApartment);

      // Navigate to tabs (home)
      router.push("/(tabs)/home");
    } catch (error) {
      console.error("Error saving selection:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
            </TouchableOpacity>
            <Text style={styles.title}>Select Location</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Choose your community and apartment number
            </Text>

            <Select
              label="Select Community"
              value={selectedCommunity}
              options={COMMUNITIES}
              onSelect={setSelectedCommunity}
              placeholder="Choose your community"
              error={errors.community}
              searchable
            />

            <Select
              label="Select Apartment"
              value={selectedApartment}
              options={APARTMENTS[selectedCommunity] || []}
              onSelect={setSelectedApartment}
              placeholder="Choose your apartment"
              error={errors.apartment}
              disabled={!selectedCommunity}
            />

            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Continue"
                onPress={handleContinue}
                disabled={
                  !selectedCommunity || !selectedApartment || !name || !email
                }
              />
            </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: "auto",
    paddingTop: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
});
