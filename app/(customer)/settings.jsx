import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            // Clear authentication token
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userRole");

            // Navigate to login
            router.replace("/login");
          } catch (error) {
            console.error("Error signing out:", error);
          }
        },
      },
    ]);
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
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderSettingItem(
            "notifications-outline",
            "Push Notifications",
            "Receive notifications about your orders and delivery updates",
            notificationsEnabled,
            setNotificationsEnabled,
          )}
          {renderSettingItem(
            "mail-outline",
            "Email Notifications",
            "Receive order confirmations and updates via email",
            emailNotificationsEnabled,
            setEmailNotificationsEnabled,
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          {renderSettingItem(
            "moon-outline",
            "Dark Mode",
            "Switch between light and dark themes",
            darkModeEnabled,
            setDarkModeEnabled,
          )}
          {renderSettingItem(
            "location-outline",
            "Location Services",
            "Allow the app to access your location for delivery",
            locationEnabled,
            setLocationEnabled,
          )}
          {renderSettingItem(
            "language-outline",
            "Language",
            "Change the app language",
            null,
            null,
            "chevron",
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons
              name="person-outline"
              size={22}
              color="#1976D2"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Personal Information</Text>
            <Ionicons name="chevron-forward" size={22} color="#757575" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons
              name="home-outline"
              size={22}
              color="#1976D2"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Manage Addresses</Text>
            <Ionicons name="chevron-forward" size={22} color="#757575" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons
              name="key-outline"
              size={22}
              color="#1976D2"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={22} color="#757575" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(customer)/support")}
          >
            <Ionicons
              name="help-circle-outline"
              size={22}
              color="#1976D2"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Help Center</Text>
            <Ionicons name="chevron-forward" size={22} color="#757575" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color="#1976D2"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Contact Support</Text>
            <Ionicons name="chevron-forward" size={22} color="#757575" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color="#1976D2"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Terms & Policies</Text>
            <Ionicons name="chevron-forward" size={22} color="#757575" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Water Delivery App v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
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
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIcon: {
    width: 24,
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
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
  versionInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  versionText: {
    fontSize: 12,
    color: "#757575",
  },
});
