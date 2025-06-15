import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ui/ScreenHeader";

export default function SupportScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  // Contact information
  const supportEmail = "support@aquaflow.com";
  const supportPhone = "+1 (800) 123-4567";
  const supportHours = "Mon-Fri, 9AM - 6PM EST";

  const handleSubmit = () => {
    // Validate form
    if (!name.trim() || !email.trim() || !message.trim() || !subject.trim()) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    // In a real app, you would send this data to your backend
    // For demo purposes, we'll just show a success message
    Alert.alert(
      "Query Submitted",
      "Thank you for contacting us. We'll get back to you shortly.",
      [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setName("");
            setEmail("");
            setMessage("");
            setSubject("");
          },
        },
      ],
    );
  };

  const handleEmailSupport = () => {
    Linking.openURL(`mailto:${supportEmail}`);
  };

  const handleCallSupport = () => {
    Linking.openURL(`tel:${supportPhone.replace(/[^0-9+]/g, "")}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <ScreenHeader title="Support" showBackButton={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.sectionDescription}>
              Our customer support team is here to help you with any questions
              or concerns.
            </Text>

            <View style={styles.contactCard}>
              <View style={styles.contactItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="mail-outline" size={24} color="#1976D2" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>{supportEmail}</Text>
                </View>
                <TouchableOpacity
                  style={styles.contactAction}
                  onPress={handleEmailSupport}
                >
                  <Text style={styles.contactActionText}>Email Us</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.contactItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="call-outline" size={24} color="#1976D2" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>{supportPhone}</Text>
                </View>
                <TouchableOpacity
                  style={styles.contactAction}
                  onPress={handleCallSupport}
                >
                  <Text style={styles.contactActionText}>Call Us</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.contactItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="time-outline" size={24} color="#1976D2" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Hours</Text>
                  <Text style={styles.contactValue}>{supportHours}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Send a Message</Text>
            <Text style={styles.sectionDescription}>
              Fill out the form below and we will get back to you as soon as
              possible.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="What is your query about?"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="How can we help you?"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
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
    backgroundColor: "#f9f9f9",
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 90 : 70,
  },
  contactSection: {
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  contactAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    borderRadius: 16,
  },
  contactActionText: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
