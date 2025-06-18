import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);

  const handleSignOut = async () => {
    try {
      // Clear all relevant storage
      await AsyncStorage.multiRemove([
        "userToken",
        "userRole",
        "selectedCommunity",
        "selectedApartment",
        "userName",
        "userEmail",
      ]);

      // Navigate to login
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const renderSettingItem = (
    icon,
    title,
    description,
    value,
    onValueChange,
    type = "switch",
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={22} color="#1976D2" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {type === "switch" && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#ccc", true: "#2196F3" }}
          thumbColor={value ? "#fff" : "#f4f3f4"}
          ios_backgroundColor="#ccc"
        />
      )}
      {type === "chevron" && (
        <Ionicons name="chevron-forward" size={22} color="#757575" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderSettingItem(
            "notifications-outline",
            "Push Notifications",
            "Receive notifications about new orders and updates",
            notificationsEnabled,
            setNotificationsEnabled,
          )}
          {renderSettingItem(
            "mail-outline",
            "Email Notifications",
            "Receive important updates via email",
            emailNotificationsEnabled,
            setEmailNotificationsEnabled,
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderSettingItem(
            "moon-outline",
            "Dark Mode",
            "Switch between light and dark themes",
            darkModeEnabled,
            setDarkModeEnabled,
          )}
          {renderSettingItem(
            "color-palette-outline",
            "Customize Theme",
            "Personalize app colors and appearance",
            null,
            null,
            "chevron",
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System</Text>
          {renderSettingItem(
            "refresh-outline",
            "Auto Update",
            "Automatically update inventory and orders",
            autoUpdateEnabled,
            setAutoUpdateEnabled,
          )}
          {renderSettingItem(
            "cloud-upload-outline",
            "Backup Data",
            "Configure automatic data backup",
            null,
            null,
            "chevron",
          )}
          {renderSettingItem(
            "shield-checkmark-outline",
            "Privacy & Security",
            "Manage privacy settings and security options",
            null,
            null,
            "chevron",
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {renderSettingItem(
            "person-outline",
            "Admin Profile",
            "Update your personal information",
            null,
            null,
            "chevron",
          )}
          {renderSettingItem(
            "key-outline",
            "Change Password",
            "Update your account password",
            null,
            null,
            "chevron",
          )}
          {renderSettingItem(
            "people-outline",
            "Manage Accounts",
            "Add or remove admin users",
            null,
            null,
            "chevron",
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {renderSettingItem(
            "information-circle-outline",
            "About Water Delivery App",
            "Version 1.0.0 (Build 102)",
            null,
            null,
            "chevron",
          )}
          {renderSettingItem(
            "document-text-outline",
            "Terms of Service",
            "Review our terms and conditions",
            null,
            null,
            "chevron",
          )}
          {renderSettingItem(
            "help-circle-outline",
            "Help & Support",
            "Get help with using the admin panel",
            null,
            null,
            "chevron",
          )}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 80, // Add padding to avoid content being hidden behind the tab bar
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#757575",
  },
  signOutButton: {
    backgroundColor: "#F44336",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
